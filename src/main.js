import "./core/errorCatcher.js";

import { loadVersionText } from "./core/UpdateManager.js";
import { loadAudio, initButtonSounds } from "./core/AudioManager.js";
import { initInput } from "./core/input.js";
import { loadGame, showScreen } from "./core/loader.js";
import { initParallaxBg, startMusicAndLoadMenu } from "./core/core.js";
import { GenerateNewWorld } from "./core/game.js";

// --- Boot sequence ---

window.addEventListener("DOMContentLoaded", async () => {
    initInput();
    initButtonSounds();
    initParallaxBg();
    loadVersionText();

    try {
        const { totalTime } = await loadGame();
        console.log(`[Main] Game ready! Total load time: ${totalTime}ms`);

        // Preload audio after files are done — safe to do here, not blocking
        loadAudio("MainMenuMusic", "/src/assets/audio/MainMenu.mp3").catch(err =>
            console.warn("[Main] Audio preload failed (file may not exist yet):", err.message)
        );

        showScreen("ClickToContinue");
    } catch (err) {
        console.error(`[Main] Load failed — ${err.message}`);
        const loading = document.getElementById("loadingScreen");
        if (loading) loading.innerText = "Load failed. Check console.";
    }
});

// --- Expose functions used by HTML onclick attributes ---

window.startMusicAndLoadMenu = startMusicAndLoadMenu; // matches typo in HTML
window.GenerateNewWorld = GenerateNewWorld;
window.showScreen = showScreen;