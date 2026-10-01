import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";
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

  let relativePath;
  try {
    relativePath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
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
      "content-type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    response.end(content);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

const roomManager = createRoomManager((client, message) => {
  if (client.socket.readyState === WebSocket.OPEN) {
    client.socket.send(JSON.stringify(message));
  }
});
const webSockets = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  if (new URL(request.url ?? "/", "http://localhost").pathname !== "/ws") {
    socket.destroy();
    return;
  }
  webSockets.handleUpgrade(request, socket, head, (webSocket) => {
    webSockets.emit("connection", webSocket, request);
  });
});

webSockets.on("connection", (socket) => {
  const client = { id: randomUUID(), socket, roomId: null };
  roomManager.connect(client);
  socket.on("message", (rawMessage) => {
    try {
      roomManager.handleMessage(client, JSON.parse(rawMessage.toString()));
    } catch {
      socket.send(JSON.stringify({ type: "error", message: "Mensagem inválida." }));
    }
  });
  socket.on("close", () => roomManager.disconnect(client));
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, "0.0.0.0", () => {
  console.log(`Courier.exe disponível em http://localhost:${port}`);
});