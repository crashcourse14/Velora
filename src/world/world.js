export function createNewWorld() {
    return {
        size: { width: 0, height: 0 },

        time: { tick: 0, day: 1, timeOfDay: 0 },

        playerSpawn: { x: 5, y: 5 },

        settings: {
            isPaused: false,
            isServer: false,
            creative: false,
            cheats: false,
            difficulty: 1
        },

        environment: {
            weather: "clear"
        },

        data: {
            tiles: []
        }
    };
}