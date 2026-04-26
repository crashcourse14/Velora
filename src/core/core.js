import { unlockAudio, playAudio } from "./AudioManager.js";
import { showScreen } from "./loader.js";

export function initParallaxBg() {
    const bg = document.getElementById("bg");
    if (!bg) return;

    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

    document.addEventListener("mousemove", (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        targetX = (x - 0.5) * 20;
        targetY = (y - 0.5) * 20;
    });

    function animate() {
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;
        bg.style.backgroundPosition = `calc(50% + ${currentX}px) calc(50% + ${currentY}px)`;
        requestAnimationFrame(animate);
    }

    animate();
}

const mainMenuTracks = ["MainMenuMusicA", "MainMenuMusicB"];

export function startMusicAndLoadMenu() {
    unlockAudio();
    showScreen("MainMenu");
    const chosenTrack = mainMenuTracks[Math.floor(Math.random() * mainMenuTracks.length)];
    playAudio(chosenTrack, true);
}