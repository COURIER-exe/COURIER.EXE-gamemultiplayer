import { Preloader } from "./scenes/Preloader.js";
import { CharacterSelect } from "./scenes/CharacterSelect.js";
import { GameScene } from "./scenes/GameScene.js";
import { InteriorScene } from "./scenes/InteriorScene.js";

window.directionalInput = new Set();

document.querySelectorAll(".direction-button").forEach((button) => {
  const direction = button.dataset.direction;

  const press = (event) => {
    event.preventDefault();
    window.directionalInput.add(direction);
    button.classList.add("is-pressed");
  };

  const release = (event) => {
    event.preventDefault();
    window.directionalInput.delete(direction);
    button.classList.remove("is-pressed");
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
});

window.addEventListener("blur", () => {
  window.directionalInput.clear();
  document.querySelectorAll(".direction-button").forEach((button) => {
    button.classList.remove("is-pressed");
  });
});

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
