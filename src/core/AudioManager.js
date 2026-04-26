const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const audioBuffers = {};

export async function loadAudio(name, url) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBuffers[name] = audioBuffer;
}

export function playAudio(name, loop = false) {
  const buffer = audioBuffers[name];
  if (!buffer) {
    console.warn("Audio not found:", name);
    return;
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;
  source.connect(audioContext.destination);
  source.start(0);

  return source;
}

export function unlockAudio() {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

export function initButtonSounds() {
  const clickSound = new Audio('/src/assets/sounds/button.mp3');
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      clickSound.currentTime = 0;
      clickSound.play();
    });
  });
}