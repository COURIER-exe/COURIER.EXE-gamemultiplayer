export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");

    this.trail = [];
    this.ataqueDoRobo = false;
    this.textoAlerta = null;
    this.matchMode = 2;
    this.player = null;
    this.playerColor = "ciano";
    this.playerTrailColors = {
      roxo: 0xb36bff,
      ciano: 0x00e5ff,
      branco: 0xffffff,
      vermelho: 0xff4d5a,
    };
    this.robo = null;
    this.joystick = {
      active: false,
      baseX: 110,
      baseY: 610,
      radius: 48,
      knobX: 110,
      knobY: 610,
      vectorX: 0,
      vectorY: 0,
    };
    this.walls = null;
    this.arrowTriggers = null;
    this.arrowTriggerList = [];
    this.joystickGraphics = null;
    this.houseDirectionArrow = null;
    this.darkOverlay = null;
  }

  create() {
    window.setJoystickVisible?.(true);
    this.playerColor = this.scene.settings.data?.color ?? "ciano";
    const playerColor = this.playerColor;
    const playerTexture = `player-${playerColor}`;
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

    const layercalcada = this.map.createLayer("calcada", [
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

    const layerconstrucooes = this.map.createLayer("construcooes", [
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

    layerconstrucooes.setDepth(10);
    layerarvores.setDepth(10);

    // O mapa infinito possui chunks que começam em -32 e terminam em 96 tiles.
    const tileSize = this.map.tileWidth;
    const mapLeft = -32 * tileSize;
    const mapTop = -32 * tileSize;
    const mapWidth = 128 * tileSize;
    const mapHeight = 128 * tileSize;

    this.physics.world.setBounds(mapLeft, mapTop, mapWidth, mapHeight);
    this.cameras.main.setBounds(mapLeft, mapTop, mapWidth, mapHeight);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBackgroundColor(0x101722);

    this.worldLayers = [
      layerMar,
      layerborda,
      layercalcada,
      layerruas,
      layerchao,
      layerconstrucooes,
      layerarvores,
    ];

    this.worldLayers.forEach((layer) => {
      layer.setTint(0x465266);
    });

    const mapRight = mapLeft + mapWidth;
    const mapBottom = mapTop + mapHeight;
    const positionMargin = 64;
    const playableLayers = [
      layerMar,
      layerborda,
      layercalcada,
      layerruas,
      layerchao,
      layerconstrucooes,
      layerarvores,
    ];
    const hasMapTileAt = (x, y) =>
      playableLayers.some((layer) => {
        const tile = layer.getTileAtWorldXY(x, y);
        return tile && tile.index !== -1;
      });
    const randomMapPosition = () => {
      for (let attempt = 0; attempt < 1000; attempt += 1) {
        const position = {
          x: Phaser.Math.Between(
            mapLeft + positionMargin,
            mapRight - positionMargin,
          ),
          y: Phaser.Math.Between(
            mapTop + positionMargin,
            mapBottom - positionMargin,
          ),
        };

        if (hasMapTileAt(position.x, position.y)) {
          return position;
        }
      }

      for (
        let y = mapTop + tileSize / 2;
        y < mapBottom;
        y += tileSize
      ) {
        for (
          let x = mapLeft + tileSize / 2;
          x < mapRight;
          x += tileSize
        ) {
          if (hasMapTileAt(x, y)) {
            return { x, y };
          }
        }
      }

      return {
        x: mapLeft + tileSize / 2,
        y: mapTop + tileSize / 2,
      };
    };

    const playerPosition = randomMapPosition();

    const playerAnimation = `player-walk-${playerColor}`;
    this.anims.create({
      key: playerAnimation,
      frames: this.anims.generateFrameNumbers(playerTexture, {
        start: 247,
        end: 252,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.worldLayers = [];
    this.worldLayers.push(
      this.map.createLayer("mar", [
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
      ]),
    );

    this.worldLayers.push(
      this.map.createLayer("borda", [
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
      ]),
    );

    this.worldLayers.push(
      this.map.createLayer("calcada", [
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
      ]),
    );

    this.worldLayers.push(
      this.map.createLayer("ruas", [
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
      ]),
    );

    this.worldLayers.push(
      this.map.createLayer("chao", [
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
      ]),
    );

    this.worldLayers.push(
      this.map.createLayer("construcooes", [
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
      ]),
    );

    this.worldLayers.push(
      this.map.createLayer("arvores", [
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
      ]),
    );

    this.player = this.add.sprite(
      playerPosition.x,
      playerPosition.y,
      playerTexture,
      247,
    );
    this.player.setDepth(5);
    this.playerAnimation = playerAnimation;
    this.player.setScale(0.5);
    this.player.vidaAtual = 100;
    this.player.vidaMaxima = 100;
    this.player.carregandoPacote = false;
    this.player.pontoDeEntregaVisivel = false;
    this.player.facing = "right";
    this.player.state = "idle";

    this.physics.add.existing(this.player);

    this.playerBody = this.player.body;
    this.playerBody.setSize(24, 20);
    this.playerBody.setOffset(20, 38);

    this.playerBody.setCollideWorldBounds(true);

    this.robo = this.add.sprite(980, 220, "robo-perseguicao", 0);
    this.robo.setScale(0.75);
    this.robo.setDepth(50);
    this.robo.setVisible(true);
    this.robo.speed = 110;
    this.robo.detectionRadius = 220;
    this.physics.add.existing(this.robo);
    this.robo.body.setCircle(
      22,
      this.robo.width / 2 - 22,
      this.robo.height / 2 - 22,
    );

    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    this.notificationText = this.add
      .text(20, 20, "", {
        fontFamily: "Arial",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#ffff00",
        backgroundColor: "rgba(0,0,0,0.2)",
        padding: { x: 12, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(999);

    window.setCoordinatesVisible?.(true);

    this.walls = this.physics.add.staticGroup();
    this.arrowTriggers = this.physics.add.group();
    this.createCollisionFromMap();
    this.createManualConstructionTrigger(-537, 2128);
    this.createManualConstructionTrigger(341, 541);
    this.createManualConstructionTrigger(675, 243);
    this.createManualConstructionTrigger(680, 1945);
    this.createManualConstructionTrigger(769, 725);
    this.targetHouseId = Phaser.Math.Between(
      0,
      Math.max(0, this.arrowTriggerList.length - 1),
    );
    this.houseDirectionArrow = this.add
      .triangle(640, 78, -24, -18, -24, 18, 28, 0, 0xffff00)
      .setScrollFactor(0)
      .setDepth(1001);
    this.joystickGraphics = this.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(1000);

    this.healthBarBg = this.add.graphics();
    this.healthBarBg.setScrollFactor(0).setDepth(999);
    this.healthBarFill = this.add.graphics();
    this.healthBarFill.setScrollFactor(0).setDepth(1000);

    this.showNotification("Casa disponível: pressione E para entrar.");
    this.updateHud();

    // Última posição registrada do rastro
    this.lastTrailX = this.player.x;
    this.lastTrailY = this.player.y;

    // Colisão Courier x paredes
    this.physics.add.collider(this.player, this.walls);

    this.physics.add.overlap(
      this.player,
      this.arrowTriggers,
      this.handleArrowTrigger,
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

    this.input.on("pointerdown", (pointer) => {
      if (pointer.x < 180 && pointer.y > 420) {
        this.joystick.active = true;
        this.updateJoystick(pointer.x, pointer.y);
      }
    });

    this.input.on("pointermove", (pointer) => {
      if (this.joystick.active) {
        this.updateJoystick(pointer.x, pointer.y);
      }
    });

    this.input.on("pointerup", () => {
      this.joystick.active = false;
      this.joystick.knobX = this.joystick.baseX;
      this.joystick.knobY = this.joystick.baseY;
      this.joystick.vectorX = 0;
      this.joystick.vectorY = 0;
    });

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  update() {
    const speed = 300;

    let velocityX = 0;
    let velocityY = 0;

    const touchX = window.joystickInput?.x ?? 0;
    const touchY = window.joystickInput?.y ?? 0;

    const directionalInput = window.directionalInput ?? new Set();

    if (
      this.cursors.left.isDown ||
      this.wasd.A.isDown ||
      directionalInput.has("left")
    ) {
      velocityX = -speed;
    }

    if (
      this.cursors.right.isDown ||
      this.wasd.D.isDown ||
      directionalInput.has("right")
    ) {
      velocityX = speed;
    }

    if (
      this.cursors.up.isDown ||
      this.wasd.W.isDown ||
      directionalInput.has("up")
    ) {
      velocityY = -speed;
    }

    if (
      this.cursors.down.isDown ||
      this.wasd.S.isDown ||
      directionalInput.has("down")
    ) {
      velocityY = speed;
    }

    if (Math.abs(touchX) > 0.1 || Math.abs(touchY) > 0.1) {
      velocityX = touchX * speed;
      velocityY = touchY * speed;
    }

    this.playerBody.setVelocity(velocityX, velocityY);

    const movingHorizontal = velocityX !== 0;
    const movingVertical = velocityY !== 0;
    const justPressedE = Phaser.Input.Keyboard.JustDown(this.keyE);
    const justPressedF = Phaser.Input.Keyboard.JustDown(this.keyF);

    this.arrowTriggerList.forEach((trigger) => {
      if (
        trigger.getData("active") &&
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          trigger.x,
          trigger.y,
        ) > 60
      ) {
        trigger.setData("active", false);
        trigger.setFillStyle(0x00ff88, 0.22);
      }
    });

    if (justPressedE) {
      this.showNotification("Entre na casa usando o marcador.");
    }

    if (movingHorizontal) {
      this.player.setFlipX(velocityX > 0);
      this.player.anims.play(this.playerAnimation, true);
      this.player.state = "andando";
    } else if (movingVertical) {
      this.player.anims.stop();
      this.player.setFrame(247);
      this.player.setFlipX(false);
      this.player.state = "andando";
    } else {
      this.player.anims.stop();
      this.player.setFrame(247);
      this.player.setFlipX(false);
      this.player.state = "idle";
    }

    const distance = Phaser.Math.Distance.Between(
      this.lastTrailX,
      this.lastTrailY,
      this.player.x,
      this.player.y,
    );

    if (distance >= 12 && (velocityX !== 0 || velocityY !== 0)) {
      this.createTrail();

      this.lastTrailX = this.player.x;
      this.lastTrailY = this.player.y;
    }

    if (this.robo) {
      const roboDist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.robo.x,
        this.robo.y,
      );

      if (roboDist < this.robo.detectionRadius) {
        const nx = (this.player.x - this.robo.x) / (roboDist || 1);
        const ny = (this.player.y - this.robo.y) / (roboDist || 1);
        this.robo.x += nx * this.robo.speed * 0.016;
        this.robo.y += ny * this.robo.speed * 0.016;

        if (roboDist < 32) {
          this.player.vidaAtual = Math.max(0, this.player.vidaAtual - 1.5);
          this.showNotification("Você foi atingido!");
          this.ataqueDoRobo = true;
        }
      }
    }

    this.updateHouseDirectionArrow();

    this.updateHud();

    if (this.player.vidaAtual <= 0) {
      this.showNotification("Você foi derrotado! Reiniciando...");
      this.player.vidaAtual = 100;
      this.player.x = 250;
      this.player.y = 250;
    }
  }

  createTrail() {
    const trailColor = this.playerTrailColors[this.playerColor] ?? 0x00e5ff;
    const trail = this.add.rectangle(
      this.lastTrailX,
      this.lastTrailY,
      12,
      12,
      trailColor,
    );

    this.trail.push(trail);

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

  showNotification(message) {
    if (this.notificationText) {
      this.notificationText.setText(message);
      this.notificationText.setAlpha(1);
      this.time.delayedCall(1800, () => {
        this.notificationText.setText("");
      });
    }
  }

  updateHud() {
    if (this.player) {
      window.updateCoordinates?.(
        Math.round(this.player.x),
        Math.round(this.player.y),
      );
    }

    if (!this.healthBarBg || !this.healthBarFill) return;

    this.healthBarBg.clear();
    this.healthBarFill.clear();

    this.healthBarBg.fillStyle(0x000000, 0.5);
    this.healthBarBg.fillRect(20, 20, 220, 22);

    const ratio = Phaser.Math.Clamp(
      (this.player?.vidaAtual ?? 100) / (this.player?.vidaMaxima ?? 100),
      0,
      1,
    );
    this.healthBarFill.fillStyle(0xe74c3c, 1);
    this.healthBarFill.fillRect(20, 20, 220 * ratio, 22);

    this.healthBarFill.lineStyle(2, 0xffffff, 1);
    this.healthBarFill.strokeRect(20, 20, 220, 22);
  }

  updateHouseDirectionArrow() {
    if (!this.houseDirectionArrow) return;

    const targetTrigger = this.arrowTriggerList[this.targetHouseId];
    if (!targetTrigger || targetTrigger.getData("active")) {
      this.houseDirectionArrow.setVisible(false);
      return;
    }

    this.houseDirectionArrow
      .setVisible(true)
      .setRotation(
        Phaser.Math.Angle.Between(
          this.player.x,
          this.player.y,
          targetTrigger.x,
          targetTrigger.y,
        ),
      );
  }

  enterCasa(trigger) {
    if (
      this.scene.isActive("InteriorScene") ||
      this.time.now < (this.interiorCooldownUntil ?? 0) ||
      trigger.getData("active")
    ) {
      return;
    }

    trigger.setData("active", true);
    this.savedExteriorPosition = { x: this.player.x, y: this.player.y };
    this.scene.pause("GameScene");
    this.scene.launch("InteriorScene", {
      color: this.scene.settings.data?.color ?? "ciano",
      returnPosition: this.savedExteriorPosition,
      isTargetHouse: trigger.getData("houseId") === this.targetHouseId,
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

  updateJoystick(pointerX, pointerY) {
    const dx = pointerX - this.joystick.baseX;
    const dy = pointerY - this.joystick.baseY;
    const distance = Math.hypot(dx, dy);
    const clampedDistance = Math.min(distance, this.joystick.radius);
    const angle = Math.atan2(dy, dx);

    this.joystick.knobX =
      this.joystick.baseX + Math.cos(angle) * clampedDistance;
    this.joystick.knobY =
      this.joystick.baseY + Math.sin(angle) * clampedDistance;
    this.joystick.vectorX =
      Math.cos(angle) * (clampedDistance / this.joystick.radius);
    this.joystick.vectorY =
      Math.sin(angle) * (clampedDistance / this.joystick.radius);
  }

  drawJoystick() {
    if (!this.joystickGraphics) return;

    this.joystickGraphics.clear();
    this.joystickGraphics.lineStyle(2, 0xffffff, 0.6);
    this.joystickGraphics.fillStyle(0xffffff, 0.12);
    this.joystickGraphics.fillCircle(
      this.joystick.baseX,
      this.joystick.baseY,
      this.joystick.radius,
    );
    this.joystickGraphics.strokeCircle(
      this.joystick.baseX,
      this.joystick.baseY,
      this.joystick.radius,
    );
    this.joystickGraphics.fillStyle(0xffffff, 0.8);
    this.joystickGraphics.fillCircle(
      this.joystick.knobX,
      this.joystick.knobY,
      18,
    );
  }

  createCollisionFromMap() {
    const collisionLayer = this.map.getObjectLayer("colission");

    if (!collisionLayer) {
      return;
    }

    collisionLayer.objects.forEach((obj) => {
      if (!obj.width || !obj.height) return;

      const wall = this.add.rectangle(
        obj.x + obj.width / 2,
        obj.y + obj.height / 2,
        obj.width,
        obj.height,
        0x000000,
      );

      wall.setAlpha(0.01);
      wall.setVisible(false);
      this.physics.add.existing(wall, true);
      this.walls.add(wall);
    });

    this.createConstructionMarkers(collisionLayer.objects);
  }

  createConstructionMarkers(objects) {
    const buildingParts = objects
      .filter((obj) => obj.width >= 8 && obj.height >= 8)
      .map((obj) => ({
        left: obj.x,
        top: obj.y,
        right: obj.x + obj.width,
        bottom: obj.y + obj.height,
      }));
    const buildings = [];
    const separation = 24;
    const partsBelongTogether = (first, second) =>
      first.left <= second.right + separation &&
      first.right + separation >= second.left &&
      first.top <= second.bottom + separation &&
      first.bottom + separation >= second.top;

    buildingParts.forEach((part) => {
      const matchingIndexes = [];
      buildings.forEach((building, index) => {
        if (partsBelongTogether(part, building)) {
          matchingIndexes.push(index);
        }
      });

      if (matchingIndexes.length === 0) {
        buildings.push(part);
        return;
      }

      const matchingBuildings = matchingIndexes.map(
        (index) => buildings[index],
      );
      const allParts = [part, ...matchingBuildings];
      const mergedBuilding = {
        left: Math.min(...allParts.map((item) => item.left)),
        top: Math.min(...allParts.map((item) => item.top)),
        right: Math.max(...allParts.map((item) => item.right)),
        bottom: Math.max(...allParts.map((item) => item.bottom)),
      };

      buildings.push(mergedBuilding);
      matchingIndexes
        .sort((first, second) => second - first)
        .forEach((index) => buildings.splice(index, 1));
    });

    buildings.forEach((building) => {
      const arrow = this.add
        .image(
          (building.left + building.right) / 2,
          building.bottom + 18,
          "seta-construcao",
        )
        .setDisplaySize(42, 32)
        .setDepth(8);
      const trigger = this.add
        .rectangle(arrow.x, arrow.y, 52, 40, 0x00ff88, 0.22)
        .setStrokeStyle(2, 0x00ff88, 0.9)
        .setDepth(7);
      this.physics.add.existing(trigger);
      trigger.body.setAllowGravity(false);
      trigger.body.setImmovable(true);
      trigger.setData("arrow", arrow);
      trigger.setData("houseId", this.arrowTriggerList.length);
      this.arrowTriggers.add(trigger);
      this.arrowTriggerList.push(trigger);

      this.tweens.add({
        targets: [arrow, trigger],
        y: arrow.y - 7,
        duration: 650,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });
  }

  createManualConstructionTrigger(x, y) {
    const arrow = this.add
      .image(x, y, "seta-construcao")
      .setDisplaySize(42, 32)
      .setDepth(8);
    const trigger = this.add
      .rectangle(x, y, 52, 40, 0x00ff88, 0.22)
      .setStrokeStyle(2, 0x00ff88, 0.9)
      .setDepth(7);
    this.physics.add.existing(trigger);
    trigger.body.setAllowGravity(false);
    trigger.body.setImmovable(true);
    trigger.setData("arrow", arrow);
    trigger.setData("houseId", this.arrowTriggerList.length);
    this.arrowTriggers.add(trigger);
    this.arrowTriggerList.push(trigger);

    this.tweens.add({
      targets: [arrow, trigger],
      y: y - 7,
      duration: 650,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  handleArrowTrigger(player, trigger) {
    this.enterCasa(trigger);
  }
}
