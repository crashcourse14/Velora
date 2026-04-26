import { TILE_DATA } from "../world/tiles.js";
import { camera, updateCamera } from "../render/camera.js";

export const player = {
    x: 5,
    y: 5,
    speed: 0.5
};

export function isSolid(x, y, world) {
    const tx = Math.floor(x);
    const ty = Math.floor(y);

    if (!world || ty < 0 || ty >= world.size.height || tx < 0 || tx >= world.size.width) return true;

    const tileId = world.data.tiles[ty][tx];
    return TILE_DATA[tileId]?.solid ?? false;
}

export function update(keys, world, canvas) {
    if (!world) return;

    const nextX = player.x + (keys["d"] ? player.speed : keys["a"] ? -player.speed : 0);
    const nextY = player.y + (keys["s"] ? player.speed : keys["w"] ? -player.speed : 0);

    if (!isSolid(nextX, player.y, world)) player.x = nextX;
    if (!isSolid(player.x, nextY, world)) player.y = nextY;

    updateCamera(player, world, canvas);

    // Sync movement with server
    if (world.server && world.server.connected && world.server.socket) {
        world.server.socket.send(JSON.stringify({
            type: 'playerMove',
            x: Math.floor(player.x),
            y: Math.floor(player.y)
        }));
    }
}