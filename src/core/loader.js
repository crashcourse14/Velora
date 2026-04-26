const FILES = {
  "/src/index.html": null,

  "/src/assets/textures/important/background.png": null,
  "/src/assets/textures/important/logo.png": null,
  "/src/assets/audio/MainMenu.mp3": null,
  "/src/assets/sounds/button.mp3": null,

  /* JAVASCRIPT FILES */
  "/src/core/core.js": null,
  "/src/core/AudioManager.js": null,
  "/src/core/errorCatcher.js": null,
  "/src/core/UpdateManager.js": null,
  "/src/core/loader.js": null,
  "/src/core/game.js": null,
  "/src/core/input.js": null,
  "/src/entities/player.js": null,
  "/src/render/camera.js": null,
  "/src/render/renderer.js": null,
  "/src/world/generator.js": null,
  "/src/world/tiles.js": null,
  "/src/world/world.js": null,
  "/src/main.js": null,
  "/src/config.js": null,

  /* CSS FILES */
  "/src/styles/styles.css": null,
};

// Helpers

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadFile(path) {
  return new Promise((resolve) => {
    const delay = randomBetween(300, 600);
    setTimeout(() => {
      console.log(`[Loader] ✓ Loaded ${path} (${delay}ms)`);
      resolve({ path, loadTime: delay });
    }, delay);
  });
}

export function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
    screen.classList.add("hidden");
  });

  const target = document.getElementById(id);
  if (!target) {
    console.error(`[UI] Screen not found: ${id}`);
    return;
  }

  target.classList.remove("hidden");
  target.classList.add("active");
}

export async function loadGame() {
  const paths = Object.keys(FILES);
  const totalFiles = paths.length;

  console.log(`[Loader] Starting game load — ${totalFiles} file(s)...`);
  const startTime = performance.now();

  const results = [];
  for (const path of paths) {
    const result = await loadFile(path);
    results.push(result);
  }

  const totalTime = Math.round(performance.now() - startTime);
  console.log(`[Loader] All ${totalFiles} file(s) loaded in ${totalTime}ms`);

  return { files: results, totalTime };
}