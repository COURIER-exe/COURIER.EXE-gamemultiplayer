export class InteriorScene extends Phaser.Scene {
  constructor() {
    super("InteriorScene");
    this.walls = null;
    this.player = null;
    this.returnPosition = null;
  }

  init(data) {
    this.playerColor = data.color ?? "ciano";
    this.returnPosition = data.returnPosition ?? { x: 0, y: 0 };
  }

  create() {
    this.cameras.main.fadeIn(250, 5, 5, 10);
    this.map = this.make.tilemap({ key: "mapaInterior" });
    const tilesets = [
      this.map.addTilesetImage(
        "Interiors_32x32_0",
        "interiorTileset0",
      ),
      this.map.addTilesetImage(
        "Interiors_32x32_1",
        "interiorTileset1",
      ),
      this.map.addTilesetImage(
        "Interiors_32x32_2",
        "interiorTileset2",
      ),
    ];

    ["chao", "tapete", "acessorios", "parede"].forEach((layerName) => {
      this.map.createLayer(layerName, tilesets);
    });

    this.walls = this.physics.add.staticGroup();
    this.createCollisionFromMap();

    const playerTexture = `player-${this.playerColor}`;
    this.player = this.physics.add.sprite(256, 320, playerTexture, 247);
    this.player.setScale(0.5);
    this.player.setSize(24, 20).setOffset(20, 38);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);

    this.anims.create({
      key: `interior-walk-${this.playerColor}`,
      frames: this.anims.generateFrameNumbers(playerTexture, {
        start: 247,
        end: 252,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.playerAnimation = `interior-walk-${this.playerColor}`;

    const bounds = this.getInteriorBounds();
    this.physics.world.setBounds(bounds.left, bounds.top, bounds.width, bounds.height);
    this.cameras.main.setBounds(bounds.left, bounds.top, bounds.width, bounds.height);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.add
      .text(20, 20, "INTERIOR", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "18px",
        fontStyle: "bold",
        backgroundColor: "rgba(5,5,10,0.65)",
        padding: { x: 10, y: 8 },
      })
      .setScrollFactor(0)
      .setDepth(20);
  }

  update() {
    const velocity = 300;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) velocityX = -velocity;
    if (this.cursors.right.isDown || this.wasd.D.isDown) velocityX = velocity;
    if (this.cursors.up.isDown || this.wasd.W.isDown) velocityY = -velocity;
    if (this.cursors.down.isDown || this.wasd.S.isDown) velocityY = velocity;

    this.player.body.setVelocity(velocityX, velocityY);
    if (velocityX !== 0 || velocityY !== 0) {
      this.player.anims.play(this.playerAnimation, true);
      this.player.setFlipX(velocityX > 0);
    } else {
      this.player.anims.stop();
      this.player.setFrame(247);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.exitInterior();
    }
  }

  createCollisionFromMap() {
    const collisionLayer = this.map.getObjectLayer("colission");
    if (!collisionLayer) return;

    collisionLayer.objects.forEach((object) => {
      if (!object.width || !object.height) return;
      const wall = this.add.rectangle(
        object.x + object.width / 2,
        object.y + object.height / 2,
        object.width,
        object.height,
      );
      wall.setVisible(false);
      this.physics.add.existing(wall, true);
      this.walls.add(wall);
    });
  }

  getInteriorBounds() {
    const collisionLayer = this.map.getObjectLayer("colission");
    const objects = collisionLayer?.objects ?? [];
    const right = Math.max(...objects.map((object) => object.x + object.width), 544);
    const bottom = Math.max(...objects.map((object) => object.y + object.height), 544);
    return { left: -64, top: -64, width: right + 128, height: bottom + 128 };
  }

  exitInterior() {
    const mainScene = this.scene.get("GameScene");
    mainScene.player.x = this.returnPosition.x;
    mainScene.player.y = this.returnPosition.y;
    mainScene.interiorCooldownUntil = mainScene.time.now + 700;
    this.scene.stop("InteriorScene");
    this.scene.resume("GameScene");
    mainScene.showNotification("Você voltou para o mapa externo.");
  }
}
