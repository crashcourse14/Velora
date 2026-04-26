import { TILE_DATA } from "../world/tiles.js";
import { camera } from "./camera.js";
import { player } from "../entities/player.js";
import { getImage } from "../core/loader.js";

export function render(world, ctx, canvas) {
    if (!world || !ctx) return;

    const tileSize = 16;

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

            // Draw tile
            if (tile.textureId) {
                // Draw from spritesheet image
                const imagePath = `/src/assets/textures/tiles/${tile.textureId}.png`;
                const image = getImage(imagePath);
                if (image) {
                    ctx.drawImage(
                        image,
                        tile.spriteX, tile.spriteY,           // source position
                        tile.spriteWidth, tile.spriteHeight,   // source size
                        screenX, screenY,                       // destination position
                        tileSize, tileSize                      // destination size
                    );
                } else {
                    // Fallback to color if image not loaded
                    ctx.fillStyle = tile.color || "gray";
                    ctx.fillRect(screenX, screenY, tileSize, tileSize);
                }
            } else {
                // Draw solid color
                ctx.fillStyle = tile.color;
                ctx.fillRect(screenX, screenY, tileSize, tileSize);
            }

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

    // Render other players from server
    if (world.players && world.players.size > 0) {
        ctx.fillStyle = "red";
        for (const remotePlayer of world.players.values()) {
            ctx.fillRect(
                remotePlayer.x * tileSize - camera.x,
                remotePlayer.y * tileSize - camera.y,
                tileSize,
                tileSize
            );
            // Label with player ID
            ctx.fillStyle = "white";
            ctx.font = "10px Arial";
            ctx.fillText(
                remotePlayer.id.substr(0, 4),
                remotePlayer.x * tileSize - camera.x + 2,
                remotePlayer.y * tileSize - camera.y + 12
            );
            ctx.fillStyle = "red";
        }
    }
}