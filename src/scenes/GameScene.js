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

        // Movimento
        if (
            this.cursors.left.isDown ||
            this.wasd.A.isDown
        ) {
            velocityX = -speed;
        }

        if (
            this.cursors.right.isDown ||
            this.wasd.D.isDown
        ) {
            velocityX = speed;
        }

        if (
            this.cursors.up.isDown ||
            this.wasd.W.isDown
        ) {
            velocityY = -speed;
        }

        if (
            this.cursors.down.isDown ||
            this.wasd.S.isDown
        ) {
            velocityY = speed;
        }

        this.playerBody.setVelocity(
            velocityX,
            velocityY
        );

        // Distância percorrida desde o último pedaço do rastro
        const distance = Phaser.Math.Distance.Between(
            this.lastTrailX,
            this.lastTrailY,
            this.player.x,
            this.player.y
        );

        // Cria um novo segmento a cada 12 pixels
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
        // Cria uma linha entre a posição anterior
        // e a posição atual do Courier
        const trail = this.add.graphics();

        trail.lineStyle(
            8,
            0x00ffff,
            1
        );

        trail.lineBetween(
            this.lastTrailX,
            this.lastTrailY,
            this.player.x,
            this.player.y
        );

        // Faz o segmento desaparecer depois de 2 segundos
        this.tweens.add({
            targets: trail,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                trail.destroy();
            }
        });

        this.trail.push(trail);
    }

    createGrid() {
        const graphics = this.add.graphics();

        graphics.lineStyle(
            1,
            0x15152a,
            1
        );

        const gridSize = 40;

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