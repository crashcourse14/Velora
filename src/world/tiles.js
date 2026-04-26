export const TILE = {
    GRASS: 0,
    TREE: 1
};

export const TILE_DATA = {
    0: { color: "green", solid: false },
    1: { 
        solid: true,
        textureId: "trees",
        // Bottom right full aged oak tree from trees.png spritesheet
        // Using a 16x16 sprite from the spritesheet
        spriteX: 208,
        spriteY: 32,
        spriteWidth: 16,
        spriteHeight: 16
    }
};