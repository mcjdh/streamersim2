const CONFIG = {
    // Stream settings
    STREAM_MIN_DURATION: 8, // in seconds
    STREAM_MAX_DURATION: 14, // in seconds
    
    // Game balance
    STARTING_MONEY: 50,
    STARTING_SUBSCRIBERS: 0,
    STARTING_REPUTATION: 50,
    STARTING_ENERGY: 100,
    
    // Stream content options
    STREAM_TYPES: [
        { id: "gaming", name: "Gaming", cost: 0, energyCost: 5, baseViewers: 10 },
        { id: "justchatting", name: "Just Chatting", cost: 0, energyCost: 3, baseViewers: 8 },
        { id: "music", name: "Music", cost: 5, energyCost: 6, baseViewers: 12 },
        { id: "artstream", name: "Art Stream", cost: 10, energyCost: 7, baseViewers: 15 },
        { id: "coding", name: "Coding", cost: 0, energyCost: 8, baseViewers: 6 }
    ],
    
    // Progression thresholds
    WIN_CONDITIONS: {
        SUBSCRIBERS: 1000,
        MONEY: 5000,
        REPUTATION: 90
    },
    
    // Event probability
    EVENT_CHANCE_PER_SECOND: 0.2,
    
    // Economy settings
    SUBSCRIBER_VALUE: 1, // money per subscriber per stream
    VIEWER_DONATION_CHANCE: 0.01, // chance per viewer per second
    AVERAGE_DONATION_AMOUNT: [1, 20], // min/max range
    
    // Energy recovery
    ENERGY_RECOVERY_RATE: 5, // per minute offline
    ENERGY_RECOVERY_INTERVAL: 5, // in seconds
    
    // Misc
    LOG_MAX_ENTRIES: 100
};
