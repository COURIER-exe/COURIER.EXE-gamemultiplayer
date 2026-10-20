export class RoomScene extends Phaser.Scene {
  constructor() {
    super("RoomScene");
    this.room = null;
    this.rooms = [];
    this.screen = "menu";
    this.inputValues = {
      name: "",
      password: "",
      roomId: "",
      joinPassword: "",
    };
    this.inputRules = {
      name: {
        maxLength: 4,
        pattern: /^(?=\p{Script=Latin})\p{Letter}$/u,
        inputMode: "text",
      },
      password: { maxLength: 4, pattern: /^\d$/, inputMode: "numeric" },
      joinPassword: {
        maxLength: 4,
        pattern: /^\d$/,
        inputMode: "numeric",
      },
      roomId: { maxLength: 6, pattern: /^[a-f\d]$/i, inputMode: "text" },
    };
    this.activeInput = null;
    this.message = "";
    this.joinPending = false;
    this.createPending = false;
    this.leaderboardEntries = [];
  }

  create() {
    window.setJoystickVisible?.(false);
    window.setCoordinatesVisible?.(false);
    this.network = window.multiplayer;
    this.createTextInput();
    this.unsubscribers = [
      this.network.on("room", ({ room }) => {
        this.joinPending = false;
        this.createPending = false;
        this.domInput.blur();
        this.room = room;
        this.message = "";
        this.showLobby();
      }),
      this.network.on("rooms", ({ rooms }) => {
        this.rooms = rooms;
        if (this.screen === "public") this.showPublicRooms();
      }),
      this.network.on("leaderboard", ({ entries }) => {
        this.leaderboardEntries = entries;
        if (this.screen === "leaderboard") this.renderLeaderboard();
      }),
      this.network.on("error", ({ message }) => {
        this.joinPending = false;
        this.createPending = false;
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
      this.domInput.removeEventListener("input", this.domInputInputHandler);
      this.domInput.removeEventListener(
        "compositionend",
        this.domInputCompositionHandler,
      );
      this.domInput.removeEventListener(
        "keydown",
        this.domInputKeyHandler,
      );
      this.domInput.blur();
      this.domInput.remove();
    });
    this.showMainMenu();
  }

  createTextInput() {
    this.domInput = document.createElement("input");
    this.domInput.type = "text";
    this.domInput.autocomplete = "off";
    this.domInput.autocapitalize = "characters";
    this.domInput.spellcheck = false;
    this.domInput.setAttribute("aria-label", "Campo de texto do jogo");
    Object.assign(this.domInput.style, {
      position: "fixed",
      left: "-1000px",
      top: "-1000px",
      width: "1px",
      height: "1px",
      boxSizing: "border-box",
      padding: "0",
      margin: "0",
      border: "0",
      outline: "0",
      background: "transparent",
      color: "transparent",
      caretColor: "transparent",
      opacity: "0.01",
      fontSize: "16px",
      zIndex: "1000",
    });
    this.domInputInputHandler = (event) => {
      if (!event.isComposing) this.syncTextInput();
    };
    this.domInputCompositionHandler = () => this.syncTextInput();
    this.domInputKeyHandler = (event) => this.handleDomInputKey(event);
    this.domInput.addEventListener("input", this.domInputInputHandler);
    this.domInput.addEventListener(
      "compositionend",
      this.domInputCompositionHandler,
    );
    this.domInput.addEventListener("keydown", this.domInputKeyHandler);
    document.body.append(this.domInput);
  }

  focusTextInput(key, y) {
    const rule = this.inputRules[key];
    const canvasRect = this.game.canvas.getBoundingClientRect();
    const scaleX = canvasRect.width / this.scale.gameSize.width;
    const scaleY = canvasRect.height / this.scale.gameSize.height;
    this.domInput.maxLength = rule.maxLength;
    this.domInput.inputMode = rule.inputMode;
    this.domInput.enterKeyHint = key === "roomId" ? "go" : "done";
    this.domInput.value = this.inputValues[key];
    this.domInput.style.left = `${canvasRect.left + 467 * scaleX}px`;
    this.domInput.style.top = `${canvasRect.top + (y - 34) * scaleY}px`;
    this.domInput.style.width = `${330 * scaleX}px`;
    this.domInput.style.height = `${68 * scaleY}px`;
    this.domInput.focus();
    this.domInput.setSelectionRange(
      this.domInput.value.length,
      this.domInput.value.length,
    );
  }

  syncTextInput() {
    const key = this.activeInput;
    if (!key) return;
    const rule = this.inputRules[key];
    let value = [...this.domInput.value]
      .filter((character) => rule.pattern.test(character))
      .slice(0, rule.maxLength)
      .join("");
    if (key === "name" || key === "roomId") {
      value = value.toLocaleUpperCase("pt-BR");
    }
    if (this.domInput.value !== value) this.domInput.value = value;
    this.inputValues[key] = value;
    this.refreshScreen();
    if (this.screen === "private") this.maybeJoinPrivateRoom();
  }

  handleDomInputKey(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      this.activeInput = null;
      this.domInput.blur();
      this.showMainMenu();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (this.screen === "create") this.createProtectedRoom();
      if (this.screen === "private") this.joinPrivateRoom();
      return;
    }
    if (event.key !== "Tab") return;
    const fieldsByScreen = {
      private: ["name", "joinPassword", "roomId"],
      create: ["name", "password"],
    };
    const fields = fieldsByScreen[this.screen];
    if (!fields) return;
    event.preventDefault();
    const index = fields.indexOf(this.activeInput);
    const key = fields[(index + 1) % fields.length];
    const y = key === "name" ? 264 : key === "roomId" ? 456 : 364;
    this.activeInput = key;
    this.refreshScreen();
    this.focusTextInput(key, y);
  }

  handleKey(event) {
    if (event.target === this.domInput) return;
    if (event.key === "Escape") {
      this.activeInput = null;
      this.domInput.blur();
      this.showMainMenu();
      return;
    }
    if (!this.activeInput) return;
    if (event.key === "Tab" && this.screen === "private") {
      event.preventDefault();
      const fields = ["name", "joinPassword", "roomId"];
      const index = fields.indexOf(this.activeInput);
      this.activeInput = fields[(index + 1) % fields.length];
      this.refreshScreen();
      return;
    }
    if (event.key === "Tab" && this.screen === "create") {
      event.preventDefault();
      this.activeInput = this.activeInput === "name" ? "password" : "name";
      this.refreshScreen();
      return;
    }
    event.preventDefault();
    const value = this.inputValues[this.activeInput];
    const { maxLength, pattern } = this.inputRules[this.activeInput];
    if (event.key === "Backspace") {
      this.inputValues[this.activeInput] = value.slice(0, -1);
    } else if (event.key === "Enter") {
      if (this.screen === "create") this.createProtectedRoom();
      if (this.screen === "private") this.joinPrivateRoom();
      return;
    } else if (
      event.key.length === 1 &&
      [...value].length < maxLength &&
      pattern.test(event.key)
    ) {
      const character =
        this.activeInput === "name" || this.activeInput === "roomId"
          ? event.key.toLocaleUpperCase("pt-BR")
          : event.key;
      this.inputValues[this.activeInput] += character;
      this.refreshScreen();
      if (this.screen === "private") this.maybeJoinPrivateRoom();
      return;
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
    this.domInput?.blur();
    this.clearScreen("imagemdeopções");
    [
      [632, 246, () => this.showCreate()],
      [632, 342, () => this.showPrivateJoin()],
      [632, 438, () => this.showLeaderboard()],
    ].forEach(([x, y, callback]) => {
      const button = this.add
        .rectangle(x, y, 202, 76, 0xffffff, 0)
        .setInteractive({ useHandCursor: true });
      button.on("pointerdown", callback);
    });
  }

  showCreate() {
    if (this.screen !== "create") this.activeInput = "name";
    this.screen = "create";
    this.clearScreen("criarsala");
    this.addPrivateInput("name", 264);
    this.addPrivateInput("password", 364);
    const createButton = this.add
      .rectangle(632, 156, 202, 76, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    createButton.on("pointerdown", () => this.createProtectedRoom());
    const skipButton = this.add
      .image(522, 510, "botao-x")
      .setCrop(262, 142, 276, 146)
      .setDisplaySize((90 * 800) / 276, (45 * 450) / 146)
      .setOrigin(0.5, 215 / 450)
      .setInteractive(
        new Phaser.Geom.Rectangle(262, 142, 276, 146),
        Phaser.Geom.Rectangle.Contains,
      );
    skipButton.on("pointerdown", () => {
      this.createPending = false;
      this.showMainMenu();
    });
    const playButton = this.add
      .image(742, 510, "botao-play")
      .setCrop(262, 142, 276, 146)
      .setDisplaySize((90 * 800) / 276, (50 * 450) / 146)
      .setOrigin(0.5, 215 / 450)
      .setInteractive(
        new Phaser.Geom.Rectangle(262, 142, 276, 146),
        Phaser.Geom.Rectangle.Contains,
      );
    playButton.on("pointerdown", () => this.createProtectedRoom());
    this.addMessage(600);
  }

  createProtectedRoom() {
    if (this.createPending) return;
    const name = this.inputValues.name.trim().toLocaleUpperCase("pt-BR");
    if (!/^(?:(?=\p{Script=Latin})\p{Letter}){4}$/u.test(name)) {
      this.message = "O nome deve ter exatamente 4 letras.";
      this.refreshScreen();
      return;
    }
    const password = this.inputValues.password.trim();
    if (!/^\d{4}$/.test(password)) {
      this.message = "A senha deve conter exatamente 4 dígitos.";
      this.refreshScreen();
      return;
    }
    this.createRoom(password, name);
  }

  createRoom(password, name) {
    if (!this.network.send("room:create", { name, password })) {
      this.message = "Servidor indisponível. Inicie o servidor multiplayer.";
      this.refreshScreen();
    } else {
      this.createPending = true;
      this.domInput.blur();
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

  showLeaderboard() {
    this.screen = "leaderboard";
    this.leaderboardEntries = [];
    this.renderLeaderboard();
    if (!this.network.send("leaderboard:list")) {
      this.add
        .text(640, 520, "SERVIDOR INDISPONÍVEL", {
          fontFamily: "monospace",
          fontSize: "18px",
          color: "#ff4d5a",
          align: "center",
        })
        .setOrigin(0.5);
    }
  }

  renderLeaderboard() {
    this.clearScreen("placares");
    const skipButton = this.add
      .image(632, 558, "botao-x")
      .setCrop(262, 142, 276, 146)
      .setDisplaySize((90 * 800) / 276, (45 * 450) / 146)
      .setOrigin(0.5, 215 / 450)
      .setInteractive(
        new Phaser.Geom.Rectangle(262, 142, 276, 146),
        Phaser.Geom.Rectangle.Contains,
      );
    skipButton.on("pointerdown", () => this.showMainMenu());

    if (!this.leaderboardEntries.length) {
      this.add
        .text(640, 375, "AINDA SEM REGISTROS", {
          fontFamily: "monospace",
          fontSize: "20px",
          fontStyle: "bold",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);
      return;
    }

    const rowPositions = [318, 378, 438];
    this.leaderboardEntries.forEach((entry, index) => {
      const totalHundredths = Math.floor(entry.durationMs / 10);
      const minutes = Math.floor(totalHundredths / 6000);
      const seconds = Math.floor(totalHundredths / 100) % 60;
      const hundredths = totalHundredths % 100;
      const duration = `${minutes}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
      this.add
        .text(510, rowPositions[index], entry.name, {
          fontFamily: "monospace",
          fontSize: "22px",
          fontStyle: "bold",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);
      this.add
        .text(800, rowPositions[index], duration, {
          fontFamily: "monospace",
          fontSize: "22px",
          fontStyle: "bold",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);
    });
  }

  showPrivateJoin() {
    if (this.screen !== "private") this.activeInput = "name";
    this.screen = "private";
    this.clearScreen("salaprivada");
    this.addPrivateInput("name", 264);
    this.addPrivateInput("joinPassword", 364);
    this.addPrivateInput("roomId", 456);
    const skipButton = this.add
      .image(522, 558, "botao-x")
      .setCrop(262, 142, 276, 146)
      .setDisplaySize((90 * 800) / 276, (45 * 450) / 146)
      .setOrigin(0.5, 215 / 450)
      .setInteractive(
        new Phaser.Geom.Rectangle(262, 142, 276, 146),
        Phaser.Geom.Rectangle.Contains,
      );
    skipButton.on("pointerdown", () => {
      this.joinPending = false;
      this.showMainMenu();
    });
    const playButton = this.add
      .image(742, 558, "botao-play")
      .setCrop(262, 142, 276, 146)
      .setDisplaySize((90 * 800) / 276, (50 * 450) / 146)
      .setOrigin(0.5, 215 / 450)
      .setInteractive(
        new Phaser.Geom.Rectangle(262, 142, 276, 146),
        Phaser.Geom.Rectangle.Contains,
      );
    playButton.on("pointerdown", () => this.joinPrivateRoom());
    this.addMessage(510);
  }

  maybeJoinPrivateRoom() {
    const name = this.inputValues.name.trim();
    const password = this.inputValues.joinPassword.trim();
    const roomId = this.inputValues.roomId.trim();
    if (
      /^(?:(?=\p{Script=Latin})\p{Letter}){4}$/u.test(name) &&
      /^\d{1,4}$/.test(password) &&
      /^[A-F\d]{6}$/.test(roomId)
    ) {
      this.joinPrivateRoom();
    }
  }

  joinPrivateRoom() {
    if (this.joinPending) return;
    const name = this.inputValues.name.trim().toLocaleUpperCase("pt-BR");
    if (!/^(?:(?=\p{Script=Latin})\p{Letter}){4}$/u.test(name)) {
      this.message = "O nome deve ter exatamente 4 letras.";
      this.refreshScreen();
      return;
    }
    if (!this.inputValues.roomId.trim()) {
      this.message = "Digite o ID da sala com 6 caracteres.";
      this.refreshScreen();
      return;
    }
    if (!/^[A-F\d]{6}$/.test(this.inputValues.roomId)) {
      this.message = "O ID da sala deve ter 6 caracteres.";
      this.refreshScreen();
      return;
    }
    const password = this.inputValues.joinPassword.trim();
    if (!/^\d{1,4}$/.test(password)) {
      this.message = "A senha deve conter de 1 a 4 dígitos.";
      this.refreshScreen();
      return;
    }
    const sent = this.network.send("room:join", {
      name,
      roomId: this.inputValues.roomId,
      password,
    });
    if (!sent) {
      this.message = "Servidor indisponível. Inicie o servidor multiplayer.";
      this.refreshScreen();
    } else {
      this.joinPending = true;
      this.domInput.blur();
    }
  }

  showLobby() {
    if (!this.room) return;
    this.screen = "lobby";
    this.activeInput = null;
    this.domInput.blur();
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

  addPrivateInput(key, y) {
    const active = this.activeInput === key;
    const value = this.inputValues[key];
    const input = this.add
      .rectangle(632, y, 330, 68, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(632, y, `${value}${active ? "|" : ""}`, {
        fontFamily: "monospace",
        fontSize: "20px",
        fontStyle: "bold",
        color: active ? "#00e5ff" : "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);
    input.on("pointerdown", () => {
      this.activeInput = key;
      this.message = "";
      this.refreshScreen();
      this.focusTextInput(key, y);
    });
  }

  refreshScreen() {
    if (this.screen === "create") this.showCreate();
    else if (this.screen === "private") this.showPrivateJoin();
    else if (this.screen === "public") this.showPublicRooms();
    else if (this.screen === "leaderboard") this.renderLeaderboard();
    else if (this.screen === "lobby") this.showLobby();
  }
}
