import { createServer } from "node:http";
import { readFile, rename, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { Aedes } from "aedes";
import { WebSocketServer, createWebSocketStream } from "ws";
import { createRoomManager } from "./roomManager.js";

const clientRoot = resolve("client");
const scoreboardPath = resolve("server", "scores.json");
const temporaryScoreboardPath = `${scoreboardPath}.tmp`;

async function loadScores() {
  try {
    const scores = JSON.parse(await readFile(scoreboardPath, "utf8"));
    return Array.isArray(scores) ? scores : [];
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Could not read leaderboard scores:", error);
    }
    return [];
  }
}

let scoreWriteQueue = Promise.resolve();
function saveScores(scores) {
  scoreWriteQueue = scoreWriteQueue
    .then(async () => {
      await writeFile(
        temporaryScoreboardPath,
        `${JSON.stringify(scores, null, 2)}\n`,
      );
      await rename(temporaryScoreboardPath, scoreboardPath);
    })
    .catch((error) =>
      console.error("Could not save leaderboard scores:", error),
    );
}

const initialScores = await loadScores();
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
const roomManager = createRoomManager(
  (client, message) => {
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
  },
  { initialScores, onScoresChanged: saveScores },
);
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
