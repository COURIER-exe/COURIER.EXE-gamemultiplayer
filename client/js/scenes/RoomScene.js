export class RoomScene extends Phaser.Scene {
  constructor() {
    super("RoomScene");
    this.room = null;
    this.rooms = [];
    this.screen = "menu";
    this.inputValues = { password: "", roomId: "", joinPassword: "" };
    this.activeInput = null;
    this.message = "";
  }

  create() {
    window.setJoystickVisible?.(false);
    window.setCoordinatesVisible?.(false);
    this.network = window.multiplayer;
    this.unsubscribers = [
      this.network.on("room", ({ room }) => {
        this.room = room;
        this.message = "";
        this.showLobby();
      }),
      this.network.on("rooms", ({ rooms }) => {
        this.rooms = rooms;
        if (this.screen === "public") this.showPublicRooms();
      }),
      this.network.on("error", ({ message }) => {
        this.message = message;
        this.refreshScreen();
      }),
      this.network.on("selection-started", ({ room }) => {
        this.room = room;
        this.scene.start("CharacterSelect", { multiplayer: true, room });
      }),
    ];
    this.input.keyboard.on("keydown", this.handleKey, this);
    this.events.once("shutdown", () => {
      this.unsubscribers.forEach((unsubscribe) => unsubscribe());
      this.input.keyboard.off("keydown", this.handleKey, this);
    });
    this.showMainMenu();
  }

  handleKey(event) {
    if (event.key === "Escape") {
      this.activeInput = null;
      this.showMainMenu();
      return;
    }
    if (!this.activeInput) return;
    event.preventDefault();
    const value = this.inputValues[this.activeInput];
    const isPasswordInput =
      this.activeInput === "password" || this.activeInput === "joinPassword";
    const maxLength = isPasswordInput ? 4 : 32;
    if (event.key === "Backspace") {
      this.inputValues[this.activeInput] = value.slice(0, -1);
    } else if (event.key === "Enter") {
      if (this.screen === "create") this.createProtectedRoom();
      if (this.screen === "private") this.joinPrivateRoom();
      return;
    } else if (
      event.key.length === 1 &&
      value.length < maxLength &&
      (!isPasswordInput || /^\d$/.test(event.key))
    ) {
      this.inputValues[this.activeInput] += event.key;
    }
    this.refreshScreen();
  }

  clearScreen(background = "imagemdefundo") {
    this.children.removeAll(true);
    this.add.image(640, 360, background).setDisplaySize(1280, 720);
  }

  addButton(x, y, width, height, label, callback, color = 0x00e5ff) {
    const button = this.add
      .rectangle(x, y, width, height, 0x000000, 0.18)
      .setStrokeStyle(2, color)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: "Arial",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: width - 20 },
      })
      .setOrigin(0.5);
    button.on("pointerover", () => button.setFillStyle(color, 0.28));
    button.on("pointerout", () => button.setFillStyle(0x000000, 0.18));
    button.on("pointerdown", callback);
    return { button, text };
  }

  addMessage(y = 605) {
    if (!this.message) return;
    this.add
      .text(640, y, this.message, {
        fontFamily: "Arial",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#ff4d5a",
        align: "center",
        wordWrap: { width: 760 },
      })
      .setOrigin(0.5);
  }

  showMainMenu() {
    this.screen = "menu";
    this.message = "";
    this.activeInput = null;
    this.clearScreen("imagemdeopções");
    [
      [632, 246, "SALA COM SENHA", () => this.showCreate()],
      [632, 342, "SALA PÚBLICA", () => this.openPublicRooms()],
      [632, 438, "SALA PRIVADA", () => this.showPrivateJoin()],
    ].forEach(([x, y, label, callback]) => {
      const button = this.add
        .rectangle(x, y, 202, 76, 0xffffff, 0)
        .setInteractive({ useHandCursor: true });
      button.on("pointerdown", callback);
    });
  }

  showCreate() {
    this.screen = "create";
    this.clearScreen();
    this.addTitle("CRIAR SALA");
    this.addInput("password", "SENHA (1 A 4 DÍGITOS)", 280);
    this.addButton(640, 410, 330, 68, "CRIAR SALA", () =>
      this.createProtectedRoom(),
    );
    this.addButton(640, 510, 200, 56, "VOLTAR", () => this.showMainMenu());
    this.addMessage();
  }

  createProtectedRoom() {
    const password = this.inputValues.password.trim();
    if (!/^\d{1,4}$/.test(password)) {
      this.message = "A senha deve conter de 1 a 4 dígitos.";
      this.refreshScreen();
      return;
    }
    this.createRoom(password);
  }

  createRoom(password) {
    if (!this.network.send("room:create", { password })) {
      this.message = "Servidor indisponível. Inicie o servidor multiplayer.";
      this.refreshScreen();
    }
  }

  openPublicRooms() {
    this.screen = "public";
    this.rooms = [];
    this.message = "Buscando salas abertas...";
    if (!this.network.send("rooms:list")) {
      this.message = "Servidor indisponível. Inicie o servidor multiplayer.";
    }
    this.showPublicRooms();
  }

  showPublicRooms() {
    this.screen = "public";
    this.clearScreen();
    this.addTitle("SALAS PÚBLICAS");
    if (!this.rooms.length) {
      this.addLabel("NENHUMA SALA ABERTA DISPONÍVEL", 300);
    } else {
      this.rooms.slice(0, 5).forEach((room, index) => {
        this.addButton(
          640,
          220 + index * 70,
          440,
          58,
          `${room.id}    ${room.playerCount}/${room.maxPlayers} JOGADORES`,
          () => this.network.send("room:join", { roomId: room.id }),
        );
      });
    }
    this.addButton(640, 590, 215, 58, "ATUALIZAR", () =>
      this.network.send("rooms:list"),
    );
    this.addButton(900, 590, 215, 58, "VOLTAR", () => this.showMainMenu());
    this.addMessage(660);
  }

  showPrivateJoin() {
    this.screen = "private";
    this.clearScreen();
    this.addTitle("ENTRAR EM SALA PRIVADA");
    this.addInput("roomId", "ID DA SALA", 230);
    this.addInput("joinPassword", "SENHA (1 A 4 DÍGITOS)", 330);
    this.addButton(640, 445, 300, 64, "ENTRAR NA SALA", () =>
      this.joinPrivateRoom(),
    );
    this.addButton(640, 535, 200, 56, "VOLTAR", () => this.showMainMenu());
    this.addMessage(620);
  }

  joinPrivateRoom() {
    if (!this.inputValues.roomId.trim()) {
      this.message = "Digite o ID da sala.";
      this.refreshScreen();
      return;
    }
    const password = this.inputValues.joinPassword.trim();
    if (!/^\d{1,4}$/.test(password)) {
      this.message = "A senha deve conter de 1 a 4 dígitos.";
      this.refreshScreen();
      return;
    }
    if (
      !this.network.send("room:join", {
        roomId: this.inputValues.roomId,
        password,
      })
    ) {
      this.message = "Servidor indisponível. Inicie o servidor multiplayer.";
      this.refreshScreen();
    }
  }

  showLobby() {
    if (!this.room) return;
    this.screen = "lobby";
    this.activeInput = null;
    this.clearScreen();
    this.addTitle("SALA " + this.room.id);
    this.addLabel(
      `${this.room.visibility === "public" ? "ABERTA" : "PROTEGIDA"}  |  ${this.room.players.length}/4 JOGADORES`,
      160,
    );
    this.room.players.forEach((player, index) => {
      const color = player.color
        ? player.color.toUpperCase()
        : "ESCOLHENDO COR";
      this.addButton(
        640,
        220 + index * 54,
        470,
        46,
        `${player.name}  |  ${color}  |  ${player.ready ? "PRONTO" : "AGUARDANDO"}`,
        () => {},
        player.ready ? 0x39d98a : 0x00e5ff,
      );
    });

    const isHost = this.room.hostId === this.network.playerId;
    if (isHost) {
      const canStart = this.room.players.length >= 2;
      this.addButton(
        640,
        565,
        300,
        56,
        canStart ? "INICIAR SELEÇÃO" : "AGUARDANDO JOGADORES",
        () => {
          if (!canStart) return;
          if (!this.network.send("room:start-selection")) {
            this.message = "Conexão perdida com o servidor.";
            this.showLobby();
          }
        },
        canStart ? 0x00e5ff : 0x555555,
      );
    } else {
      this.addLabel("AGUARDANDO O CRIADOR INICIAR", 565);
    }
    this.addButton(
      640,
      640,
      180,
      50,
      "SAIR",
      () => {
        this.network.send("room:leave");
        this.room = null;
        this.showMainMenu();
      },
      0xff4d5a,
    );
    this.addMessage(695);
  }

  addTitle(label) {
    this.add
      .text(640, 140, label, {
        fontFamily: "Arial",
        fontSize: "30px",
        fontStyle: "bold",
        color: "#00e5ff",
        align: "center",
      })
      .setOrigin(0.5);
  }

  addLabel(label, y) {
    this.add
      .text(640, y, label, {
        fontFamily: "Arial",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);
  }

  addInput(key, label, y) {
    const active = this.activeInput === key;
    this.addButton(
      640,
      y,
      440,
      60,
      `${active ? "> " : ""}${this.inputValues[key] || label}`,
      () => {
        this.activeInput = key;
        this.message = "Digite usando o teclado e pressione Enter.";
        this.refreshScreen();
      },
      active ? 0xb36bff : 0x00e5ff,
    );
  }

  refreshScreen() {
    if (this.screen === "create") this.showCreate();
    else if (this.screen === "private") this.showPrivateJoin();
    else if (this.screen === "public") this.showPublicRooms();
    else if (this.screen === "lobby") this.showLobby();
  }
}
