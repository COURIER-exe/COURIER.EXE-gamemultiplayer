import { Preloader } from "./scenes/Preloader.js";
import { CharacterSelect } from "./scenes/CharacterSelect.js";
import { GameScene } from "./scenes/GameScene.js";
import { InteriorScene } from "./scenes/InteriorScene.js";

window.directionalInput = new Set();
window.joystickInput = { x: 0, y: 0 };

const exitHouseButton = document.querySelector("#exit-house-button");
const terminalModal = document.querySelector("#terminal-modal");
const terminalCode = document.querySelector("#terminal-code");
const passwordModal = document.querySelector("#password-modal");
const passwordForm = document.querySelector("#password-form");
const passwordInput = document.querySelector("#password-input");
const passwordError = document.querySelector("#password-error");
let packagePasswordSubmit = null;

window.setInteriorExitButtonVisible = (visible) => {
  exitHouseButton.style.display = visible ? "block" : "none";
};

exitHouseButton.addEventListener("click", () => {
  window.game?.scene.getScene("InteriorScene")?.exitInterior();
});

window.openTerminalCode = (code) => {
  terminalCode.replaceChildren(
    ...code.split("").map((digit) => {
      const slot = document.createElement("span");
      slot.textContent = digit;
      return slot;
    }),
  );
  terminalModal.hidden = false;
};

const closeTerminal = () => {
  terminalModal.hidden = true;
  window.game?.scene.getScene("InteriorScene")?.setInterfaceBlocked(false);
};

document.querySelector("#close-terminal-button").addEventListener("click", closeTerminal);

window.openPackagePassword = (expectedPassword, onSubmit) => {
  packagePasswordSubmit = onSubmit;
  passwordInput.value = "";
  passwordError.textContent = "";
  passwordModal.hidden = false;
  passwordInput.focus();
  passwordForm.dataset.expectedPassword = expectedPassword;
};

const closePassword = () => {
  passwordModal.hidden = true;
  packagePasswordSubmit = null;
  window.game?.scene.getScene("InteriorScene")?.setInterfaceBlocked(false);
};

document.querySelector("#cancel-password-button").addEventListener("click", closePassword);
passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passwordInput.value !== passwordForm.dataset.expectedPassword) {
    passwordError.textContent = "SENHA INCORRETA";
    passwordInput.select();
    return;
  }

  const submit = packagePasswordSubmit;
  closePassword();
  submit?.(true);
});

const joystick = document.querySelector("#joystick");
const joystickKnob = document.querySelector("#joystick-knob");
let joystickPointerId = null;

window.setJoystickVisible = (visible) => {
  joystick.style.display = visible ? "block" : "none";
  if (!visible) resetJoystick();
};

const resetJoystick = () => {
  joystickPointerId = null;
  window.joystickInput.x = 0;
  window.joystickInput.y = 0;
  joystickKnob.style.transform = "translate(-50%, -50%)";
};

const updateJoystick = (event) => {
  const bounds = joystick.getBoundingClientRect();
  const centerX = bounds.width / 2;
  const centerY = bounds.height / 2;
  const radius = bounds.width / 2 - joystickKnob.offsetWidth / 2 - 4;
  const dx = event.clientX - bounds.left - centerX;
  const dy = event.clientY - bounds.top - centerY;
  const distance = Math.hypot(dx, dy);
  const scale = distance > radius ? radius / distance : 1;
  const knobX = dx * scale;
  const knobY = dy * scale;

  window.joystickInput.x = knobX / radius;
  window.joystickInput.y = knobY / radius;
  joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
};

joystick.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  joystickPointerId = event.pointerId;
  joystick.setPointerCapture(event.pointerId);
  updateJoystick(event);
});
joystick.addEventListener("pointermove", (event) => {
  if (event.pointerId === joystickPointerId) updateJoystick(event);
});
joystick.addEventListener("pointerup", resetJoystick);
joystick.addEventListener("pointercancel", resetJoystick);

window.addEventListener("blur", () => {
  window.directionalInput.clear();
  resetJoystick();
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
