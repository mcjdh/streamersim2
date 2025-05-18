const CONFIG = {
    // Stream settings
    STREAM_MIN_DURATION: 60, // in seconds
    STREAM_MAX_DURATION: 180, // in seconds
    
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
    EVENT_CHANCE_PER_SECOND: 0.05,
    
    // Economy settings
    SUBSCRIBER_VALUE: 2, // money per subscriber per stream
    VIEWER_DONATION_CHANCE: 0.01, // chance per viewer per second
    AVERAGE_DONATION_AMOUNT: [1, 20], // min/max range
    LIVE_SUBSCRIBER_RATE: 0.0007, // Chance per viewer per second to subscribe live
    
    // Energy recovery
    ENERGY_RECOVERY_RATE: 15, // per minute offline
    ENERGY_RECOVERY_INTERVAL: 5, // in seconds
    
    // Misc
    LOG_MAX_ENTRIES: 100,

    // Subscriber Milestones
    SUBSCRIBER_MILESTONES: [
        { count: 10, description: "First milestone! Gained a small bonus.", rewards: { money: 50 } },
        { count: 50, description: "Growing community! Your dedication is paying off.", rewards: { money: 200, maxEnergyBonus: 5 } },
        { count: 100, description: "Serious streamer! You've hit 100 subscribers!", rewards: { money: 500, reputation: 5 } },
        { count: 250, description: "Fan Favorite! Your channel is booming.", rewards: { money: 1000, reputation: 10 } }, // We can add item/stream unlocks here later
        { count: 500, description: "Streaming Star! Halfway to the win condition!", rewards: { money: 2500, maxEnergyBonus: 10, reputation: 10 } }
    ],

    // Subscriber Churn Settings (Post-Stream)
    MIN_SUBSCRIBERS_FOR_CHURN: 20, // Minimum subscribers before churn can occur
    BAD_STREAM_CHURN_THRESHOLD: 0.5, // If durationFactor is below this, churn is possible
    BAD_STREAM_CHURN_BASE_PERCENT: 0.05, // Base 5% of subs at risk after a bad stream
    CHURN_REPUTATION_MITIGATION_FACTOR: 0.005, // Churn % is reduced by (Reputation * this_factor). E.g. 100 Rep * 0.005 = 0.5 reduction from base rate.
    MAX_CHURN_PERCENT_CAP: 0.10, // Max 10% of subs can be lost in one event

    // Active Rest Settings
    ACTIVE_REST_ENERGY_GAIN: 20 // Energy gained per click of the Rest button
};

CONFIG.SHOP_ITEMS = [
    {
        id: "pro_mic",
        name: "Pro Microphone",
        cost: 150,
        description: "Boosts your reputation slightly.",
        effect: { reputation: 5 } // One-time boost
    },
    {
        id: "gaming_guide",
        name: "Gaming Strategy Guide",
        cost: 75,
        description: "Slightly increases your gaming skill.",
        effect: { skill: "gaming", amount: 0.2 }
    },
    {
        id: "energy_drinks",
        name: "Energy Drink Supply (1 Week)",
        cost: 50,
        description: "Instantly recovers some energy.",
        effect: { energy: 25 } // One-time boost
    }
];
