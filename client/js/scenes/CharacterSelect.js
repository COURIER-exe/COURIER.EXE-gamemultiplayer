export class CharacterSelect extends Phaser.Scene {
  constructor() {
    super("CharacterSelect");
    this.selectedColor = "ciano";
    this.colors = {
      roxo: 0xb36bff,
      ciano: 0x00e5ff,
      branco: 0xffffff,
      vermelho: 0xff4d5a,
    };
  }

  create() {
    window.setJoystickVisible?.(false);
    window.setCoordinatesVisible?.(false);
    this.add.image(640, 360, "imagemdepersonagem").setDisplaySize(1280, 720);
    this.createColorButtons();
  }

  createColorButtons() {
    const options = [
      ["ciano", 256],
      ["roxo", 512],
      ["vermelho", 744],
      ["branco", 976],
    ];
    options.forEach(([color, x]) => {
      const character = this.add
        .rectangle(x, 365, 170, 190, 0xffffff, 0)
        .setInteractive({ useHandCursor: true });
      character.on("pointerover", () => {
        character.setFillStyle(this.colors[color], 0.12);
      });
      character.on("pointerout", () => {
        character.setFillStyle(0xffffff, 0);
      });
      character.on("pointerdown", () => {
        this.selectedColor = color;
        this.showObjectiveScreen();
      });
    });
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
      this.scene.start("GameScene", { color: this.selectedColor });
    });
  }
}
