import { randomBytes } from "node:crypto";

const COLORS = new Set(["ciano", "roxo", "branco", "vermelho"]);
const MAX_PLAYERS = 4;
const MAX_WORLD_COORDINATE = 10000;
const clampWorldCoordinate = (coordinate) =>
  Math.max(-MAX_WORLD_COORDINATE, Math.min(MAX_WORLD_COORDINATE, coordinate));

export function createRoomManager(send) {
  const rooms = new Map();
  const clients = new Set();

  const sendTo = (client, message) => send(client, message);

  const roomFor = (client) => rooms.get(client.roomId);

  const snapshot = (room) => ({
    id: room.id,
    visibility: room.visibility,
    hostId: room.hostId,
    state: room.state,
    gameState: room.gameState,
    robot: room.robot,
    players: room.players.map(
      ({ id, name, color, ready, x, y, moving, flipX }) => ({
        id,
        name,
        color,
        ready,
        x,
        y,
        moving: Boolean(moving),
        flipX: Boolean(flipX),
      }),
    ),
  });

  const broadcastRoom = (room) => {
    const message = { type: "room", room: snapshot(room) };
    room.players.forEach((player) => {
      const client = [...clients].find(
        (candidate) => candidate.id === player.id,
      );
      if (client) sendTo(client, message);
    });
  };

  const broadcastRooms = () => {
    const publicRooms = [...rooms.values()]
      .filter(
        (room) =>
          room.visibility === "public" &&
          room.state === "lobby" &&
          room.players.length < MAX_PLAYERS,
      )
      .map((room) => ({
        id: room.id,
        playerCount: room.players.length,
        maxPlayers: MAX_PLAYERS,
      }));

    clients.forEach((client) =>
      sendTo(client, { type: "rooms", rooms: publicRooms }),
    );
  };

  const error = (client, message) => sendTo(client, { type: "error", message });

  const leaveRoom = (client) => {
    const room = roomFor(client);
    if (!room) return;

    room.players = room.players.filter((player) => player.id !== client.id);
    client.roomId = null;
    if (room.gameState?.carrierId === client.id) {
      room.gameState.carrierId = null;
      room.players.forEach((player) => {
        const other = [...clients].find(
          (candidate) => candidate.id === player.id,
        );
        if (other)
          sendTo(other, { type: "package:state", gameState: room.gameState });
      });
    }
    if (room.players.length === 0) {
      rooms.delete(room.id);
    } else {
      if (room.hostId === client.id) room.hostId = room.players[0].id;
      room.players.forEach((player) => {
        const other = [...clients].find(
          (candidate) => candidate.id === player.id,
        );
        if (other) sendTo(other, { type: "player-left", playerId: client.id });
      });
      broadcastRoom(room);
    }
    broadcastRooms();
  };

  const createRoom = (client, password) => {
    if (client.roomId) return error(client, "Você já está em uma sala.");
    if (
      typeof password !== "string" ||
      (password !== "" && !/^\d{1,4}$/.test(password))
    ) {
      return error(client, "A senha deve conter de 1 a 4 dígitos.");
    }

    let id;
    do {
      id = randomBytes(3).toString("hex").toUpperCase();
    } while (rooms.has(id));

    const player = {
      id: client.id,
      name: "JOGADOR 1",
      color: null,
      ready: false,
      x: null,
      y: null,
      moving: false,
      flipX: false,
    };
    const room = {
      id,
      password,
      visibility: password ? "private" : "public",
      hostId: client.id,
      state: "lobby",
      gameState: { carrierId: null, deliveredBy: null },
      robot: { x: 980, y: 220, moving: false, flipX: false, frame: 7 },
      players: [player],
    };

    rooms.set(id, room);
    client.roomId = id;
    broadcastRoom(room);
    broadcastRooms();
  };

  const joinRoom = (client, roomId, password = "") => {
    if (client.roomId) return error(client, "Você já está em uma sala.");
    const room = rooms.get(
      String(roomId ?? "")
        .trim()
        .toUpperCase(),
    );
    if (!room || room.state !== "lobby") {
      return error(client, "A sala não existe ou já começou.");
    }
    if (room.players.length >= MAX_PLAYERS) {
      return error(client, "A sala está cheia.");
    }
    const submittedPassword = String(password ?? "");
    if (submittedPassword && !/^\d{1,4}$/.test(submittedPassword)) {
      return error(client, "A senha deve conter de 1 a 4 dígitos.");
    }
    if (room.password !== submittedPassword) {
      return error(client, "ID ou senha incorretos.");
    }

    room.players.push({
      id: client.id,
      name: `JOGADOR ${room.players.length + 1}`,
      color: null,
      ready: false,
      x: null,
      y: null,
      moving: false,
      flipX: false,
    });
    client.roomId = room.id;
    broadcastRoom(room);
    broadcastRooms();
  };

  const handleMessage = (client, message) => {
    if (!message || typeof message.type !== "string") {
      return error(client, "Mensagem inválida.");
    }

    switch (message.type) {
      case "rooms:list":
        broadcastRooms();
        break;
      case "room:create":
        createRoom(client, message.password ?? "");
        break;
      case "room:join":
        joinRoom(client, message.roomId, message.password);
        break;
      case "room:leave":
        leaveRoom(client);
        break;
      case "room:start-selection": {
        const room = roomFor(client);
        if (!room || room.hostId !== client.id) {
          return error(client, "Somente o criador pode iniciar a seleção.");
        }
        if (room.state !== "lobby" || room.players.length < 2) {
          return error(client, "A sala precisa de pelo menos 2 jogadores.");
        }
        room.state = "selection";
        broadcastRoom(room);
        room.players.forEach((player) => {
          const member = [...clients].find(
            (candidate) => candidate.id === player.id,
          );
          if (member)
            sendTo(member, { type: "selection-started", room: snapshot(room) });
        });
        broadcastRooms();
        break;
      }
      case "player:select-color": {
        const room = roomFor(client);
        if (
          !room ||
          !["lobby", "selection"].includes(room.state) ||
          !COLORS.has(message.color)
        ) {
          return error(client, "Essa cor não está disponível.");
        }
        if (
          room.players.some(
            (player) =>
              player.id !== client.id && player.color === message.color,
          )
        ) {
          return error(client, "Outro jogador já escolheu essa cor.");
        }
        const player = room.players.find((entry) => entry.id === client.id);
        player.color = message.color;
        player.ready = false;
        broadcastRoom(room);
        break;
      }
      case "player:ready": {
        const room = roomFor(client);
        const player = room?.players.find((entry) => entry.id === client.id);
        if (!room || room.state !== "selection" || !player?.color) {
          return error(client, "Escolha uma cor antes de continuar.");
        }
        player.ready = true;
        broadcastRoom(room);
        if (
          room.players.length >= 2 &&
          room.players.every((entry) => entry.ready)
        ) {
          room.state = "match";
          const startMessage = { type: "game:start", room: snapshot(room) };
          room.players.forEach((entry) => {
            const member = [...clients].find(
              (candidate) => candidate.id === entry.id,
            );
            if (member) sendTo(member, startMessage);
          });
          broadcastRooms();
        }
        break;
      }
      case "player:position": {
        const room = roomFor(client);
        const player = room?.players.find((entry) => entry.id === client.id);
        if (
          !room ||
          room.state !== "match" ||
          !Number.isFinite(message.x) ||
          !Number.isFinite(message.y)
        ) {
          return;
        }
        player.x = clampWorldCoordinate(message.x);
        player.y = clampWorldCoordinate(message.y);
        player.moving = message.moving === true;
        player.flipX = message.flipX === true;
        room.players.forEach((entry) => {
          if (entry.id === client.id) return;
          const member = [...clients].find(
            (candidate) => candidate.id === entry.id,
          );
          if (member)
            sendTo(member, { type: "player:position", player: { ...player } });
        });
        break;
      }
      case "player:trail": {
        const room = roomFor(client);
        const player = room?.players.find((entry) => entry.id === client.id);
        if (
          !room ||
          room.state !== "match" ||
          !player?.color ||
          !Number.isFinite(message.x) ||
          !Number.isFinite(message.y)
        ) {
          return;
        }
        const trail = {
          playerId: client.id,
          x: clampWorldCoordinate(message.x),
          y: clampWorldCoordinate(message.y),
          color: player.color,
        };
        room.players.forEach((entry) => {
          if (entry.id === client.id) return;
          const member = [...clients].find(
            (candidate) => candidate.id === entry.id,
          );
          if (member) sendTo(member, { type: "player:trail", trail });
        });
        break;
      }
      case "robot:position": {
        const room = roomFor(client);
        if (!room || room.state !== "match") return;
        if (room.hostId !== client.id) {
          return error(client, "Somente o criador controla o robô.");
        }
        if (!Number.isFinite(message.x) || !Number.isFinite(message.y)) return;
        room.robot = {
          x: clampWorldCoordinate(message.x),
          y: clampWorldCoordinate(message.y),
          moving: message.moving === true,
          flipX: message.flipX === true,
          frame: Number.isInteger(message.frame) ? message.frame : 7,
        };
        room.players.forEach((entry) => {
          if (entry.id === client.id) return;
          const member = [...clients].find(
            (candidate) => candidate.id === entry.id,
          );
          if (member)
            sendTo(member, { type: "robot:position", robot: room.robot });
        });
        break;
      }
      case "package:collect": {
        const room = roomFor(client);
        if (!room || room.state !== "match") return;
        if (room.gameState.carrierId || room.gameState.deliveredBy) {
          sendTo(client, { type: "package:state", gameState: room.gameState });
          return error(client, "Outro jogador já está com o pacote.");
        }
        room.gameState.carrierId = client.id;
        room.players.forEach((player) => {
          const member = [...clients].find(
            (candidate) => candidate.id === player.id,
          );
          if (member) {
            sendTo(member, {
              type: "package:state",
              gameState: room.gameState,
            });
          }
        });
        break;
      }
      case "package:drop": {
        const room = roomFor(client);
        if (
          !room ||
          room.state !== "match" ||
          room.gameState.carrierId !== client.id
        ) {
          return;
        }
        room.gameState.carrierId = null;
        room.players.forEach((player) => {
          const member = [...clients].find(
            (candidate) => candidate.id === player.id,
          );
          if (member) {
            sendTo(member, {
              type: "package:state",
              gameState: room.gameState,
            });
          }
        });
        break;
      }
      case "package:deliver": {
        const room = roomFor(client);
        if (
          !room ||
          room.state !== "match" ||
          room.gameState.carrierId !== client.id
        ) {
          return error(
            client,
            "Somente quem está com o pacote pode entregá-lo.",
          );
        }
        room.gameState.deliveredBy = client.id;
        room.state = "finished";
        const result = { type: "package:delivered", winnerId: client.id };
        room.players.forEach((player) => {
          const member = [...clients].find(
            (candidate) => candidate.id === player.id,
          );
          if (member) sendTo(member, result);
        });
        broadcastRooms();
        break;
      }
      default:
        error(client, "Ação desconhecida.");
    }
  };

  return {
    connect(client) {
      clients.add(client);
      sendTo(client, { type: "connected", playerId: client.id });
    },
    handleMessage,
    disconnect(client) {
      leaveRoom(client);
      clients.delete(client);
    },
  };
}
