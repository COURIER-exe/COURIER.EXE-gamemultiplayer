export class InteriorScene extends Phaser.Scene {
  constructor() {
    super("InteriorScene");
    this.walls = null;
    this.player = null;
    this.mainPlayer = null;
    this.returnPosition = null;
    this.isTargetHouse = false;
    this.directionArrow = null;
    this.darkOverlay = null;
    this.interfaceBlocked = false;
    this.computerInteractionLocked = false;
    this.packageInteractionLocked = false;
  }

  init(data) {
    this.playerColor = data.color ?? "ciano";
    this.mainPlayer = this.scene.get("GameScene")?.player ?? null;
    this.returnPosition = data.returnPosition ?? { x: 0, y: 0 };
    this.isTargetHouse = data.isTargetHouse === true;
    this.packagePassword = this.scene.get("GameScene")?.packagePassword ?? null;
  }

  create() {
    window.setInteriorExitButtonVisible?.(true);
    this.cameras.main.fadeIn(250, 5, 5, 10);
    this.map = this.make.tilemap({ key: "mapaInterior" });
    const tilesets = [
      this.map.addTilesetImage("Interiors_32x32_0", "interiorTileset0"),
      this.map.addTilesetImage("Interiors_32x32_1", "interiorTileset1"),
      this.map.addTilesetImage("Interiors_32x32_2", "interiorTileset2"),
    ];

    ["chao", "tapete", "acessorios", "pc", "parede"].forEach((layerName) => {
      this.map.createLayer(layerName, tilesets);
    });

    this.walls = this.physics.add.staticGroup();
    this.createCollisionFromMap();

    const playerTexture = `player-${this.playerColor}`;
    this.player = this.physics.add.sprite(256, 320, playerTexture, 247);
    this.player.carregandoPacote = this.mainPlayer?.carregandoPacote === true;
    this.player.setScale(0.5);
    this.player.setSize(24, 20).setOffset(20, 38);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);
    this.createComputerTrigger();

    if (this.isTargetHouse) {
      this.createObjectives();
    }

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
    this.physics.world.setBounds(
      bounds.left,
      bounds.top,
      bounds.width,
      bounds.height,
    );
    this.cameras.main.setBounds(
      bounds.left,
      bounds.top,
      bounds.width,
      bounds.height,
    );
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBackgroundColor(0x0d1320);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.keyEsc = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );

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

    this.directionArrow = this.add
      .triangle(640, 78, -24, -18, -24, 18, 28, 0, 0xffff00)
      .setScrollFactor(0)
      .setDepth(20)
      .setVisible(false);
  }

  update() {
    if (
      this.computerInteractionLocked &&
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.computerTrigger.x,
        this.computerTrigger.y,
      ) > 60
    ) {
      this.computerInteractionLocked = false;
    }
    if (
      this.packageInteractionLocked &&
      this.pickup &&
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.pickup.x,
        this.pickup.y,
      ) > 60
    ) {
      this.packageInteractionLocked = false;
    }

    if (this.interfaceBlocked) {
      this.player.body.setVelocity(0, 0);
      return;
    }

    const velocity = 300;
    let velocityX = 0;
    let velocityY = 0;
    const touchX = window.joystickInput?.x ?? 0;
    const touchY = window.joystickInput?.y ?? 0;
    const directionalInput = window.directionalInput ?? new Set();

    if (
      this.cursors.left.isDown ||
      this.wasd.A.isDown ||
      directionalInput.has("left")
    )
      velocityX = -velocity;
    if (
      this.cursors.right.isDown ||
      this.wasd.D.isDown ||
      directionalInput.has("right")
    )
      velocityX = velocity;
    if (
      this.cursors.up.isDown ||
      this.wasd.W.isDown ||
      directionalInput.has("up")
    )
      velocityY = -velocity;
    if (
      this.cursors.down.isDown ||
      this.wasd.S.isDown ||
      directionalInput.has("down")
    )
      velocityY = velocity;

    if (Math.abs(touchX) > 0.1 || Math.abs(touchY) > 0.1) {
      velocityX = touchX * velocity;
      velocityY = touchY * velocity;
    }

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

    this.updateObjectiveArrow();
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

  createObjectives() {
    this.delivery = this.add.rectangle(420, 330, 40, 40, 0xffff00);
    this.objectiveGroup = this.physics.add.staticGroup();
    this.objectiveGroup.add(this.delivery);

    if (!this.player.carregandoPacote) {
      this.pickup = this.add.rectangle(120, 300, 40, 40, 0xffff00);
      this.objectiveGroup.add(this.pickup);
      this.physics.add.overlap(
        this.player,
        this.pickup,
        this.collectPackage,
        null,
        this,
      );
    }
    this.physics.add.overlap(
      this.player,
      this.delivery,
      this.completeDelivery,
      null,
      this,
    );
  }

  createComputerTrigger() {
    this.computerArrow = this.add
      .image(400, 320, "seta-construcao")
      .setDisplaySize(42, 32)
      .setDepth(8);
    this.computerTrigger = this.add
      .rectangle(400, 320, 52, 40, 0x00ff88, 0.22)
      .setStrokeStyle(2, 0x00ff88, 0.9)
      .setDepth(7);
    this.physics.add.existing(this.computerTrigger, true);
    this.tweens.add({
      targets: [this.computerArrow, this.computerTrigger],
      y: this.computerArrow.y - 7,
      duration: 650,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    this.physics.add.overlap(
      this.player,
      this.computerTrigger,
      this.openComputer,
      null,
      this,
    );
  }

  openComputer() {
    if (this.interfaceBlocked || this.computerInteractionLocked) return;

    this.interfaceBlocked = true;
    this.computerInteractionLocked = true;
    this.packagePassword = Array.from({ length: 4 }, () =>
      Phaser.Math.Between(0, 9),
    ).join("");
    this.scene.get("GameScene").packagePassword = this.packagePassword;
    window.openTerminalCode?.(this.packagePassword);
  }

  setInterfaceBlocked(blocked) {
    this.interfaceBlocked = blocked;
  }

  collectPackage() {
    if (
      this.player.carregandoPacote ||
      !this.pickup?.active ||
      this.packageInteractionLocked
    )
      return;

    if (!this.packagePassword) {
      this.showObjectiveMessage(
        "SENHA NECESSÁRIA",
        "Encontre um PC em qualquer interior.",
      );
      return;
    }

    this.interfaceBlocked = true;
    this.packageInteractionLocked = true;
    window.openPackagePassword?.(this.packagePassword, () => {
      this.unlockPackage();
    });
  }

  unlockPackage() {
    if (this.player.carregandoPacote || !this.pickup?.active) return;

    this.player.carregandoPacote = true;
    if (this.mainPlayer) this.mainPlayer.carregandoPacote = true;
    this.pickup.destroy();
    this.showObjectiveMessage(
      "PACOTE COLETADO!",
      "Leve até o outro marcador amarelo.",
    );
  }

  completeDelivery() {
    if (!this.player.carregandoPacote || !this.delivery?.active) return;

    this.player.carregandoPacote = false;
    if (this.mainPlayer) this.mainPlayer.carregandoPacote = false;
    this.delivery.destroy();
    this.showCompletionScreen();
  }

  showCompletionScreen() {
    this.interfaceBlocked = true;
    this.player.body.setVelocity(0, 0);
    window.setInteriorExitButtonVisible?.(false);
    window.setJoystickVisible?.(false);
    window.setCoordinatesVisible?.(false);

    this.add
      .rectangle(640, 360, 1280, 720, 0x000000)
      .setScrollFactor(0)
      .setDepth(100);

    this.add
      .text(640, 255, "DESAFIO CONCLUÍDO", {
        fontFamily: "Arial",
        fontSize: "42px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    this.add
      .text(640, 315, "Pacote entregue com sucesso.", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#d1d5db",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    const menuButton = this.add
      .rectangle(640, 415, 360, 72, 0x00a9a9)
      .setStrokeStyle(2, 0x00f5ee)
      .setScrollFactor(0)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(640, 415, "VOLTAR AO MENU PRINCIPAL", {
        fontFamily: "Arial",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102);

    menuButton.on("pointerover", () => menuButton.setFillStyle(0x00d4d4));
    menuButton.on("pointerout", () => menuButton.setFillStyle(0x00a9a9));
    menuButton.once("pointerdown", () => this.returnToMainMenu());
  }

  returnToMainMenu() {
    this.scene.stop("GameScene");
    this.scene.start("CharacterSelect");
  }

  updateObjectiveArrow() {
    if (!this.directionArrow) return;

    const target = this.player.carregandoPacote ? this.delivery : this.pickup;
    const targetIsActive = target && target.active !== false;
    if (!this.isTargetHouse || !targetIsActive) {
      this.directionArrow.setVisible(false);
      return;
    }

    this.directionArrow
      .setVisible(true)
      .setRotation(
        Phaser.Math.Angle.Between(
          this.player.x,
          this.player.y,
          target.x,
          target.y,
        ),
      );
  }

  showObjectiveMessage(title, subtitle) {
    const titleText = this.add
      .text(640, 300, title, {
        fontFamily: "Arial",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#ffff00",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(30);
    const subtitleText = this.add
      .text(640, 355, subtitle, {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(30);

    this.time.delayedCall(2000, () => {
      titleText.destroy();
      subtitleText.destroy();
    });
  }

  getInteriorBounds() {
    const collisionLayer = this.map.getObjectLayer("colission");
    const objects = collisionLayer?.objects ?? [];
    const right = Math.max(
      ...objects.map((object) => object.x + object.width),
      544,
    );
    const bottom = Math.max(
      ...objects.map((object) => object.y + object.height),
      544,
    );
    return { left: -64, top: -64, width: right + 128, height: bottom + 128 };
  }

  exitInterior() {
    window.setInteriorExitButtonVisible?.(false);
    const mainScene = this.scene.get("GameScene");
    mainScene.player.x = this.returnPosition.x;
    mainScene.player.y = this.returnPosition.y;
    mainScene.interiorCooldownUntil = mainScene.time.now + 700;
    this.scene.stop("InteriorScene");
    this.scene.resume("GameScene");
    mainScene.showNotification("Você voltou para o mapa externo.");
  }
}
