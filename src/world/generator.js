import { TILE } from "../world/tiles.js";

export function generateWorld(world) {
    world.size.width = 50;
    world.size.height = 50;

    world.data.tiles = [];

    for (let y = 0; y < world.size.height; y++) {
        const row = [];

        for (let x = 0; x < world.size.width; x++) {
            const tile = Math.random() > 0.2 ? TILE.GRASS : TILE.TREE;
            row.push(tile);
        }

        world.data.tiles.push(row);
    }
}