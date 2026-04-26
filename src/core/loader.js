const FILES = {
  "/src/index.html": null,

  "/src/assets/textures/important/background.png": null,
  "/src/assets/textures/important/logo.png": null,
  "/src/assets/textures/important/stoat.png": null,
  "/src/assets/textures/tiles/trees.png": null,
  "/src/assets/audio/MainMenu.mp3": null,
  "/src/assets/audio/MainMenu2.mp3": null,
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
  "/src/state.js": null,

  /* CSS FILES */
  "/src/styles/styles.css": null,
};

// Asset cache for images
const imageCache = {};

async function loadFile(path) {
  const startTime = performance.now();
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
  }

  let data;
  let size;
  
  // Load images and cache them
  if (path.endsWith('.png') || path.endsWith('.jpg')) {
    const blob = await response.blob();
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
    imageCache[path] = img;
    size = blob.size;
    data = new Uint8Array(size);
  } else {
    data = await response.arrayBuffer();
    size = data.byteLength;
  }
  
  const loadTime = Math.round(performance.now() - startTime);
  console.log(`[Loader] Loaded: ${path}`);
  return { path, loadTime, size };
}

export function getImage(path) {
  return imageCache[path];
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

  console.log(`[UI] Showing screen: ${id}`);
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

  showScreen("ClickToContinue");
  return { files: results, totalTime };
}