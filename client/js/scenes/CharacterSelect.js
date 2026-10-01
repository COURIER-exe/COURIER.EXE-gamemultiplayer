export class CharacterSelect extends Phaser.Scene {
  constructor() {
    super("CharacterSelect");
    this.selectedColor = null;
    this.multiplayer = false;
    this.room = null;
    this.gameData = null;
    this.colors = {
      roxo: 0xb36bff,
      ciano: 0x00e5ff,
      branco: 0xffffff,
      vermelho: 0xff4d5a,
    };
  }

  init(data = {}) {
    this.multiplayer = data.multiplayer === true;
    this.room = data.room ?? null;
    const ownPlayer = this.room?.players.find(
      (player) => player.id === window.multiplayer?.playerId,
    );
    this.selectedColor = ownPlayer?.color ?? null;
    this.gameData = null;
  }

  create() {
    window.setJoystickVisible?.(false);
    window.setCoordinatesVisible?.(false);
    if (this.multiplayer) {
      const network = window.multiplayer;
      this.unsubscribers = [
        network.on("room", ({ room }) => {
          this.room = room;
          const ownPlayer = room.players.find(
            (player) => player.id === network.playerId,
          );
          this.selectedColor = ownPlayer?.color ?? null;
          this.createColorButtons();
        }),
        network.on("error", ({ message }) => {
          this.selectionError = message;
          this.createColorButtons();
        }),
        network.on("game:start", ({ room }) => {
          this.gameData = { multiplayer: true, room };
          this.showObjectiveScreen();
        }),
      ];
      this.events.once("shutdown", () =>
        this.unsubscribers.forEach((unsubscribe) => unsubscribe()),
      );
    }
    this.createColorButtons();
  }

  createColorButtons() {
    this.children.removeAll(true);
    this.add.image(640, 360, "imagemdepersonagem").setDisplaySize(1280, 720);
    const options = [
      ["ciano", 256],
      ["roxo", 512],
      ["vermelho", 744],
      ["branco", 976],
    ];
    options.forEach(([color, x]) => {
      const ownedByOther =
        this.multiplayer &&
        this.room?.players.some(
          (player) =>
            player.id !== window.multiplayer.playerId && player.color === color,
        );
      const character = this.add.rectangle(
        x,
        365,
        170,
        190,
        this.selectedColor === color ? this.colors[color] : 0xffffff,
        this.selectedColor === color ? 0.14 : 0,
      );
      if (!ownedByOther) character.setInteractive({ useHandCursor: true });
      character.on("pointerover", () => {
        if (!ownedByOther) character.setFillStyle(this.colors[color], 0.12);
      });
      character.on("pointerout", () => {
        character.setFillStyle(
          this.selectedColor === color ? this.colors[color] : 0xffffff,
          this.selectedColor === color ? 0.14 : 0,
        );
      });
      character.on("pointerdown", () => {
        if (ownedByOther) return;
        this.selectedColor = color;
        if (this.multiplayer) {
          this.selectionError = "";
          window.multiplayer.send("player:select-color", { color });
          this.createColorButtons();
        } else {
          this.showObjectiveScreen();
        }
      });
    });

    if (this.multiplayer) {
      const allReady = this.room?.players.every((player) => player.ready);
      this.add
        .text(
          640,
          545,
          allReady ? "TODOS PRONTOS" : "ESCOLHA UMA COR E CONFIRME",
          {
            fontFamily: "Arial",
            fontSize: "22px",
            fontStyle: "bold",
            color: "#00e5ff",
            align: "center",
          },
        )
        .setOrigin(0.5);
      if (this.selectedColor) {
        const readyButton = this.add
          .rectangle(1070, 615, 180, 72, 0xffffff, 0)
          .setStrokeStyle(2, 0x00e5ff)
          .setInteractive({ useHandCursor: true });
        this.add
          .text(1070, 615, "PRONTO", {
            fontFamily: "Arial",
            fontSize: "20px",
            fontStyle: "bold",
            color: "#ffffff",
          })
          .setOrigin(0.5);
        readyButton.on("pointerdown", () =>
          window.multiplayer.send("player:ready"),
        );
      }
      if (this.selectionError) {
        this.add
          .text(640, 590, this.selectionError, {
            fontFamily: "Arial",
            fontSize: "18px",
            color: "#ff4d5a",
            align: "center",
          })
          .setOrigin(0.5);
      }
    }
  }

  showObjectiveScreen() {
    this.children.removeAll(true);
    this.add.image(640, 360, "imagemdeobjetivo").setDisplaySize(1280, 720);

    this.add
      .text(
        610,
        285,
        "1- Explore o mapa e encontre o terminal.\n2- Memorize o codigo do terminal.\n3- Use o codigo para desbloquear a coleta de dados.\n5- Realize a entrega antes dos seus adversarios.\n6- Cuidado com os robos.",
        {
          fontFamily: "Arial",
          fontSize: "21px",
          fontStyle: "bold",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: 620 },
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5)
      .setDepth(1);

    const skipButton = this.add
      .rectangle(1070, 615, 150, 72, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    skipButton.once("pointerdown", () => {
      skipButton.disableInteractive();
      this.scene.start("GameScene", {
        color: this.selectedColor ?? "ciano",
        ...this.gameData,
      });
    });
  }
}
