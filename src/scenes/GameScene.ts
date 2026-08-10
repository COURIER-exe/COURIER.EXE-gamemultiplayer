import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Rectangle;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };

    constructor() {
        super("GameScene");
    }

    create(): void {
        // Fundo da arena
        this.add.rectangle(
            640,
            360,
            1280,
            720,
            0x05050a
        );

        // Grid da arena
        this.createGrid();

        // Courier
        this.player = this.add.rectangle(
            640,
            360,
            32,
            32,
            0x00ffff
        );

        // Controles
        this.cursors = this.input.keyboard!.createCursorKeys();

        this.wasd = {
            W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
    }

    update(): void {
        const speed = 300;

        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.x -= speed * (1 / 60);
        }

        if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.x += speed * (1 / 60);
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.y -= speed * (1 / 60);
        }

        if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.y += speed * (1 / 60);
        }

        // Impede o Courier de sair da arena
        this.player.x = Phaser.Math.Clamp(
            this.player.x,
            16,
            1264
        );

        this.player.y = Phaser.Math.Clamp(
            this.player.y,
            16,
            704
        );
    }

    private createGrid(): void {
        const graphics = this.add.graphics();

        graphics.lineStyle(
            1,
            0x15152a,
            1
        );

        const gridSize = 40;

        for (let x = 0; x <= 1280; x += gridSize) {
            graphics.lineBetween(
                x,
                0,
                x,
                720
            );
        }

        for (let y = 0; y <= 720; y += gridSize) {
            graphics.lineBetween(
                0,
                y,
                1280,
                y
            );
        }
    }
}