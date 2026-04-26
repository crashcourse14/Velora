export const camera = {
    x: 0,
    y: 0
};

export function updateCamera(player, world, canvas) {
    const tileSize = 32;

    const mapW = world ? world.size.width  * tileSize : 0;
    const mapH = world ? world.size.height * tileSize : 0;

    const rawX = player.x * tileSize - canvas.width  / 2;
    const rawY = player.y * tileSize - canvas.height / 2;

    camera.x = Math.max(0, Math.min(rawX, mapW - canvas.width));
    camera.y = Math.max(0, Math.min(rawY, mapH - canvas.height));
}