function createNewWorld() {
    return {
        size: {
            width: 0,
            height: 0
        },

        time: {
            tick: 0,
            day: 1,
            timeOfDay: 0
        },

        playerSpawn: {
            x: 0,
            y: 0
        },

        settings: {
            isPaused: false,
            isServer: false,
            creative: false,
            cheats: false,
            difficulty: 1
        },
        enviroment: {
            weather: "clear"
        }
    };
}