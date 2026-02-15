export const CONFIG = {
    GAME_WIDTH: 1920,
    GAME_HEIGHT: 1080,
    ARO_SPEED: 800, // Pixels per second
    ITEM_FALL_SPEED_BASE: 1200, // Pixels per second
    SPAWN_INTERVAL_BASE: 0.6, // Seconds
    INDICATOR_DURATION: 0.8, // Seconds

    SCORE: {
        FRUIT: 10,
        BAD_ITEM: -5,
        GUAVA: 50
    },

    COLORS: {
        ARO: 0x3498db, // Blue
        INDICATOR_FRUIT: 0x2ecc71, // Green
        INDICATOR_BAD: 0xe74c3c, // Red
        INDICATOR_RARE: 0xFFD700, // Gold
        TEXT: 0xffffff
    },

    ITEM_TYPES: [
        { name: 'apple', color: 0xe74c3c, isFruit: true, texture: 'apple' },
        { name: 'banana', color: 0xf1c40f, isFruit: true, texture: 'banana' },
        { name: 'orange', color: 0xe67e22, isFruit: true, texture: 'orange' },
        { name: 'bomb', color: 0x2c3e50, isFruit: false, texture: 'bomb' },
        { name: 'guava', color: 0x8BC34A, isFruit: true, isRare: true, texture: 'guava' }
    ]
};
