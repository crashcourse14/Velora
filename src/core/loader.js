/**
 * loader.js
 * Simulates a game load sequence where load time scales with the number of src files.
 */

const FILES = {

  //This file should obviously exist or the game wouldn't load
  "/src/index.html": null,

  "/src/assets/textures/important/background.png": null,
  "/src/assets/textures/important/logo.png": null,

  /* JAVASCRIPT FILES - No need to put them in choronical order*/
  "/src/core/core.js": null,
  "/src/core/errorCatcher.js": null,
  "/src/core/loader": null,
  "/src/main.js": null,
  "/src/config.js": null,

  /* CSS FILES*/

  "/src/styles/styles.css": null,

};

// Helpers

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadFile(path) {
  return new Promise((resolve, reject) => {
    if (!path.startsWith("/src/")) {
      return reject(new Error(`Invalid file path: "${path}" — must begin with /src/`));
    }

    const delay = randomBetween(300, 600);

    setTimeout(() => {
      console.log(`[Loader] ✓ Loaded ${path} (${delay}ms)`);
      resolve({ path, loadTime: delay });
    }, delay);
  });
}

/*
New screen system. 
Cleans up boilerplate then from the last version of this bs
*/

function showScreen(id) {
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

// Main game loader (Should probably be in main.js but who cares?)

async function loadGame() {
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

// Tis is where thy loader loads

loadGame()
  .then(({ files, totalTime }) => {
    console.log(`[Loader] Game ready! Total load time: ${totalTime}ms`);

    // UI SWITCH (single source of truth)
    showScreen("MainMenu");

    console.log("[Loader] Switched to MainMenu");
  })
  .catch((err) => {
    console.error(`[Loader] Load failed — ${err.message}`);

    // optional fallback UI
    const loading = document.getElementById("loadingScreen");
    if (loading) loading.innerText = "Load failed. Check console.";
  });