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
    this.add.rectangle(640, 360, 1280, 720, 0x07151d);
    this.createColorButtons();
  }

  createColorButtons() {
    const options = [
      ["ROXO", "roxo"],
      ["CIANO", "ciano"],
      ["BRANCO", "branco"],
      ["VERMELHO", "vermelho"],
    ];
    options.forEach(([label, color], index) => {
      const x = 190 + index * 300;
      const swatch = this.add.rectangle(x, 360, 110, 110, this.colors[color])
        .setInteractive({ useHandCursor: true });
      const text = this.add.text(x, 525, label, {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "16px",
        fontStyle: "bold",
      }).setOrigin(0.5);
      swatch.on("pointerdown", () => {
        this.selectedColor = color;
        this.scene.start("GameScene", {
          tint: this.colors[this.selectedColor],
        });
      });
    });
  }
}