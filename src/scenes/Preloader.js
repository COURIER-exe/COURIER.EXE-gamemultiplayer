import Phaser from "phaser";

export class Preloader extends Phaser.Scene {
    constructor() {
        super("Preloader");
    }

    preload() {
        // Texto simples de carregamento
        const loadingText = this.add.text(
            640,
            360,
            "Carregando...",
            {
                fontFamily: "Arial",
                fontSize: "28px",
                color: "#00ffff"
            }
        ).setOrigin(0.5);

        // Atualiza o texto conforme o progresso
        this.load.on("progress", (value) => {
            loadingText.setText(
                "Carregando... " + Math.floor(value * 100) + "%"
            );
        });

        // Carrega o mapa criado no Tiled
        this.load.tilemapTiledJSON(
            "mapaCidade",
            "assets/jogo.json"
        );

        // Carrega as imagens de cada tileset usado no mapa
        this.load.image(
            "ground_grass_edge",
            "assets/u_040123/Grounds/ground_grass_edge.png"
        );

        this.load.image(
            "ground_asphalt",
            "assets/u_040123/Grounds/ground_asphalt.png"
        );

        this.load.image(
            "ground_grass",
            "assets/u_040123/Grounds/ground_grass.png"
        );

        this.load.image(
            "ground_grass_side",
            "assets/u_040123/Grounds/ground_grass_side.png"
        );

        this.load.image(
            "ground_water",
            "assets/u_040123/Grounds/ground_water.png"
        );

        this.load.image(
            "parking_asphalt",
            "assets/u_040123/Roads/parking_asphalt.png"
        );

        this.load.image(
            "street_straight",
            "assets/u_040123/Roads/street_straight.png"
        );

        this.load.image(
            "hospital",
            "assets/u_040123/Buildings/hospital.png"
        );

        this.load.image(
            "building_01",
            "assets/u_040123/Buildings/building_01.png"
        );

        this.load.image(
            "building_02",
            "assets/u_040123/Buildings/building_02.png"
        );

        this.load.image(
            "building_03",
            "assets/u_040123/Buildings/building_03.png"
        );

        this.load.image(
            "building_04",
            "assets/u_040123/Buildings/building_04.png"
        );

        this.load.image(
            "church",
            "assets/u_040123/Buildings/church.png"
        );

        this.load.image(
            "house_01",
            "assets/u_040123/Buildings/house_01.png"
        );

        this.load.image(
            "house_03",
            "assets/u_040123/Buildings/house_03.png"
        );

        this.load.image(
            "house_06",
            "assets/u_040123/Buildings/house_06.png"
        );

        this.load.image(
            "house_11",
            "assets/u_040123/Buildings/house_11.png"
        );

        this.load.image(
            "house_26",
            "assets/u_040123/Buildings/house_26.png"
        );

        this.load.image(
            "house_16",
            "assets/u_040123/Buildings/house_16.png"
        );

        this.load.image(
            "house_23",
            "assets/u_040123/Buildings/house_23.png"
        );

        this.load.image(
            "police_station",
            "assets/u_040123/Buildings/police_station.png"
        );

        this.load.image(
            "fire_station",
            "assets/u_040123/Buildings/fire_station.png"
        );

        this.load.image(
            "bush_01",
            "assets/u_040123/Vegetations and Props/bush_01.png"
        );

        this.load.image(
            "tree_02",
            "assets/u_040123/Vegetations and Props/tree_02.png"
        );

        this.load.image(
            "tree_fall_03",
            "assets/u_040123/Vegetations and Props/tree_fall_03.png"
        );

        this.load.image(
            "parkiing_striped",
            "assets/u_040123/Roads/parkiing_striped.png"
        );
    }

    create() {
        console.log("Preloader: mapa e tilesets carregados com sucesso.");

        // Por enquanto seguimos direto para a GameScene,
        // que ainda está igual (com os retângulos).
        this.scene.start("GameScene");
    }
}