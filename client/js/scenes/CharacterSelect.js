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
        this.scene.start("GameScene", {
          color: this.selectedColor,
        });
      });
    });
  }
}
