import { Preloader } from "./scenes/Preloader.js";
import { RoomScene } from "./scenes/RoomScene.js";
import { CharacterSelect } from "./scenes/CharacterSelect.js";
import { GameScene } from "./scenes/GameScene.js";
import { InteriorScene } from "./scenes/InteriorScene.js";
import { MultiplayerClient } from "./MultiplayerClient.js";

window.directionalInput = new Set();
window.joystickInput = { x: 0, y: 0 };
window.openEvaluationForm = () =>
  window.open(
    "https://docs.google.com/forms/d/e/1FAIpQLSeeleFRJ3PbTeX9nmxFtfqF_3VMD6bBGixNGFODEtqjbHGK9A/viewform?entry.52413313=Courier.exe",
    "_blank",
    "noopener,noreferrer",
  );

const terminalModal = document.querySelector("#terminal-modal");
const terminalCode = document.querySelector("#terminal-code");
const passwordModal = document.querySelector("#password-modal");
const passwordForm = document.querySelector("#password-form");
const passwordInput = document.querySelector("#password-input");
const passwordError = document.querySelector("#password-error");
const introScreen = document.querySelector("#intro-screen");
const introVideo = document.querySelector("#intro-video");
const introAudio = document.querySelector("#intro-audio");
const introAudioDuration = 7;
let packagePasswordSubmit = null;
let terminalCodeCloseCallback = null;

let gameStarted = false;

const startGame = () => {
  if (gameStarted) return;

  gameStarted = true;
  introAudio.pause();
  introScreen.remove();
  window.multiplayer = new MultiplayerClient();
  window.game = new Phaser.Game(config);
};

introVideo.addEventListener("ended", startGame, { once: true });
introVideo.addEventListener("error", startGame, { once: true });
introAudio.addEventListener("timeupdate", () => {
  if (introAudio.currentTime < introAudioDuration) return;
  introAudio.pause();
  introAudio.currentTime = introAudioDuration;
});

window.openTerminalCode = (code, onClose) => {
  terminalCodeCloseCallback = onClose;
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
  const onClose = terminalCodeCloseCallback;
  terminalCodeCloseCallback = null;
  onClose?.();
};

document
  .querySelector("#close-terminal-button")
  .addEventListener("click", closeTerminal);

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

document
  .querySelector("#cancel-password-button")
  .addEventListener("click", closePassword);
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
const healthTrack = document.querySelector("#health-track");
const healthFill = document.querySelector("#health-fill");
const objectivesPanel = document.querySelector("#objectives-panel");
const objectivePassword = document.querySelector("#objective-password");
let joystickPointerId = null;

window.setJoystickVisible = (visible) => {
  joystick.style.display = visible ? "block" : "none";
  if (!visible) resetJoystick();
};

window.updateHealthBar = (currentHealth, maximumHealth) => {
  const ratio = Math.max(0, Math.min(1, currentHealth / maximumHealth));
  const percentage = Math.round(ratio * 100);
  healthFill.style.width = `${percentage}%`;
  healthTrack.setAttribute("aria-valuenow", String(percentage));
};

window.setObjectivesVisible = (visible) => {
  objectivesPanel.style.display = visible ? "block" : "none";
};

window.resetObjectiveProgress = () => {
  objectivePassword.textContent = "Senha: ----";
};

window.resetPasswordProgress = () => {
  objectivePassword.textContent = "Senha: ----";
  terminalCode.replaceChildren();
};

window.updateObjectiveProgress = (objectiveNumber, completed, password) => {
  if (objectiveNumber === 1 && password) {
    objectivePassword.textContent = `Senha: ${password}`;
  }
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
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  backgroundColor: "#05050a",
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: document.body,
  },
  scene: [Preloader, RoomScene, CharacterSelect, GameScene, InteriorScene],
};

window.addEventListener("load", () => {
  introVideo
    .play()
    .then(() => introAudio.play().catch(() => {}))
    .catch(startGame);
});
