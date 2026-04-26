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

function connectToServer(world) {
    try {
        const socket = new WebSocket(world.server.serverUrl);
        
        socket.onopen = () => {
            console.log("[Game] Connected to multiplayer server");
            world.server.connected = true;
            world.server.socket = socket;
        };
        
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            handleServerMessage(world, message);
        };
        
        socket.onerror = (error) => {
            console.warn("[Game] Server connection error - running in offline mode", error);
            world.server.connected = false;
        };
        
        socket.onclose = () => {
            console.log("[Game] Disconnected from server");
            world.server.connected = false;
        };
    } catch (error) {
        console.warn("[Game] Failed to connect to server - running offline", error);
        world.server.connected = false;
    }
}

function handleServerMessage(world, message) {
    switch (message.type) {
        case 'welcome':
            world.server.playerId = message.playerId;
            console.log(`[Game] Player ID assigned: ${message.playerId}`);
            break;
            
        case 'playerJoined':
            console.log(`[Game] Player joined: ${message.playerId}`);
            break;
            
        case 'playerLeft':
            world.players.delete(message.playerId);
            console.log(`[Game] Player left: ${message.playerId}`);
            break;
            
        case 'playerMoved':
            if (message.playerId !== world.server.playerId) {
                world.players.set(message.playerId, {
                    id: message.playerId,
                    x: message.x,
                    y: message.y
                });
            }
            break;
            
        case 'tileChanged':
            if (world.data.tiles[message.y]) {
                world.data.tiles[message.y][message.x] = message.tileId;
            }
            break;
    }
}

export function GenerateNewWorld() {
    showScreen("GameGUI");

    state.world = createNewWorld();
    generateWorld(state.world);

    player.x = state.world.playerSpawn.x;
    player.y = state.world.playerSpawn.y;

    // Connect to multiplayer server
    connectToServer(state.world);

    startGameLoop();
    console.log("[Game] World generated and game loop started.");
}