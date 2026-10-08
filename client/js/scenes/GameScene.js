const NETWORK_UPDATE_INTERVAL = 1000 / 15;
const TRAIL_BROADCAST_INTERVAL = 40;

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
    this.darkOverlay = null;
    this.networkData = null;
    this.remotePlayers = new Map();
    this.minimapRemoteMarkers = new Map();
    this.nextPositionUpdate = 0;
    this.nextRobotUpdate = 0;
    this.nextTrailBroadcast = 0;
    this.isMultiplayerHost = false;
    this.robotTarget = null;
    this.matchFinished = false;
    this.matchNoticeVisible = false;
    this.lostCodeNoticeVisible = false;
  }

  init(data = {}) {
    this.networkData = data.multiplayer ? data : null;
    this.matchFinished = false;
  }

  create() {
    window.setJoystickVisible?.(true);
    window.resetObjectiveProgress?.();
    this.playerColor = this.scene.settings.data?.color ?? "ciano";
    this.isMultiplayerHost =
      this.networkData?.room.hostId === window.multiplayer?.playerId;
    this.robotTarget = this.networkData?.room.robot ?? null;
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
    layerarvores.setDepth(20);

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
    this.hasMapTileAt = hasMapTileAt;
    this.roboMapBounds = {
      left: mapLeft,
      top: mapTop,
      width: mapWidth,
      height: mapHeight,
    };
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

      for (let y = mapTop + tileSize / 2; y < mapBottom; y += tileSize) {
        for (let x = mapLeft + tileSize / 2; x < mapRight; x += tileSize) {
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

    this.roboAnimation = "robo-walk";
    this.roboDirectionFrames = { up: 0, down: 7 };
    this.anims.create({
      key: this.roboAnimation,
      frames: this.anims.generateFrameNumbers("robo-perseguicao", {
        start: 95,
        end: 100,
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
    this.player.setDepth(11);
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
    this.setupMultiplayerPlayers();

    const robotStart = this.robotTarget ?? { x: 980, y: 220 };
    this.robo = this.add.sprite(
      robotStart.x,
      robotStart.y,
      "robo-perseguicao",
      this.roboDirectionFrames.down,
    );
    this.robo.setScale(0.75);
    this.robo.setDepth(this.player.depth);
    this.robo.setVisible(true);
    this.robo.speed = 300;
    this.robo.detectionRadius = 500;
    this.physics.add.existing(this.robo);
    if (this.networkData && !this.isMultiplayerHost) {
      this.robo.body.setEnable(false);
    }
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

    this.arrowTriggerList = [];
    this.walls = this.physics.add.staticGroup();
    this.arrowTriggers = this.physics.add.group();
    this.createCollisionFromMap();
    this.map
      .getObjectLayer("triggers")
      ?.objects.filter((object) => object.type === "construction-trigger")
      .forEach((object) =>
        this.createManualConstructionTrigger(object.x, object.y),
      );
    this.createManualConstructionTrigger(-537, 2128);
    this.createManualConstructionTrigger(341, 541);
    this.createManualConstructionTrigger(675, 243);
    this.createManualConstructionTrigger(680, 1945);
    this.createManualConstructionTrigger(769, 725);
    this.createManualConstructionTrigger(1068, 1706);
    const roomId = this.networkData?.room.id;
    let objectiveSeed = roomId
      ? [...roomId].reduce(
          (seed, character) =>
            (Math.imul(seed, 31) + character.charCodeAt(0)) >>> 0,
          2166136261,
        )
      : 0;
    const objectiveRandom = () => {
      objectiveSeed = (Math.imul(objectiveSeed, 1664525) + 1013904223) >>> 0;
      return objectiveSeed / 0x100000000;
    };
    const objectiveBetween = (minimum, maximum) =>
      roomId
        ? minimum + Math.floor(objectiveRandom() * (maximum - minimum + 1))
        : Phaser.Math.Between(minimum, maximum);
    const houseIds = Array.from(
      { length: this.arrowTriggerList.length },
      (_, index) => index,
    ).sort((firstId, secondId) => {
      const first = this.arrowTriggerList[firstId].getData("coordinates");
      const second = this.arrowTriggerList[secondId].getData("coordinates");
      return first.x - second.x || first.y - second.y;
    });
    for (let index = houseIds.length - 1; index > 0; index -= 1) {
      const randomIndex = objectiveBetween(0, index);
      [houseIds[index], houseIds[randomIndex]] = [
        houseIds[randomIndex],
        houseIds[index],
      ];
    }
    this.pickupHouseIds = new Set(houseIds.slice(0, 4));
    this.passwordHouseIds = new Set(
      houseIds
        .filter((houseId) => !this.pickupHouseIds.has(houseId))
        .slice(0, 8),
    );
    const housePasswordCodes = Array.from({ length: 16 }, (_, code) =>
      code.toString(2).padStart(4, "0"),
    );
    for (let index = housePasswordCodes.length - 1; index > 0; index -= 1) {
      const randomIndex = objectiveBetween(0, index);
      [housePasswordCodes[index], housePasswordCodes[randomIndex]] = [
        housePasswordCodes[randomIndex],
        housePasswordCodes[index],
      ];
    }
    this.housePasswords = new Map(
      [...this.passwordHouseIds].map((houseId, index) => [
        houseId,
        housePasswordCodes[index],
      ]),
    );
    const deliveryHouseIds = houseIds.filter(
      (houseId) => !this.pickupHouseIds.has(houseId),
    );
    this.deliveryHouseId = deliveryHouseIds.length
      ? deliveryHouseIds[objectiveBetween(0, deliveryHouseIds.length - 1)]
      : null;
    const getHouseCoordinates = (houseId) => {
      const coordinates =
        this.arrowTriggerList[houseId]?.getData("coordinates");
      return coordinates
        ? { x: Math.round(coordinates.x), y: Math.round(coordinates.y) }
        : null;
    };
    window.setPasswordHouseCoordinates?.({
      houses: [...this.passwordHouseIds].map((houseId) => ({
        houseNumber: houseId + 1,
        ...getHouseCoordinates(houseId),
      })),
      pickups: [...this.pickupHouseIds]
        .map(getHouseCoordinates)
        .filter(Boolean),
      delivery: getHouseCoordinates(this.deliveryHouseId),
    });
    this.packagePassword = null;
    this.joystickGraphics = this.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(1000);

    this.showNotification("Casa disponível: pressione E para entrar.");
    this.updateHud();

    // Última posição registrada do rastro
    this.lastTrailX = this.player.x;
    this.lastTrailY = this.player.y;

    // Colisão Courier x paredes
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.robo, this.walls);
    this.roboAI = {
      mode: "scatter",
      modeEndsAt: this.time.now + 7000,
      target: this.chooseRoboWanderTarget(),
      detourTarget: null,
      detourEndsAt: 0,
    };

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
    this.createMinimap({ mapLeft, mapTop, mapWidth, mapHeight });
    this.showMatchNotice();
  }

  showMatchNotice() {
    const width = this.scale.width;
    const height = this.scale.height;
    const noticeScale = 0.8;
    this.matchNoticeVisible = true;
    window.setJoystickVisible?.(false);

    const notice = this.add
      .image(width / 2, height / 2, "aviso-partida")
      .setDisplaySize(width * noticeScale, height * noticeScale)
      .setScrollFactor(0)
      .setDepth(3000);
    const skipWidth = width * 0.12 * noticeScale;
    const skipHeight = height * 0.12 * noticeScale;
    const skipButton = this.add
      .rectangle(
        width / 2 + width * 0.2 * noticeScale,
        height / 2 + (height * 0.655 - height / 2) * noticeScale,
        skipWidth,
        skipHeight,
        0x000000,
        0,
      )
      .setScrollFactor(0)
      .setDepth(3001)
      .setInteractive({ useHandCursor: true });
    this.minimapCamera?.ignore([notice, skipButton]);

    skipButton.once("pointerdown", () => {
      this.matchNoticeVisible = false;
      notice.destroy();
      skipButton.destroy();
      window.setJoystickVisible?.(true);
    });
  }

  setupMultiplayerPlayers() {
    const room = this.networkData?.room;
    const network = window.multiplayer;
    if (!room || !network) return;

    let spawnOffset = 1;
    room.players.forEach((player) => {
      if (player.id === network.playerId) return;
      const color = player.color ?? "ciano";
      const x = player.x ?? this.player.x + spawnOffset * 42;
      const y = player.y ?? this.player.y + spawnOffset * 42;
      const sprite = this.add
        .sprite(x, y, `player-${color}`, 247)
        .setScale(0.5)
        .setDepth(11);
      const animation = `player-walk-${color}`;
      if (!this.anims.exists(animation)) {
        this.anims.create({
          key: animation,
          frames: this.anims.generateFrameNumbers(`player-${color}`, {
            start: 247,
            end: 252,
          }),
          frameRate: 10,
          repeat: -1,
        });
      }
      this.remotePlayers.set(player.id, {
        sprite,
        animation,
        targetX: x,
        targetY: y,
        color,
      });
      this.createRemoteMinimapMarker(player.id, color, x, y);
      spawnOffset += 1;
    });

    this.networkUnsubscribers = [
      network.on("player:position", ({ player }) => {
        let remote = this.remotePlayers.get(player.id);
        if (!remote) {
          const color = player.color ?? "ciano";
          const animation = `player-walk-${color}`;
          if (!this.anims.exists(animation)) {
            this.anims.create({
              key: animation,
              frames: this.anims.generateFrameNumbers(`player-${color}`, {
                start: 247,
                end: 252,
              }),
              frameRate: 10,
              repeat: -1,
            });
          }
          const sprite = this.add
            .sprite(player.x, player.y, `player-${color}`, 247)
            .setScale(0.5)
            .setDepth(11);
          remote = { sprite, animation, targetX: player.x, targetY: player.y };
          remote.color = color;
          this.remotePlayers.set(player.id, remote);
          this.createRemoteMinimapMarker(player.id, color, player.x, player.y);
        }
        remote.targetX = player.x;
        remote.targetY = player.y;
        remote.sprite.setFlipX(player.flipX);
        if (player.moving) {
          remote.sprite.anims.play(remote.animation, true);
        } else {
          remote.sprite.anims.stop();
          remote.sprite.setFrame(247);
        }
      }),
      network.on("player:trail", ({ trail }) => {
        this.createTrail(trail.x, trail.y, trail.color, false);
      }),
      network.on("robot:position", ({ robot }) => {
        this.robotTarget = robot;
      }),
      network.on("player-left", ({ playerId }) => {
        this.remotePlayers.get(playerId)?.sprite.destroy();
        this.remotePlayers.delete(playerId);
        this.minimapRemoteMarkers.get(playerId)?.destroy();
        this.minimapRemoteMarkers.delete(playerId);
        this.networkData.room.players = this.networkData.room.players.filter(
          (player) => player.id !== playerId,
        );
      }),
      network.on("package:state", ({ gameState }) => {
        this.packageCarrierId = gameState.carrierId;
        this.player.carregandoPacote = gameState.carrierId === network.playerId;
        if (this.scene.isActive("InteriorScene")) {
          this.scene.get("InteriorScene")?.applyPackageState(gameState);
        }
      }),
      network.on("package:delivered", ({ winnerId }) => {
        if (this.matchFinished) return;
        this.matchFinished = true;
        this.playerBody.setVelocity(0, 0);
        window.setJoystickVisible?.(false);
        window.setCoordinatesVisible?.(false);
        if (this.scene.isActive("InteriorScene")) {
          this.scene.get("InteriorScene")?.finishMultiplayerMatch(winnerId);
        } else if (winnerId !== network.playerId) {
          this.showMultiplayerDefeatScreen();
        }
        if (
          this.networkData.room.players.length &&
          winnerId !== network.playerId
        ) {
          this.showNotification("Outro jogador entregou o pacote!");
        }
      }),
    ];
    this.events.once("shutdown", () => {
      this.networkUnsubscribers.forEach((unsubscribe) => unsubscribe());
      this.remotePlayers.forEach(({ sprite }) => sprite.destroy());
      this.remotePlayers.clear();
      this.minimapRemoteMarkers.forEach((marker) => marker.destroy());
      this.minimapRemoteMarkers.clear();
    });
  }

  update() {
    if (
      this.matchNoticeVisible ||
      this.lostCodeNoticeVisible ||
      this.matchFinished
    ) {
      this.playerBody?.setVelocity(0, 0);
      return;
    }

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
    if (this.networkData && this.time.now >= this.nextPositionUpdate) {
      window.multiplayer.send("player:position", {
        x: this.player.x,
        y: this.player.y,
        moving: velocityX !== 0 || velocityY !== 0,
        flipX: this.player.flipX,
      });
      this.nextPositionUpdate = this.time.now + NETWORK_UPDATE_INTERVAL;
    }
    this.remotePlayers.forEach((remote) => {
      remote.sprite.x = Phaser.Math.Linear(
        remote.sprite.x,
        remote.targetX,
        0.35,
      );
      remote.sprite.y = Phaser.Math.Linear(
        remote.sprite.y,
        remote.targetY,
        0.35,
      );
    });

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
        trigger.setFillStyle(0x00e5ff, 0.22);
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
      if (!this.networkData || this.isMultiplayerHost) {
        this.updateRoboAI();
        if (this.networkData && this.time.now >= this.nextRobotUpdate) {
          window.multiplayer.send("robot:position", {
            x: this.robo.x,
            y: this.robo.y,
            moving: this.robo.anims.isPlaying,
            flipX: this.robo.flipX,
            frame:
              Number(this.robo.frame.name) || this.roboDirectionFrames.down,
          });
          this.nextRobotUpdate = this.time.now + NETWORK_UPDATE_INTERVAL;
        }
      } else if (this.robotTarget) {
        this.robo.x = Phaser.Math.Linear(this.robo.x, this.robotTarget.x, 0.45);
        this.robo.y = Phaser.Math.Linear(this.robo.y, this.robotTarget.y, 0.45);
        this.robo.setFlipX(this.robotTarget.flipX);
        if (this.robotTarget.moving) {
          this.robo.anims.play(this.roboAnimation, true);
        } else {
          this.robo.anims.stop();
          this.robo.setFrame(this.robotTarget.frame);
        }
      }
      const roboDist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.robo.x,
        this.robo.y,
      );

      if (roboDist < 32) {
        this.player.vidaAtual = Math.max(0, this.player.vidaAtual - 1.5);
        this.showNotification("Você foi atingido!");
        this.ataqueDoRobo = true;
      }
    }

    this.updateHud();

    if (this.player.vidaAtual <= 0) {
      const hadCode = Boolean(this.packagePassword);
      if (hadCode) {
        this.showCodeLostNotice();
      }

      this.showNotification("Você foi derrotado! Reiniciando...");
      this.packagePassword = null;
      this.player.carregandoPacote = false;
      if (this.networkData) window.multiplayer.send("package:drop");
      window.resetObjectiveProgress?.();
      window.resetPasswordProgress?.();
      this.player.vidaAtual = 100;
      this.player.x = 250;
      this.player.y = 250;
    }

    this.updateMinimap();
  }

  showCodeLostNotice() {
    if (this.lostCodeNoticeVisible) return;
    this.lostCodeNoticeVisible = true;
    this.matchNoticeVisible = true;
    window.setJoystickVisible?.(false);

    const width = this.scale.width;
    const height = this.scale.height;
    const noticeScale = 0.8;
    const notice = this.add
      .image(width / 2, height / 2, "perdeucodigo")
      .setDisplaySize(width * noticeScale, height * noticeScale)
      .setScrollFactor(0)
      .setDepth(3000);
    const skipWidth = width * 0.12 * noticeScale;
    const skipHeight = height * 0.12 * noticeScale;
    const skipButton = this.add
      .rectangle(
        width / 2 + width * 0.2 * noticeScale,
        height / 2 + (height * 0.655 - height / 2) * noticeScale,
        skipWidth,
        skipHeight,
        0x000000,
        0,
      )
      .setScrollFactor(0)
      .setDepth(3001)
      .setInteractive({ useHandCursor: true });
    this.minimapCamera?.ignore([notice, skipButton]);

    skipButton.once("pointerdown", () => {
      this.lostCodeNoticeVisible = false;
      this.matchNoticeVisible = false;
      notice.destroy();
      skipButton.destroy();
      window.setJoystickVisible?.(true);
    });
  }

  showMultiplayerDefeatScreen() {
    const defeatImage = this.add
      .image(640, 360, "perdeu")
      .setDisplaySize(1100, 619)
      .setScrollFactor(0)
      .setDepth(2000);
    const returnButton = this.add
      .rectangle(640, 530, 440, 68, 0x00a9a9)
      .setStrokeStyle(2, 0x00f5ee)
      .setScrollFactor(0)
      .setDepth(2001)
      .setInteractive({ useHandCursor: true });
    const buttonText = this.add
      .text(640, 530, "VOLTAR AO MENU PRINCIPAL", {
        fontFamily: "Arial",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2002);

    this.minimapCamera?.ignore([defeatImage, returnButton, buttonText]);
    returnButton.on("pointerover", () => returnButton.setFillStyle(0x00d4d4));
    returnButton.on("pointerout", () => returnButton.setFillStyle(0x00a9a9));
    returnButton.once("pointerdown", () => {
      window.multiplayer?.send("room:leave");
      this.scene.stop("InteriorScene");
      this.scene.start("RoomScene");
    });
  }

  updateRoboAI() {
    const now = this.time.now;
    const players = [
      {
        id: window.multiplayer?.playerId ?? "local",
        sprite: this.player,
      },
      ...Array.from(this.remotePlayers, ([id, remote]) => ({
        id,
        sprite: remote.sprite,
      })),
    ];
    let chaseTarget = players[0];
    chaseTarget.distance = Phaser.Math.Distance.Between(
      this.robo.x,
      this.robo.y,
      chaseTarget.sprite.x,
      chaseTarget.sprite.y,
    );
    players.slice(1).forEach((player) => {
      const distance = Phaser.Math.Distance.Between(
        this.robo.x,
        this.robo.y,
        player.sprite.x,
        player.sprite.y,
      );
      if (distance < chaseTarget.distance) {
        chaseTarget = { ...player, distance };
      }
    });

    if (this.roboAI.chaseTargetId !== chaseTarget.id) {
      this.roboAI.chaseTargetId = chaseTarget.id;
      this.roboAI.detourTarget = null;
      this.roboAI.detourEndsAt = 0;
    }

    if (now >= this.roboAI.modeEndsAt) {
      this.roboAI.mode = this.roboAI.mode === "scatter" ? "chase" : "scatter";
      this.roboAI.modeEndsAt =
        now + (this.roboAI.mode === "scatter" ? 7000 : 14000);
      this.roboAI.detourEndsAt = 0;
      this.roboAI.target =
        this.roboAI.mode === "scatter" ? this.chooseRoboWanderTarget() : null;
    }

    if (chaseTarget.distance <= this.robo.detectionRadius) {
      if (this.roboAI.mode !== "chase") {
        this.roboAI.detourTarget = null;
        this.roboAI.detourEndsAt = 0;
      }
      this.roboAI.mode = "chase";
      this.roboAI.modeEndsAt = now + 14000;
    }

    const blocked = Object.values(this.robo.body.blocked).some(Boolean);
    if (blocked && now >= this.roboAI.detourEndsAt) {
      if (this.roboAI.mode === "chase") {
        this.roboAI.detourTarget = this.chooseRoboDetourTarget(
          chaseTarget.sprite,
        );
      } else {
        this.roboAI.target = this.chooseRoboWanderTarget();
      }
      this.roboAI.detourEndsAt = now + 1200;
    }

    if (
      this.roboAI.mode === "scatter" &&
      Phaser.Math.Distance.Between(
        this.robo.x,
        this.robo.y,
        this.roboAI.target.x,
        this.roboAI.target.y,
      ) < 48
    ) {
      this.roboAI.target = this.chooseRoboWanderTarget();
    }

    const detourDistance = this.roboAI.detourTarget
      ? Phaser.Math.Distance.Between(
          this.robo.x,
          this.robo.y,
          this.roboAI.detourTarget.x,
          this.roboAI.detourTarget.y,
        )
      : 0;
    const isDetouring =
      this.roboAI.mode === "chase" &&
      now < this.roboAI.detourEndsAt &&
      detourDistance >= 40;
    if (!isDetouring) this.roboAI.detourTarget = null;

    const target =
      this.roboAI.mode === "scatter"
        ? this.roboAI.target
        : isDetouring
          ? this.roboAI.detourTarget
          : chaseTarget.sprite;
    const distance = Phaser.Math.Distance.Between(
      this.robo.x,
      this.robo.y,
      target.x,
      target.y,
    );
    const directionX = (target.x - this.robo.x) / (distance || 1);
    const directionY = (target.y - this.robo.y) / (distance || 1);
    const roboHitbox = new Phaser.Geom.Circle(
      this.robo.body.center.x,
      this.robo.body.center.y,
      this.robo.body.radius,
    );
    const touchingTrail = this.trail.some((trail) =>
      Phaser.Geom.Intersects.CircleToRectangle(roboHitbox, trail.getBounds()),
    );
    const roboSpeed = touchingTrail ? this.robo.speed * 0.5 : this.robo.speed;

    this.robo.body.setVelocity(directionX * roboSpeed, directionY * roboSpeed);

    if (Math.abs(directionX) > 0.05) {
      this.robo.setFlipX(directionX < 0);
      this.robo.anims.play(this.roboAnimation, true);
    } else {
      this.robo.anims.stop();
      this.robo.setFrame(
        this.roboDirectionFrames[directionY < 0 ? "up" : "down"],
      );
      this.robo.setFlipX(false);
    }
  }

  chooseRoboWanderTarget() {
    const bounds = this.roboMapBounds;
    const walls = this.walls.getChildren();

    for (let attempt = 0; attempt < 1000; attempt += 1) {
      const target = {
        x: Phaser.Math.Between(bounds.left, bounds.left + bounds.width),
        y: Phaser.Math.Between(bounds.top, bounds.top + bounds.height),
      };
      if (!this.hasMapTileAt(target.x, target.y)) continue;

      const overlapsWall = walls.some(
        ({ body }) =>
          body &&
          target.x + 24 > body.x &&
          target.x - 24 < body.x + body.width &&
          target.y + 24 > body.y &&
          target.y - 24 < body.y + body.height,
      );
      if (!overlapsWall) return target;
    }

    return {
      x: this.robo.x + Phaser.Math.Between(-128, 128),
      y: this.robo.y + Phaser.Math.Between(-128, 128),
    };
  }

  chooseRoboDetourTarget(target) {
    const angleToPlayer = Phaser.Math.Angle.Between(
      this.robo.x,
      this.robo.y,
      target.x,
      target.y,
    );
    const angleOffsets = [
      Math.PI / 4,
      -Math.PI / 4,
      Math.PI / 2,
      -Math.PI / 2,
      (Math.PI * 3) / 4,
      (-Math.PI * 3) / 4,
      Math.PI,
    ];
    const walls = this.walls.getChildren();

    for (const offset of angleOffsets) {
      const angle = angleToPlayer + offset;
      const target = {
        x: this.robo.x + Math.cos(angle) * 128,
        y: this.robo.y + Math.sin(angle) * 128,
      };
      if (!this.hasMapTileAt(target.x, target.y)) continue;

      const overlapsWall = walls.some(
        ({ body }) =>
          body &&
          target.x + 24 > body.x &&
          target.x - 24 < body.x + body.width &&
          target.y + 24 > body.y &&
          target.y - 24 < body.y + body.height,
      );
      if (!overlapsWall) return target;
    }

    return this.chooseRoboWanderTarget();
  }

  createMinimap(bounds) {
    this.minimapPlayerMarker = this.add
      .circle(this.player.x, this.player.y, 96, 0x00e5ff)
      .setDepth(20);
    this.minimapRoboMarker = this.add
      .circle(this.robo.x, this.robo.y, 96, 0xff4d5a)
      .setDepth(20);
    const minimapWidth = 184;
    const minimapHeight = 134;
    const minimapMargin = 16;
    this.minimapCamera = this.cameras.add(
      this.scale.width - minimapWidth - minimapMargin,
      this.scale.height - minimapHeight - minimapMargin,
      minimapWidth,
      minimapHeight,
    );
    this.minimapCamera
      .setZoom(
        Math.min(
          minimapWidth / bounds.mapWidth,
          minimapHeight / bounds.mapHeight,
        ),
      )
      .centerOn(
        bounds.mapLeft + bounds.mapWidth / 2,
        bounds.mapTop + bounds.mapHeight / 2,
      )
      .setBackgroundColor(0x101722)
      .setRoundPixels(true);
    this.minimapCamera.ignore([this.notificationText, this.joystickGraphics]);
    this.cameras.main.ignore([
      this.minimapPlayerMarker,
      this.minimapRoboMarker,
    ]);
    this.networkData?.room.players.forEach((player) => {
      if (player.id === window.multiplayer?.playerId) return;
      const remote = this.remotePlayers.get(player.id);
      this.createRemoteMinimapMarker(
        player.id,
        player.color ?? remote?.color,
        remote?.sprite.x ?? player.x ?? this.player.x,
        remote?.sprite.y ?? player.y ?? this.player.y,
      );
    });
  }

  createRemoteMinimapMarker(playerId, color, x, y) {
    if (!this.minimapCamera || this.minimapRemoteMarkers.has(playerId)) return;
    const marker = this.add
      .circle(x, y, 96, this.playerTrailColors[color] ?? 0xffffff)
      .setDepth(20);
    this.minimapRemoteMarkers.set(playerId, marker);
    this.cameras.main.ignore(marker);
  }

  updateMinimap() {
    this.minimapPlayerMarker.setPosition(this.player.x, this.player.y);
    this.minimapRoboMarker.setPosition(this.robo.x, this.robo.y);
    this.networkData?.room.players.forEach((player) => {
      if (player.id === window.multiplayer?.playerId) return;
      const remote = this.remotePlayers.get(player.id);
      const x = remote?.sprite.x ?? player.x;
      const y = remote?.sprite.y ?? player.y;
      this.createRemoteMinimapMarker(
        player.id,
        player.color ?? remote?.color,
        x ?? this.player.x,
        y ?? this.player.y,
      );
      const marker = this.minimapRemoteMarkers.get(player.id);
      marker?.setPosition(x ?? this.player.x, y ?? this.player.y);
    });
  }

  createTrail(
    x = this.lastTrailX,
    y = this.lastTrailY,
    color = this.playerColor,
    broadcast = true,
  ) {
    const trailColor = this.playerTrailColors[color] ?? 0x00e5ff;
    const trail = this.add.rectangle(x, y, 12, 12, trailColor);

    this.trail.push(trail);
    if (
      broadcast &&
      this.networkData &&
      this.time.now >= this.nextTrailBroadcast
    ) {
      window.multiplayer.send("player:trail", { x, y });
      this.nextTrailBroadcast = this.time.now + TRAIL_BROADCAST_INTERVAL;
    }

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

    window.updateHealthBar?.(
      this.player?.vidaAtual ?? 100,
      this.player?.vidaMaxima ?? 100,
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
    const houseId = trigger.getData("houseId");
    this.scene.pause("GameScene");
    this.scene.launch("InteriorScene", {
      color: this.scene.settings.data?.color ?? "ciano",
      returnPosition: this.savedExteriorPosition,
      houseId,
      isTargetHouse: this.pickupHouseIds.has(houseId),
      isDeliveryHouse: houseId === this.deliveryHouseId,
      hasPassword: this.passwordHouseIds.has(houseId),
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
      if (
        building.right - building.left > 640 ||
        building.bottom - building.top > 640
      ) {
        return;
      }

      const arrow = this.add
        .image(
          (building.left + building.right) / 2,
          building.bottom + 18,
          "seta-construcao",
        )
        .setDisplaySize(42, 32)
        .setDepth(8);
      const trigger = this.add
        .rectangle(arrow.x, arrow.y, 52, 40, 0x00e5ff, 0.22)
        .setStrokeStyle(2, 0x00e5ff, 0.9)
        .setDepth(7);
      this.physics.add.existing(trigger);
      trigger.body.setAllowGravity(false);
      trigger.body.setImmovable(true);
      trigger.setData("arrow", arrow);
      trigger.setData("houseId", this.arrowTriggerList.length);
      trigger.setData("coordinates", { x: trigger.x, y: trigger.y });
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
      .rectangle(x, y, 52, 40, 0x00e5ff, 0.22)
      .setStrokeStyle(2, 0x00e5ff, 0.9)
      .setDepth(7);
    this.physics.add.existing(trigger);
    trigger.body.setAllowGravity(false);
    trigger.body.setImmovable(true);
    trigger.setData("arrow", arrow);
    trigger.setData("houseId", this.arrowTriggerList.length);
    trigger.setData("coordinates", { x: trigger.x, y: trigger.y });
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
