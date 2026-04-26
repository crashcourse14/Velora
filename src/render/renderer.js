import { TILE_DATA } from "../world/tiles.js";
import { camera } from "./camera.js";
import { player } from "../entities/player.js";

export function render(world, ctx, canvas) {
    if (!world || !ctx) return;

    const tileSize = 32;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < world.size.height; y++) {
        for (let x = 0; x < world.size.width; x++) {
            const tileId = world.data.tiles[y][x];
            const tile   = TILE_DATA[tileId];
            if (!tile) continue;

            const screenX = x * tileSize - camera.x;
            const screenY = y * tileSize - camera.y;

            // Skip tiles fully off screen
            if (screenX + tileSize < 0 || screenX > canvas.width)  continue;
            if (screenY + tileSize < 0 || screenY > canvas.height) continue;

            ctx.fillStyle = tile.color;
            ctx.fillRect(screenX, screenY, tileSize, tileSize);

            // Subtle grid line
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
            ctx.strokeRect(screenX, screenY, tileSize, tileSize);
        }
    }

    // Player
    ctx.fillStyle = "blue";
    ctx.fillRect(
        player.x * tileSize - camera.x,
        player.y * tileSize - camera.y,
        tileSize,
        tileSize
    );
}