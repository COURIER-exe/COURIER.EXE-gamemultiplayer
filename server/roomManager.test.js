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

  manager.handleMessage(host, {
    type: "room:create",
    password: "",
    name: "HOST",
  });
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
    x: -345,
    y: -678,
    moving: true,
    flipX: true,
  });
  assert.deepEqual(lastMessage(guest, "player:position").player, {
    id: "host",
    name: "HOST",
    color: "ciano",
    ready: true,
    x: -345,
    y: -678,
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
  assert.equal(
    lastMessage(guest, "error").message,
    "Somente o criador controla o robô.",
  );
  assert.deepEqual(initialRobot, {
    x: 980,
    y: 220,
    moving: false,
    flipX: false,
    frame: 7,
  });

  manager.handleMessage(host, {
    type: "robot:position",
    x: -510,
    y: -620,
    moving: true,
    flipX: true,
    frame: 8,
  });
  assert.deepEqual(lastMessage(guest, "robot:position").robot, {
    x: -510,
    y: -620,
    moving: true,
    flipX: true,
    frame: 8,
  });

  host.messages.length = 0;
  manager.handleMessage(guest, {
    type: "player:trail",
    x: -345,
    y: -678,
  });
  assert.deepEqual(lastMessage(host, "player:trail").trail, {
    playerId: "guest",
    x: -345,
    y: -678,
    color: "roxo",
  });

  manager.handleMessage(host, { type: "package:collect" });
  assert.equal(lastMessage(guest, "package:state").gameState.carrierId, "host");
  manager.handleMessage(guest, { type: "package:drop" });
  assert.equal(lastMessage(guest, "package:state").gameState.carrierId, "host");
  manager.handleMessage(host, { type: "package:drop" });
  assert.equal(lastMessage(guest, "package:state").gameState.carrierId, null);
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
    name: "HOST",
  });
  const roomId = lastMessage(host, "room").room.id;
  assert.equal(lastMessage(host, "room").room.visibility, "private");

  manager.handleMessage(guest, { type: "rooms:list" });
  assert.deepEqual(lastMessage(guest, "rooms").rooms, []);
  manager.handleMessage(guest, {
    type: "room:join",
    roomId,
    password: "9999",
    name: "ANNA",
  });
  assert.equal(lastMessage(guest, "error").message, "ID ou senha incorretos.");

  manager.handleMessage(guest, {
    type: "room:join",
    roomId,
    password: "0042",
    name: "ANNA",
  });
  assert.equal(lastMessage(guest, "room").room.players.length, 2);
  assert.equal(lastMessage(guest, "room").room.players[1].name, "ANNA");
});

test("private rooms require a four-letter name without offensive roots", () => {
  const host = makeClient("host");
  const guest = makeClient("guest");
  const manager = createHarness(host, guest);
  manager.handleMessage(host, {
    type: "room:create",
    password: "1234",
    name: "HOST",
  });
  const roomId = lastMessage(host, "room").room.id;

  for (const name of [
    undefined,
    "ANA",
    "ABCDE",
    "1234",
    "FODA",
    "FÓDE",
    "FODI",
    "FDPX",
    "PICA",
  ]) {
    manager.handleMessage(guest, {
      type: "room:join",
      roomId,
      password: "1234",
      name,
    });
    assert.equal(
      lastMessage(guest, "error").message,
      "O nome deve ter 4 letras e não pode ser ofensivo.",
    );
  }

  manager.handleMessage(guest, {
    type: "room:join",
    roomId,
    password: "1234",
    name: "JOÃO",
  });
  assert.equal(lastMessage(guest, "room").room.players[1].name, "JOÃO");
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

  manager.handleMessage(host, {
    type: "room:create",
    password: "0000",
    name: "HOST",
  });
  assert.equal(lastMessage(host, "room").room.visibility, "private");
});

test("room creation rejects offensive host names and stores valid names", () => {
  const host = makeClient("host");
  const manager = createHarness(host);

  for (const name of ["FODA", "FÓDE", "FODI", "PICA"]) {
    manager.handleMessage(host, {
      type: "room:create",
      password: "1234",
      name,
    });
    assert.equal(
      lastMessage(host, "error").message,
      "O nome deve ter 4 letras e não pode ser ofensivo.",
    );
    assert.equal(lastMessage(host, "room"), undefined);
  }

  manager.handleMessage(host, {
    type: "room:create",
    password: "1234",
    name: "JOÃO",
  });
  assert.equal(lastMessage(host, "room").room.players[0].name, "JOÃO");
});

test("leaderboard ranks recent wins by time and drops results older than 24 hours", () => {
  let currentTime = 1000;
  let savedScores = [];
  const clients = [
    makeClient("host-one"),
    makeClient("guest-one"),
    makeClient("host-two"),
    makeClient("guest-two"),
  ];
  const manager = createRoomManager(
    (client, message) => client.messages.push(message),
    {
      now: () => currentTime,
      onScoresChanged: (scores) => {
        savedScores = scores;
      },
    },
  );
  clients.forEach((client) => manager.connect(client));

  const startMatch = (host, guest) => {
    manager.handleMessage(host, {
      type: "room:create",
      password: "1234",
      name: "HOST",
    });
    const roomId = lastMessage(host, "room").room.id;
    manager.handleMessage(guest, {
      type: "room:join",
      roomId,
      password: "1234",
      name: "GUES",
    });
    manager.handleMessage(host, {
      type: "player:select-color",
      color: "ciano",
    });
    manager.handleMessage(guest, {
      type: "player:select-color",
      color: "roxo",
    });
    manager.handleMessage(host, { type: "room:start-selection" });
    manager.handleMessage(host, { type: "player:ready" });
    manager.handleMessage(guest, { type: "player:ready" });
  };

  startMatch(clients[0], clients[1]);
  currentTime = 11000;
  manager.handleMessage(clients[0], { type: "package:collect" });
  manager.handleMessage(clients[0], { type: "package:deliver" });

  currentTime = 20000;
  startMatch(clients[2], clients[3]);
  currentTime = 22500;
  manager.handleMessage(clients[3], { type: "package:collect" });
  manager.handleMessage(clients[3], { type: "package:deliver" });

  manager.handleMessage(clients[3], { type: "leaderboard:list" });
  assert.deepEqual(lastMessage(clients[3], "leaderboard").entries, [
    { name: "GUES", durationMs: 2500 },
    { name: "HOST", durationMs: 10000 },
  ]);
  assert.equal(savedScores.length, 2);

  currentTime = 24 * 60 * 60 * 1000 + 11001;
  manager.handleMessage(clients[3], { type: "leaderboard:list" });
  assert.deepEqual(lastMessage(clients[3], "leaderboard").entries, [
    { name: "GUES", durationMs: 2500 },
  ]);
  assert.equal(savedScores.length, 1);
});
