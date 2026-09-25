export class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    this.load.image("imagemdecapa", "assets/imagemdecapa.png");
    this.load.image("imagemdepersonagem", "assets/imagemdepersonagem.png");
  }

  create() {
    this.add.image(640, 360, "imagemdecapa").setDisplaySize(1280, 720);
    this.add.rectangle(640, 360, 1280, 720, 0x05050a, 0.2);

    const playButton = this.add
      .text(640, 610, "PLAY", {
        backgroundColor: "#00d9e8",
        color: "#061014",
        fontFamily: "Arial",
        fontSize: "28px",
        fontStyle: "bold",
        padding: { left: 42, right: 42, top: 16, bottom: 16 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    playButton.on("pointerover", () =>
      playButton.setStyle({ backgroundColor: "#ffffff" }),
    );
    playButton.on("pointerout", () =>
      playButton.setStyle({ backgroundColor: "#00d9e8" }),
    );
    playButton.on("pointerdown", () => {
      playButton.disableInteractive();
      playButton.setVisible(false);
      this.startLoading();
    });
  }

  startLoading() {
    this.children.removeAll(true);
    this.add.rectangle(640, 360, 1280, 720, 0x05050a);
    const progressBar = this.add
      .rectangle(380, 430, 0, 18, 0x00d9e8)
      .setOrigin(0, 0.5);
    this.add
      .rectangle(640, 430, 520, 18)
      .setStrokeStyle(2, 0xffffff, 0.8)
      .setOrigin(0.5);

    this.loadAssets();
    this.load.on("progress", (value) => {
      progressBar.width = 520 * value;
    });
    this.load.once("complete", () => this.scene.start("CharacterSelect"));
    this.load.start();
  }

  loadAssets() {
    this.load.tilemapTiledJSON("mapaCidade", "assets/jogo.json");
    this.load.tilemapTiledJSON("mapaInterior", "assets/map/interior.json");
    this.load.image("interiorTileset0", "texturas/Interiors_32x32_0.png");
    this.load.image("interiorTileset1", "texturas/Interiors_32x32_1.png");
    this.load.image("interiorTileset2", "texturas/Interiors_32x32_2.png");
    this.load.image("seta-construcao", "assets/seta-construcao.svg");

    const images = {
      ground_grass_edge: "map/Grounds/ground_grass_edge.png",
      ground_asphalt: "map/Grounds/ground_asphalt.png",
      ground_grass: "map/Grounds/ground_grass.png",
      ground_grass_side: "map/Grounds/ground_grass_side.png",
      ground_water: "map/Grounds/ground_water.png",
      parking_asphalt: "map/Roads/parking_asphalt.png",
      street_straight: "map/Roads/street_straight.png",
      hospital: "map/Buildings/hospital.png",
      building_01: "map/Buildings/building_01.png",
      building_02: "map/Buildings/building_02.png",
      building_03: "map/Buildings/building_03.png",
      building_04: "map/Buildings/building_04.png",
      church: "map/Buildings/church.png",
      house_01: "map/Buildings/house_01.png",
      house_03: "map/Buildings/house_03.png",
      house_06: "map/Buildings/house_06.png",
      house_11: "map/Buildings/house_11.png",
      house_26: "map/Buildings/house_26.png",
      house_16: "map/Buildings/house_16.png",
      house_23: "map/Buildings/house_23.png",
      police_station: "map/Buildings/police_station.png",
      fire_station: "map/Buildings/fire_station.png",
      bush_01: "map/Vegetations and Props/bush_01.png",
      tree_02: "map/Vegetations and Props/tree_02.png",
      tree_fall_03: "map/Vegetations and Props/tree_fall_03.png",
      parking_striped: "map/Roads/parking_striped.png",
    };

    Object.entries(images).forEach(([key, path]) => {
      this.load.image(key, `assets/${path}`);
    });

    const characterPaths = {
      ciano: "assets/personagens/character-ciano.png",
      branco: "assets/personagens/character-branco.png",
      vermelho: "assets/personagens/character-vermelho.png",
      roxo: "assets/personagens/character-roxo.png",
    };

    Object.entries(characterPaths).forEach(([color, path]) => {
      this.load.spritesheet(`player-${color}`, path, {
        frameWidth: 64,
        frameHeight: 64,
      });
    });
    this.load.spritesheet(
      "robo-perseguicao",
      "assets/personagens/robo-perseguicao.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      },
    );
  }
}
