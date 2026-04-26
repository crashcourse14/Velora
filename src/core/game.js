import { showScreen } from "./loader.js";
import { createNewWorld } from "../world/world.js";
import { generateWorld } from "../world/generator.js";
import { player, update } from "../entities/player.js";
import { render } from "../render/renderer.js";
import { keys } from "./input.js";
import { state } from "../state.js";

window.addEventListener("DOMContentLoaded", () => {
    state.canvas = document.getElementById("gameCanvas");
    state.ctx = state.canvas.getContext("2d");

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
});

function resizeCanvas() {
    if (!state.canvas) return;
    state.canvas.width  = window.innerWidth;
    state.canvas.height = window.innerHeight;
}

function startGameLoop() {
    function loop() {
        update(keys, state.world, state.canvas);
        render(state.world, state.ctx, state.canvas);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

export function GenerateNewWorld() {
    showScreen("GameGUI");

    state.world = createNewWorld();
    generateWorld(state.world);

    player.x = state.world.playerSpawn.x;
    player.y = state.world.playerSpawn.y;

    startGameLoop();
    console.log("[Game] World generated and game loop started.");
}