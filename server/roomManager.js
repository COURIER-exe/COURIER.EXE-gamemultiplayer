import { randomBytes } from "node:crypto";

const COLORS = new Set(["ciano", "roxo", "branco", "vermelho"]);
const BLOCKED_NAME_ROOTS = new Set([
  "anal",
  "bixa",
  "bich",
  "bost",
  "buc",
  "buce",
  "caga",
  "cago",
  "caral",
  "chup",
  "coco",
  "crlh",
  "cuza",
  "fdp",
  "fod",
  "foda",
  "fode",
  "fudi",
  "fudo",
  "fude",
  "goza",
  "goze",
  "krl",
  "mast",
  "merd",
  "pica",
  "pnh",
  "piro",
  "punh",
  "porr",
  "puta",
  "pute",
  "puti",
  "puto",
  "putz",
  "rola",
  "sexy",
  "sexo",
  "tesa",
  "trep",
  "vead",
  "viad",
  "xere",
  "xota",
]);
const MAX_PLAYERS = 4;
const MAX_WORLD_COORDINATE = 10000;
const clampWorldCoordinate = (coordinate) =>
  Math.max(-MAX_WORLD_COORDINATE, Math.min(MAX_WORLD_COORDINATE, coordinate));

function normalizePlayerName(name) {
  if (typeof name !== "string") return null;
  const normalized = name.trim().toLocaleUpperCase("pt-BR");
  if (!/^(?:(?=\p{Script=Latin})\p{Letter}){4}$/u.test(normalized)) {
    return null;
  }

  const root = normalized
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
  if (
    [...BLOCKED_NAME_ROOTS].some((blockedRoot) => root.includes(blockedRoot))
  ) {
    return null;
  }
  return normalized;
}

export function createRoomManager(
  send,
  { now = Date.now, initialScores = [], onScoresChanged = () => {} } = {},
) {
  const rooms = new Map();
  const clients = new Set();
  const scores = initialScores.filter(
    (score) =>
      typeof score.name === "string" &&
      Number.isFinite(score.durationMs) &&
      score.durationMs >= 0 &&
      Number.isFinite(score.completedAt),
  );

  const sendTo = (client, message) => send(client, message);

  const roomFor = (client) => rooms.get(client.roomId);

  const packageStateSnapshot = (gameState) => ({
    ...gameState,
    carriers: { ...gameState.carriers },
    collectedHouseIds: [...gameState.collectedHouseIds],
  });

  const broadcastPackageState = (room) => {
    const message = {
      type: "package:state",
      gameState: packageStateSnapshot(room.gameState),
    };
    room.players.forEach((player) => {
      const client = [...clients].find(
        (candidate) => candidate.id === player.id,
      );
      if (client) sendTo(client, message);
    });
  };

  const releasePackage = (room, playerId) => {
    if (!Object.hasOwn(room.gameState.carriers, playerId)) return false;
    const houseId = room.gameState.carriers[playerId];
    delete room.gameState.carriers[playerId];
    room.gameState.collectedHouseIds = room.gameState.collectedHouseIds.filter(
      (collectedHouseId) => collectedHouseId !== houseId,
    );
    return true;
  };

  const snapshot = (room) => ({
    id: room.id,
    visibility: room.visibility,
    hostId: room.hostId,
    state: room.state,
    gameState: packageStateSnapshot(room.gameState),
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

  const leaderboard = () => {
    return [...scores]
      .sort(
        (first, second) =>
          first.durationMs - second.durationMs ||
          first.completedAt - second.completedAt,
      )
      .slice(0, 3)
      .map(({ name, durationMs }) => ({ name, durationMs }));
  };

  const leaveRoom = (client) => {
    const room = roomFor(client);
    if (!room) return;

    const releasedPackage = releasePackage(room, client.id);
    room.players = room.players.filter((player) => player.id !== client.id);
    client.roomId = null;
    if (room.players.length === 0) {
      rooms.delete(room.id);
    } else {
      if (releasedPackage) broadcastPackageState(room);
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

  const createRoom = (client, password, submittedName) => {
    if (client.roomId) return error(client, "Você já está em uma sala.");
    if (
      typeof password !== "string" ||
      (password !== "" && !/^\d{1,4}$/.test(password))
    ) {
      return error(client, "A senha deve conter de 1 a 4 dígitos.");
    }
    const name = normalizePlayerName(submittedName);
    if (!name) {
      return error(client, "O nome deve ter 4 letras e não pode ser ofensivo.");
    }

    let id;
    do {
      id = randomBytes(3).toString("hex").toUpperCase();
    } while (rooms.has(id));

    const player = {
      id: client.id,
      name,
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
      gameState: {
        carriers: {},
        deliveredBy: null,
        collectedHouseIds: [],
      },
      robot: { x: 980, y: 220, moving: false, flipX: false, frame: 7 },
      players: [player],
    };

    rooms.set(id, room);
    client.roomId = id;
    broadcastRoom(room);
    broadcastRooms();
  };

  const joinRoom = (client, roomId, password = "", submittedName) => {
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
    const name = normalizePlayerName(submittedName);
    if (
      (room.visibility === "private" && !name) ||
      (submittedName !== undefined && !name)
    ) {
      return error(client, "O nome deve ter 4 letras e não pode ser ofensivo.");
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
      name: name ?? `JOGADOR ${room.players.length + 1}`,
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
      case "leaderboard:list":
        sendTo(client, { type: "leaderboard", entries: leaderboard() });
        break;
      case "room:create":
        createRoom(client, message.password ?? "", message.name);
        break;
      case "room:join":
        joinRoom(client, message.roomId, message.password, message.name);
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
          room.startedAt = now();
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
      case "package:state:request": {
        const room = roomFor(client);
        if (!room || room.state !== "match") return;
        sendTo(client, {
          type: "package:state",
          gameState: packageStateSnapshot(room.gameState),
        });
        break;
      }
      case "package:collect": {
        const room = roomFor(client);
        if (!room || room.state !== "match") return;
        const houseId = message.houseId;
        if (!Number.isInteger(houseId) || houseId < 0 || houseId > 1000) {
          return error(client, "Casa de coleta inválida.");
        }
        if (room.gameState.deliveredBy) {
          return error(client, "A partida já foi concluída.");
        }
        if (Object.hasOwn(room.gameState.carriers, client.id)) {
          sendTo(client, {
            type: "package:state",
            gameState: packageStateSnapshot(room.gameState),
          });
          return error(client, "Você já está carregando um pacote.");
        }
        if (room.gameState.collectedHouseIds.includes(houseId)) {
          sendTo(client, {
            type: "package:state",
            gameState: packageStateSnapshot(room.gameState),
          });
          return error(client, "Essa coleta já foi realizada.");
        }
        room.gameState.collectedHouseIds.push(houseId);
        room.gameState.carriers[client.id] = houseId;
        broadcastPackageState(room);
        break;
      }
      case "package:drop": {
        const room = roomFor(client);
        if (!room || room.state !== "match") return;
        if (!releasePackage(room, client.id)) return;
        broadcastPackageState(room);
        break;
      }
      case "package:deliver": {
        const room = roomFor(client);
        if (
          !room ||
          room.state !== "match" ||
          !Object.hasOwn(room.gameState.carriers, client.id)
        ) {
          return error(
            client,
            "Somente quem está com o pacote pode entregá-lo.",
          );
        }
        room.gameState.deliveredBy = client.id;
        room.state = "finished";
        const completedAt = now();
        const winner = room.players.find((player) => player.id === client.id);
        scores.push({
          name: winner.name,
          durationMs: Math.max(0, completedAt - room.startedAt),
          completedAt,
        });
        onScoresChanged(scores.map((score) => ({ ...score })));
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
