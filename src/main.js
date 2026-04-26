import { debugMode } from "./config.js";
import { initErrorCatcher } from "./core/errorCatcher.js";
import { loadVersionText } from "./core/UpdateManager.js";
import { loadAudio, initButtonSounds, setMusicVolume, getMusicVolume } from "./core/AudioManager.js";
import { initInput } from "./core/input.js";
import { loadGame, showScreen } from "./core/loader.js";
import { initParallaxBg, startMusicAndLoadMenu } from "./core/core.js";
import { GenerateNewWorld } from "./core/game.js";

const MUSIC_VOLUME_KEY = "veloraMusicVolume";

function loadSavedMusicVolume() {
    const savedValue = localStorage.getItem(MUSIC_VOLUME_KEY);
    let volume = 1;

    if (savedValue !== null) {
        const parsed = parseFloat(savedValue);
        if (!Number.isNaN(parsed)) {
            volume = Math.min(1, Math.max(0, parsed));
        }
    }

    setMusicVolume(volume);
    return volume;
}

function initMusicVolumeSlider() {
    const slider = document.getElementById("musicVolumeSlider");
    const volumeText = document.getElementById("musicVolumeValue");
    if (!slider || !volumeText) {
        return;
    }

    const currentVolume = getMusicVolume();
    slider.value = currentVolume.toString();
    volumeText.innerText = `${Math.round(currentVolume * 100)}%`;

    slider.addEventListener("input", (event) => {
        const newValue = parseFloat(event.target.value);
        if (Number.isNaN(newValue)) {
            return;
        }

        setMusicVolume(newValue);
        localStorage.setItem(MUSIC_VOLUME_KEY, newValue.toString());
        volumeText.innerText = `${Math.round(newValue * 100)}%`;
    });
}

// --- Boot sequence ---

async function startup() {
    if (debugMode === true) {
        console.log("[Main] debugMode enabled — initializing error catcher");
        try {
            initErrorCatcher();
        } catch (err) {
            console.warn("[Main] initErrorCatcher failed:", err);
        }
    }

    initInput();
    initButtonSounds();
    initParallaxBg();
    loadVersionText();
    loadSavedMusicVolume();
    initMusicVolumeSlider();

    try {
        const { totalTime } = await loadGame();
        console.log(`[Main] Game ready! Total load time: ${totalTime}ms`);

        // Preload both menu music tracks so one can be chosen at random later.
        await Promise.all([
            loadAudio("MainMenuMusicA", "/src/assets/audio/MainMenu.mp3"),
            loadAudio("MainMenuMusicB", "/src/assets/audio/MainMenu2.mp3"),
        ]).catch(err =>
            console.warn("[Main] Audio preload failed (menu audio may not exist yet):", err.message)
        );
    } catch (err) {
        console.error(`[Main] Load failed — ${err.message}`);
        const loading = document.getElementById("loadingScreen");
        if (loading) loading.innerText = "Load failed. Check console.";
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startup);
} else {
    startup();
}

// --- Expose functions used by HTML onclick attributes ---

window.startMusicAndLoadMenu = startMusicAndLoadMenu; // matches typo in HTML
window.GenerateNewWorld = GenerateNewWorld;
window.showScreen = showScreen;