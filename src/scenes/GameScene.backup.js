import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");

        this.trail = [];
    }

    create() {
        this.physics.world.setBounds(0, 0, 1280, 720);

        // Fundo
        this.add.rectangle(
            640,
            360,
            1280,
            720,
            0x05050a
        );

        // Grid
        this.createGrid();

        // Paredes
        this.createWalls();

        // Courier
        this.player = this.add.rectangle(
            640,
            360,
            32,
            32,
            0x00ffff
        );

        // Ponto de entrega
        this.delivery = this.add.rectangle(
            1100,
            600,
            40,
            40,
            0xff00ff
        );

        this.deliveryGroup =
            this.physics.add.staticGroup();

        this.deliveryGroup.add(
            this.delivery
        );
        // Ponto de coleta do pacote
this.pickup = this.add.rectangle(
    180,
    120,
    40,
    40,
    0xffff00
);

this.pickupGroup =
    this.physics.add.staticGroup();

this.pickupGroup.add(
    this.pickup
);

        this.physics.add.existing(this.player);

        this.playerBody = this.player.body;

        this.playerBody.setCollideWorldBounds(true);

        // Última posição registrada do rastro
        this.lastTrailX = this.player.x;
        this.lastTrailY = this.player.y;

        // Colisão Courier x paredes
        this.physics.add.collider(
            this.player,
            this.walls
        );

        // Colisão Courier x ponto de entrega
        this.physics.add.overlap(
            this.player,
            this.deliveryGroup,
            this.completeDelivery,
            null,
            this
        );
        // Colisão Courier x ponto de coleta
this.physics.add.overlap(
    this.player,
    this.pickupGroup,
    this.collectPackage,
    null,
    this
);

        // Controles
        this.cursors =
            this.input.keyboard.createCursorKeys();

        this.wasd = {
            W: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.W
            ),

            A: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.A
            ),

            S: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.S
            ),

            D: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.D
            )
        };
    }

    update() {
        const speed = 300;

        let velocityX = 0;
        let velocityY = 0;

        // Movimento para esquerda
        if (
            this.cursors.left.isDown ||
            this.wasd.A.isDown
        ) {
            velocityX = -speed;
        }

        // Movimento para direita
        if (
            this.cursors.right.isDown ||
            this.wasd.D.isDown
        ) {
            velocityX = speed;
        }

        // Movimento para cima
        if (
            this.cursors.up.isDown ||
            this.wasd.W.isDown
        ) {
            velocityY = -speed;
        }

        // Movimento para baixo
        if (
            this.cursors.down.isDown ||
            this.wasd.S.isDown
        ) {
            velocityY = speed;
        }

        // Aplica velocidade
        this.playerBody.setVelocity(
            velocityX,
            velocityY
        );

        // Distância desde o último pedaço do rastro
        const distance =
            Phaser.Math.Distance.Between(
                this.lastTrailX,
                this.lastTrailY,
                this.player.x,
                this.player.y
            );

        // Cria um novo pedaço do rastro
        // a cada 12 pixels
        if (
            distance >= 12 &&
            (velocityX !== 0 || velocityY !== 0)
        ) {
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
            0x00ffff
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

                const index =
                    this.trail.indexOf(trail);

                if (index !== -1) {
                    this.trail.splice(index, 1);
                }
            }
        });
    }
collectPackage() {
    console.log("Pacote coletado!");

    // Remove o ponto de coleta
    this.pickup.destroy();

    // Texto principal
    const pickupText = this.add.text(
        640,
        300,
        "PACOTE COLETADO!",
        {
            fontFamily: "Arial",
            fontSize: "48px",
            fontStyle: "bold",
            color: "#ffff00"
        }
    ).setOrigin(0.5);

    // Texto secundário
    const pickupSubText = this.add.text(
        640,
        355,
        "Leve o pacote até o destino.",
        {
            fontFamily: "Arial",
            fontSize: "22px",
            color: "#ffffff"
        }
    ).setOrigin(0.5);

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
        const deliveryText = this.add.text(
            640,
            300,
            "ENTREGA CONCLUÍDA!",
            {
                fontFamily: "Arial",
                fontSize: "48px",
                fontStyle: "bold",
                color: "#00ffff"
            }
        ).setOrigin(0.5);

        // Texto secundário
        const deliverySubText = this.add.text(
            640,
            355,
            "Pacote entregue com sucesso.",
            {
                fontFamily: "Arial",
                fontSize: "22px",
                color: "#ffffff"
            }
        ).setOrigin(0.5);

        // Remove as mensagens depois de 2 segundos
        this.time.delayedCall(2000, () => {
            deliveryText.destroy();
            deliverySubText.destroy();
        });
    }

    createGrid() {
        const graphics = this.add.graphics();

        graphics.lineStyle(
            1,
            0x15152a,
            1
        );

        const gridSize = 40;

        // Linhas verticais
        for (
            let x = 0;
            x <= 1280;
            x += gridSize
        ) {
            graphics.lineBetween(
                x,
                0,
                x,
                720
            );
        }

        // Linhas horizontais
        for (
            let y = 0;
            y <= 720;
            y += gridSize
        ) {
            graphics.lineBetween(
                0,
                y,
                1280,
                y
            );
        }
    }

    createWalls() {
        this.walls =
            this.physics.add.staticGroup();

        // Parede externa superior
        this.createWall(
            640,
            20,
            1280,
            40
        );

        // Parede externa inferior
        this.createWall(
            640,
            700,
            1280,
            40
        );

        // Parede externa esquerda
        this.createWall(
            20,
            360,
            40,
            720
        );

        // Parede externa direita
        this.createWall(
            1260,
            360,
            40,
            720
        );

        // Obstáculo central superior
        this.createWall(
            640,
            280,
            320,
            40
        );

        // Obstáculo central inferior
        this.createWall(
            640,
            440,
            320,
            40
        );

        // Obstáculo esquerdo
        this.createWall(
            300,
            360,
            40,
            200
        );

        // Obstáculo direito
        this.createWall(
            980,
            360,
            40,
            200
        );
    }

    createWall(x, y, width, height) {
        const wall =
            this.add.rectangle(
                x,
                y,
                width,
                height,
                0x16163a
            );

        this.walls.add(wall);
    }
}