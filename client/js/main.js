import { Preloader } from "./scenes/Preloader.js";
import { CharacterSelect } from "./scenes/CharacterSelect.js";
import { GameScene } from "./scenes/GameScene.js";
import { InteriorScene } from "./scenes/InteriorScene.js";

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: "#05050a",
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [Preloader, CharacterSelect, GameScene, InteriorScene],
};

window.onload = () => {
  window.game = new Phaser.Game(config);
};
