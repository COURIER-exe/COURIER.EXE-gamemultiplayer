export class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    // Texto simples de carregamento
    const loadingText = this.add
      .text(640, 360, "Carregando...", {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#00ffff",
      })
      .setOrigin(0.5);

    // Atualiza o texto conforme o progresso
    this.load.on("progress", (value) => {
      loadingText.setText("Carregando... " + Math.floor(value * 100) + "%");
    });

    // Carrega o mapa criado no Tiled
    this.load.tilemapTiledJSON("mapaCidade", "assets/jogo.json");

    // Carrega as imagens de cada tileset usado no mapa
    this.load.image(
      "ground_grass_edge",
      "assets/map/Grounds/ground_grass_edge.png",
    );

    this.load.image(
      "ground_asphalt",
      "assets/map/Grounds/ground_asphalt.png",
    );

    this.load.image("ground_grass", "assets/map/Grounds/ground_grass.png");

    this.load.image(
      "ground_grass_side",
      "assets/map/Grounds/ground_grass_side.png",
    );

    this.load.image("ground_water", "assets/map/Grounds/ground_water.png");

    this.load.image(
      "parking_asphalt",
      "assets/map/Roads/parking_asphalt.png",
    );

    this.load.image(
      "street_straight",
      "assets/map/Roads/street_straight.png",
    );

    this.load.image("hospital", "assets/map/Buildings/hospital.png");

    this.load.image("building_01", "assets/map/Buildings/building_01.png");

    this.load.image("building_02", "assets/map/Buildings/building_02.png");

    this.load.image("building_03", "assets/map/Buildings/building_03.png");

    this.load.image("building_04", "assets/map/Buildings/building_04.png");

    this.load.image("church", "assets/map/Buildings/church.png");

    this.load.image("house_01", "assets/map/Buildings/house_01.png");

    this.load.image("house_03", "assets/map/Buildings/house_03.png");

    this.load.image("house_06", "assets/map/Buildings/house_06.png");

    this.load.image("house_11", "assets/map/Buildings/house_11.png");

    this.load.image("house_26", "assets/map/Buildings/house_26.png");

    this.load.image("house_16", "assets/map/Buildings/house_16.png");

    this.load.image("house_23", "assets/map/Buildings/house_23.png");

    this.load.image(
      "police_station",
      "assets/map/Buildings/police_station.png",
    );

    this.load.image(
      "fire_station",
      "assets/map/Buildings/fire_station.png",
    );

    this.load.image(
      "bush_01",
      "assets/map/Vegetations and Props/bush_01.png",
    );

    this.load.image(
      "tree_02",
      "assets/map/Vegetations and Props/tree_02.png",
    );

    this.load.image(
      "tree_fall_03",
      "assets/map/Vegetations and Props/tree_fall_03.png",
    );

    this.load.image(
      "parking_striped",
      "assets/map/Roads/parking_striped.png",
    );
  }

  create() {
    console.log("Preloader: mapa e tilesets carregados com sucesso.");

    // Por enquanto seguimos direto para a GameScene,
    // que ainda está igual (com os retângulos).
    this.scene.start("GameScene");
  }
}
