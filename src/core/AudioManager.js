const audioContext = new (window.AudioContext || window.webkitAudioContext)();

window.audioBuffers = {};

window.loadAudio = async function(name, url) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  window.audioBuffers[name] = audioBuffer;
};

window.playAudio = function(name, loop = false) {
  const buffer = window.audioBuffers[name];
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
};

window.unlockAudio = function() {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
};




const clickSound = new Audio('/src/assets/sounds/button.mp3');
const allButtons = document.querySelectorAll('button');


allButtons.forEach(button => {
  button.addEventListener('click', () => {
    clickSound.currentTime = 0; 
    clickSound.play();
  });
});
