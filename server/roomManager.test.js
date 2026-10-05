import assert from "node:assert/strict";
import test from "node:test";
import { createRoomManager } from "./roomManager.js";

function makeClient(id) {
  return { id, messages: [], roomId: null };
}

function createHarness(...clients) {
  const manager = createRoomManager((client, message) => {
    client.messages.push(message);
  });
  clients.forEach((client) => manager.connect(client));
  return manager;
}

function lastMessage(client, type) {
  return client.messages.findLast((message) => message.type === type);
}

test("two players can choose colors in the lobby, ready up, and exchange positions", () => {
  const host = makeClient("host");
  const guest = makeClient("guest");
  const manager = createHarness(host, guest);

  manager.handleMessage(host, { type: "room:create", password: "" });
  const roomId = lastMessage(host, "room").room.id;
  assert.equal(lastMessage(guest, "rooms").rooms[0].id, roomId);
  manager.handleMessage(host, { type: "player:select-color", color: "ciano" });
  assert.equal(lastMessage(host, "room").room.players[0].color, "ciano");

  manager.handleMessage(guest, { type: "room:join", roomId });
  assert.equal(lastMessage(host, "room").room.players.length, 2);
  manager.handleMessage(guest, { type: "player:select-color", color: "roxo" });
  manager.handleMessage(host, { type: "room:start-selection" });
  const selectionRoom = lastMessage(guest, "selection-started").room;
  assert.equal(selectionRoom.state, "selection");
  assert.deepEqual(
    selectionRoom.players.map((player) => player.color),
    ["ciano", "roxo"],
  );

  manager.handleMessage(host, { type: "player:ready" });
  manager.handleMessage(guest, { type: "player:ready" });
  assert.equal(lastMessage(host, "game:start").room.state, "match");
  assert.equal(lastMessage(guest, "game:start").room.state, "match");

  manager.handleMessage(host, {
    type: "player:position",
    x: 345,
    y: 678,
    moving: true,
    flipX: true,
  });
  assert.deepEqual(lastMessage(guest, "player:position").player, {
    id: "host",
    name: "JOGADOR 1",
    color: "ciano",
    ready: true,
    x: 345,
    y: 678,
    moving: true,
    flipX: true,
  });

  const initialRobot = lastMessage(host, "game:start").room.robot;
  host.messages.length = 0;
  guest.messages.length = 0;
  manager.handleMessage(guest, {
    type: "robot:position",
    x: 500,
    y: 600,
  });
  assert.equal(lastMessage(guest, "error").message, "Somente o criador controla o robô.");
  assert.deepEqual(initialRobot, {
    x: 980,
    y: 220,
    moving: false,
    flipX: false,
    frame: 7,
  });

  manager.handleMessage(host, {
    type: "robot:position",
    x: 510,
    y: 620,
    moving: true,
    flipX: true,
    frame: 8,
  });
  assert.deepEqual(lastMessage(guest, "robot:position").robot, {
    x: 510,
    y: 620,
    moving: true,
    flipX: true,
    frame: 8,
  });

  host.messages.length = 0;
  manager.handleMessage(guest, {
    type: "player:trail",
    x: 345,
    y: 678,
  });
  assert.deepEqual(lastMessage(host, "player:trail").trail, {
    playerId: "guest",
    x: 345,
    y: 678,
    color: "roxo",
  });

  manager.handleMessage(host, { type: "package:collect" });
  assert.equal(lastMessage(guest, "package:state").gameState.carrierId, "host");
  manager.handleMessage(guest, { type: "package:collect" });
  assert.equal(
    lastMessage(guest, "error").message,
    "Outro jogador já está com o pacote.",
  );
  assert.equal(lastMessage(guest, "package:state").gameState.carrierId, "host");
  manager.handleMessage(guest, { type: "package:deliver" });
  assert.equal(
    lastMessage(guest, "error").message,
    "Somente quem está com o pacote pode entregá-lo.",
  );
  manager.handleMessage(host, { type: "package:deliver" });
  assert.equal(lastMessage(guest, "package:delivered").winnerId, "host");

  manager.disconnect(guest);
  assert.equal(lastMessage(host, "player-left").playerId, "guest");
  assert.equal(lastMessage(host, "room").room.players.length, 1);
});

test("private rooms reject incorrect passwords and stay out of public listings", () => {
  const host = makeClient("host");
  const guest = makeClient("guest");
  const manager = createHarness(host, guest);

  manager.handleMessage(host, {
    type: "room:create",
    password: "0042",
  });
  const roomId = lastMessage(host, "room").room.id;
  assert.equal(lastMessage(host, "room").room.visibility, "private");

  manager.handleMessage(guest, { type: "rooms:list" });
  assert.deepEqual(lastMessage(guest, "rooms").rooms, []);
  manager.handleMessage(guest, {
    type: "room:join",
    roomId,
    password: "9999",
  });
  assert.equal(lastMessage(guest, "error").message, "ID ou senha incorretos.");

  manager.handleMessage(guest, {
    type: "room:join",
    roomId,
    password: "0042",
  });
  assert.equal(lastMessage(guest, "room").room.players.length, 2);
});

test("private room passwords must contain at most four digits", () => {
  const host = makeClient("host");
  const manager = createHarness(host);

  manager.handleMessage(host, { type: "room:create", password: "12345" });
  assert.equal(
    lastMessage(host, "error").message,
    "A senha deve conter de 1 a 4 dígitos.",
  );
  assert.equal(lastMessage(host, "room"), undefined);

  manager.handleMessage(host, { type: "room:create", password: "12a4" });
  assert.equal(
    lastMessage(host, "error").message,
    "A senha deve conter de 1 a 4 dígitos.",
  );

  manager.handleMessage(host, { type: "room:create", password: "0000" });
  assert.equal(lastMessage(host, "room").room.visibility, "private");
});
