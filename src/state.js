/**
 * state.js
 * Single source of truth for shared mutable game state.
 * Import this instead of passing canvas/ctx/world through every module.
 */

export const state = {
    canvas: null,
    ctx: null,
    world: null,
};