import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { Aedes } from "aedes";
import { WebSocketServer, createWebSocketStream } from "ws";
import { createRoomManager } from "./roomManager.js";

const clientRoot = resolve("client");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".tsx": "text/plain; charset=utf-8",
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  if (url.pathname === "/healthz") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }
  if (url.pathname === "/mqtt.min.js") {
    try {
      const script = await readFile(
        resolve("node_modules/mqtt/dist/mqtt.min.js"),
      );
      response.writeHead(200, {
        "content-type": "text/javascript; charset=utf-8",
        "cache-control": "no-cache",
      });
      response.end(script);
    } catch {
      response.writeHead(500).end("MQTT client unavailable");
    }
    return;
  }

  let relativePath;
  try {
    relativePath = decodeURIComponent(
      url.pathname === "/" ? "/index.html" : url.pathname,
    );
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }
  const filePath = resolve(clientRoot, `.${relativePath}`);
  if (filePath !== clientRoot && !filePath.startsWith(`${clientRoot}${sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const content = await readFile(filePath);
    response.writeHead(200, {
      "content-type":
        mimeTypes[extname(filePath)] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    response.end(content);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

const broker = await Aedes.createBroker({
  authorizePublish(client, packet, callback) {
    if (client && packet.topic === "courier/server") return callback(null);
    callback(new Error("Publicação MQTT não autorizada."));
  },
  authorizeSubscribe(client, subscription, callback) {
    if (subscription.topic === `courier/client/${client.id}`) {
      return callback(null, subscription);
    }
    callback(new Error("Inscrição MQTT não autorizada."));
  },
});
const roomManager = createRoomManager((client, message) => {
  broker.publish(
    {
      cmd: "publish",
      topic: `courier/client/${client.id}`,
      payload: Buffer.from(JSON.stringify(message)),
      qos: 0,
      retain: false,
    },
    (error) => {
      if (error) console.error("MQTT delivery error:", error);
    },
  );
});
const webSockets = new WebSocketServer({ noServer: true });
const activeClients = new Map();
const gameClientsByConnection = new WeakMap();

server.on("upgrade", (request, socket, head) => {
  if (new URL(request.url ?? "/", "http://localhost").pathname !== "/mqtt") {
    socket.destroy();
    return;
  }
  webSockets.handleUpgrade(request, socket, head, (webSocket) => {
    broker.handle(createWebSocketStream(webSocket), request);
  });
});

broker.on("clientReady", (mqttClient) => {
  const client = { id: mqttClient.id, roomId: null };
  activeClients.set(mqttClient.id, { mqttClient, client });
  gameClientsByConnection.set(mqttClient, client);
  roomManager.connect(client);
});

broker.on("publish", (packet, mqttClient) => {
  if (!mqttClient || packet.topic !== "courier/server") return;
  const client = gameClientsByConnection.get(mqttClient);
  if (!client) return;

  let message;
  try {
    message = JSON.parse(packet.payload.toString());
  } catch {
    message = null;
  }
  roomManager.handleMessage(client, message);
});

broker.on("clientDisconnect", (mqttClient) => {
  const activeClient = activeClients.get(mqttClient.id);
  if (!activeClient || activeClient.mqttClient !== mqttClient) return;
  activeClients.delete(mqttClient.id);
  const client = gameClientsByConnection.get(mqttClient);
  if (client) roomManager.disconnect(client);
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, "0.0.0.0", () => {
  console.log(`Courier.exe disponível em http://localhost:${port}`);
});
