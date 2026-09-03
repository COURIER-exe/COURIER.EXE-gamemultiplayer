export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");

    this.trail = [];
  }

  create() {
    this.map = this.make.tilemap({ key: "mapaCidade" });

    const groundGrassEdgeTileset = this.map.addTilesetImage(
      "ground_grass_edge",
      "ground_grass_edge",
    );

    const groundAsphaltTileset = this.map.addTilesetImage(
      "ground_asphalt",
      "ground_asphalt",
    );

    const groundGrassTileset = this.map.addTilesetImage(
      "ground_grass",
      "ground_grass",
    );

    const groundGrassSideTileset = this.map.addTilesetImage(
      "ground_grass_side",
      "ground_grass_side",
    );

    const groundWaterTileset = this.map.addTilesetImage(
      "ground_water",
      "ground_water",
    );

    const parkingAsphaltTileset = this.map.addTilesetImage(
      "parking_asphalt",
      "parking_asphalt",
    );

    const streetStraightTileset = this.map.addTilesetImage(
      "street_straight",
      "street_straight",
    );

    const hospitalTileset = this.map.addTilesetImage("hospital", "hospital");

    const building01Tileset = this.map.addTilesetImage(
      "building_01",
      "building_01",
    );

    const building02Tileset = this.map.addTilesetImage(
      "building_02",
      "building_02",
    );

    const building03Tileset = this.map.addTilesetImage(
      "building_03",
      "building_03",
    );

    const building04Tileset = this.map.addTilesetImage(
      "building_04",
      "building_04",
    );

    const churchTileset = this.map.addTilesetImage("church", "church");

    const house01Tileset = this.map.addTilesetImage("house_01", "house_01");

    const house03Tileset = this.map.addTilesetImage("house_03", "house_03");

    const house06Tileset = this.map.addTilesetImage("house_06", "house_06");

    const house11Tileset = this.map.addTilesetImage("house_11", "house_11");

    const house26Tileset = this.map.addTilesetImage("house_26", "house_26");

    const house16Tileset = this.map.addTilesetImage("house_16", "house_16");

    const house23Tileset = this.map.addTilesetImage("house_23", "house_23");

    const policeStationTileset = this.map.addTilesetImage(
      "police_station",
      "police_station",
    );

    const fireStationTileset = this.map.addTilesetImage(
      "fire_station",
      "fire_station",
    );

    const bush01Tileset = this.map.addTilesetImage("bush_01", "bush_01");

    const tree02Tileset = this.map.addTilesetImage("tree_02", "tree_02");

    const treeFall03Tileset = this.map.addTilesetImage(
      "tree_fall_03",
      "tree_fall_03",
    );

    const parkingStripedTileset = this.map.addTilesetImage(
      "parking_striped",
      "parking_striped",
    );


    const layerconstrucoes = this.map.createLayer("construcoes", [
      groundWaterTileset,
      groundGrassEdgeTileset,
      groundAsphaltTileset,
      groundGrassTileset,
      groundGrassSideTileset,
      groundWaterTileset,
      parkingAsphaltTileset,
      streetStraightTileset,
      hospitalTileset,
      building01Tileset,
      building02Tileset,
      building03Tileset,
      building04Tileset,
      churchTileset,
      house01Tileset,
      house03Tileset,
      house06Tileset,
      house11Tileset,
      house26Tileset,
      house16Tileset,
      house23Tileset,
      policeStationTileset,
      fireStationTileset,
      bush01Tileset,
      tree02Tileset,
      treeFall03Tileset,
      parkingStripedTileset,
    ]);

/*
    

    const layerMar = this.map.createLayer("mar", [
      groundGrassEdgeTileset,
      groundAsphaltTileset,
      groundGrassTileset,
      groundGrassSideTileset,
      groundWaterTileset,
      parkingAsphaltTileset,
      streetStraightTileset,
      hospitalTileset,
      building01Tileset,
      building02Tileset,
      building03Tileset,
      building04Tileset,
      churchTileset,
      house01Tileset,
      house03Tileset,
      house06Tileset,
      house11Tileset,
      house26Tileset,
      house16Tileset,
      house23Tileset,
      policeStationTileset,
      fireStationTileset,
      bush01Tileset,
      tree02Tileset,
      treeFall03Tileset,
      parkingStripedTileset,
    ]);

    const layerborda = this.map.createLayer("borda", [
      groundWaterTileset,
      groundGrassEdgeTileset,
      groundAsphaltTileset,
      groundGrassTileset,
      groundGrassSideTileset,
      groundWaterTileset,
      parkingAsphaltTileset,
      streetStraightTileset,
      hospitalTileset,
      building01Tileset,
      building02Tileset,
      building03Tileset,
      building04Tileset,
      churchTileset,
      house01Tileset,
      house03Tileset,
      house06Tileset,
      house11Tileset,
      house26Tileset,
      house16Tileset,
      house23Tileset,
      policeStationTileset,
      fireStationTileset,
      bush01Tileset,
      tree02Tileset,
      treeFall03Tileset,
      parkingStripedTileset,
    ]);

    const layerruas = this.map.createLayer("ruas", [
      groundWaterTileset,
      groundGrassEdgeTileset,
      groundAsphaltTileset,
      groundGrassTileset,
      groundGrassSideTileset,
      groundWaterTileset,
      parkingAsphaltTileset,
      streetStraightTileset,
      hospitalTileset,
      building01Tileset,
      building02Tileset,
      building03Tileset,
      building04Tileset,
      churchTileset,
      house01Tileset,
      house03Tileset,
      house06Tileset,
      house11Tileset,
      house26Tileset,
      house16Tileset,
      house23Tileset,
      policeStationTileset,
      fireStationTileset,
      bush01Tileset,
      tree02Tileset,
      treeFall03Tileset,
      parkingStripedTileset,
    ]);

    const layerCalcada = this.map.createLayer("Calcada", [
      groundWaterTileset,
      groundGrassEdgeTileset,
      groundAsphaltTileset,
      groundGrassTileset,
      groundGrassSideTileset,
      groundWaterTileset,
      parkingAsphaltTileset,
      streetStraightTileset,
      hospitalTileset,
      building01Tileset,
      building02Tileset,
      building03Tileset,
      building04Tileset,
      churchTileset,
      house01Tileset,
      house03Tileset,
      house06Tileset,
      house11Tileset,
      house26Tileset,
      house16Tileset,
      house23Tileset,
      policeStationTileset,
      fireStationTileset,
      bush01Tileset,
      tree02Tileset,
      treeFall03Tileset,
      parkingStripedTileset,
    ]);

    const layerchao = this.map.createLayer("chao", [
      groundWaterTileset,
      groundGrassEdgeTileset,
      groundAsphaltTileset,
      groundGrassTileset,
      groundGrassSideTileset,
      groundWaterTileset,
      parkingAsphaltTileset,
      streetStraightTileset,
      hospitalTileset,
      building01Tileset,
      building02Tileset,
      building03Tileset,
      building04Tileset,
      churchTileset,
      house01Tileset,
      house03Tileset,
      house06Tileset,
      house11Tileset,
      house26Tileset,
      house16Tileset,
      house23Tileset,
      policeStationTileset,
      fireStationTileset,
      bush01Tileset,
      tree02Tileset,
      treeFall03Tileset,
      parkingStripedTileset,
    ]);

    const layerarvores = this.map.createLayer("arvores", [
      groundWaterTileset,
      groundGrassEdgeTileset,
      groundAsphaltTileset,
      groundGrassTileset,
      groundGrassSideTileset,
      groundWaterTileset,
      parkingAsphaltTileset,
      streetStraightTileset,
      hospitalTileset,
      building01Tileset,
      building02Tileset,
      building03Tileset,
      building04Tileset,
      churchTileset,
      house01Tileset,
      house03Tileset,
      house06Tileset,
      house11Tileset,
      house26Tileset,
      house16Tileset,
      house23Tileset,
      policeStationTileset,
      fireStationTileset,
      bush01Tileset,
      tree02Tileset,
      treeFall03Tileset,
      parkingStripedTileset,
    ]);
*/
    

    this.physics.world.setBounds(0, 0, 1280, 720);

    // Fundo
    //this.add.rectangle(640, 360, 1280, 720, 0x05050a);

    // Courier
    this.player = this.add.rectangle(640, 360, 32, 32, 0x00ffff);

    // Ponto de entrega
    this.delivery = this.add.rectangle(1100, 600, 40, 40, 0xff00ff);

    this.deliveryGroup = this.physics.add.staticGroup();

    this.deliveryGroup.add(this.delivery);
    // Ponto de coleta do pacote
    this.pickup = this.add.rectangle(180, 120, 40, 40, 0xffff00);

    this.pickupGroup = this.physics.add.staticGroup();

    this.pickupGroup.add(this.pickup);

    this.physics.add.existing(this.player);

    this.playerBody = this.player.body;

    this.playerBody.setCollideWorldBounds(true);

    // Última posição registrada do rastro
    this.lastTrailX = this.player.x;
    this.lastTrailY = this.player.y;

    // Colisão Courier x paredes
    this.physics.add.collider(this.player, this.walls);

    // Colisão Courier x ponto de entrega
    this.physics.add.overlap(
      this.player,
      this.deliveryGroup,
      this.completeDelivery,
      null,
      this,
    );
    // Colisão Courier x ponto de coleta
    this.physics.add.overlap(
      this.player,
      this.pickupGroup,
      this.collectPackage,
      null,
      this,
    );

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();

    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),

      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),

      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),

      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update() {
    const speed = 300;

    let velocityX = 0;
    let velocityY = 0;

    // Movimento para esquerda
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -speed;
    }

    // Movimento para direita
    if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = speed;
    }

    // Movimento para cima
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -speed;
    }

    // Movimento para baixo
    if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = speed;
    }

    // Aplica velocidade
    this.playerBody.setVelocity(velocityX, velocityY);

    // Distância desde o último pedaço do rastro
    const distance = Phaser.Math.Distance.Between(
      this.lastTrailX,
      this.lastTrailY,
      this.player.x,
      this.player.y,
    );

    // Cria um novo pedaço do rastro
    // a cada 12 pixels
    if (distance >= 12 && (velocityX !== 0 || velocityY !== 0)) {
      this.createTrail();

      this.lastTrailX = this.player.x;
      this.lastTrailY = this.player.y;
    }
  }

  createTrail() {
    const trail = this.add.rectangle(
      this.lastTrailX,
      this.lastTrailY,
      12,
      12,
      0x00ffff,
    );

    // Adiciona à lista de rastros
    this.trail.push(trail);

    // Faz o rastro desaparecer
    // depois de 2 segundos
    this.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 2000,

      onComplete: () => {
        trail.destroy();

        const index = this.trail.indexOf(trail);

        if (index !== -1) {
          this.trail.splice(index, 1);
        }
      },
    });
  }
  collectPackage() {
    console.log("Pacote coletado!");

    // Remove o ponto de coleta
    this.pickup.destroy();

    // Texto principal
    const pickupText = this.add
      .text(640, 300, "PACOTE COLETADO!", {
        fontFamily: "Arial",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#ffff00",
      })
      .setOrigin(0.5);

    // Texto secundário
    const pickupSubText = this.add
      .text(640, 355, "Leve o pacote até o destino.", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Remove as mensagens depois de 2 segundos
    this.time.delayedCall(2000, () => {
      pickupText.destroy();
      pickupSubText.destroy();
    });
  }

  completeDelivery() {
    console.log("Entrega concluída!");

    // Remove o ponto de entrega
    this.delivery.destroy();

    // Texto principal
    const deliveryText = this.add
      .text(640, 300, "ENTREGA CONCLUÍDA!", {
        fontFamily: "Arial",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#00ffff",
      })
      .setOrigin(0.5);

    // Texto secundário
    const deliverySubText = this.add
      .text(640, 355, "Pacote entregue com sucesso.", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Remove as mensagens depois de 2 segundos
    this.time.delayedCall(2000, () => {
      deliveryText.destroy();
      deliverySubText.destroy();
    });
  }

  createGrid() {
    const graphics = this.add.graphics();

    graphics.lineStyle(1, 0x15152a, 1);

    const gridSize = 40;

    // Linhas verticais
    for (let x = 0; x <= 1280; x += gridSize) {
      graphics.lineBetween(x, 0, x, 720);
    }

    // Linhas horizontais
    for (let y = 0; y <= 720; y += gridSize) {
      graphics.lineBetween(0, y, 1280, y);
    }
  }

  createWalls() {
    this.walls = this.physics.add.staticGroup();

    // Parede externa superior
    this.createWall(640, 20, 1280, 40);

    // Parede externa inferior
    this.createWall(640, 700, 1280, 40);

    // Parede externa esquerda
    this.createWall(20, 360, 40, 720);

    // Parede externa direita
    this.createWall(1260, 360, 40, 720);

    // Obstáculo central superior
    this.createWall(640, 280, 320, 40);

    // Obstáculo central inferior
    this.createWall(640, 440, 320, 40);

    // Obstáculo esquerdo
    this.createWall(300, 360, 40, 200);

    // Obstáculo direito
    this.createWall(980, 360, 40, 200);
  }

  createWall(x, y, width, height) {
    const wall = this.add.rectangle(x, y, width, height, 0x16163a);

    this.walls.add(wall);
  }
}
