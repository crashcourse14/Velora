const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioContext.createGain();
masterGain.gain.value = 1;
masterGain.connect(audioContext.destination);

const audioBuffers = {};
let currentVolume = 1;

export async function loadAudio(name, url) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBuffers[name] = audioBuffer;
}

function resolveAudioBuffer(name) {
  if (audioBuffers[name]) {
    return audioBuffers[name];
  }

  const aliasMap = {
    MainMenuMusic: ["MainMenuMusicA", "MainMenuMusicB"],
  };

  const aliases = aliasMap[name];
  if (aliases) {
    for (const alias of aliases) {
      if (audioBuffers[alias]) {
        return audioBuffers[alias];
      }
    }
  }

  return null;
}

export function playAudio(name, loop = false) {
  const buffer = resolveAudioBuffer(name);
  if (!buffer) {
    console.warn("Audio not found:", name);
    return;
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;
  source.connect(masterGain);
  source.start(0);

  return source;
}

export function setMusicVolume(value) {
  const clamped = Math.min(1, Math.max(0, Number(value)));
  currentVolume = clamped;
  masterGain.gain.value = clamped;
}

export function getMusicVolume() {
  return currentVolume;
}

export function unlockAudio() {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

export function initButtonSounds() {
  const clickSound = new Audio('/src/assets/sounds/button.mp3');
  clickSound.volume = 0.8;
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      clickSound.currentTime = 0;
      clickSound.play();
    });
  });
}
