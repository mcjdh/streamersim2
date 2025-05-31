const CONFIG = {
    // Stream settings
    STREAM_MIN_DURATION: 45, // Reduced for mobile sessions
    STREAM_MAX_DURATION: 120, // Shorter max duration
    
    // Game balance
    STARTING_MONEY: 50,
    STARTING_SUBSCRIBERS: 0,
    STARTING_REPUTATION: 50,
    STARTING_ENERGY: 100,
    
    // Stream content options - Progressive unlocking
    STREAM_TYPES: [
        { id: "gaming", name: "Gaming", cost: 0, energyCost: 8, baseViewers: 10, unlocked: true },
        { id: "justchatting", name: "Just Chatting", cost: 0, energyCost: 5, baseViewers: 8, unlocked: true },
        { id: "music", name: "Music", cost: 5, energyCost: 10, baseViewers: 15, unlocked: false, unlockAt: 25 }, // Unlock at 25 subs
        { id: "artstream", name: "Art Stream", cost: 10, energyCost: 12, baseViewers: 20, unlocked: false, unlockAt: 50 },
        { id: "coding", name: "Coding", cost: 0, energyCost: 15, baseViewers: 8, unlocked: false, unlockAt: 100 }
    ],
    
    // Progression thresholds
    WIN_CONDITIONS: {
        SUBSCRIBERS: 1000,
        MONEY: 5000,
        REPUTATION: 90
    },
    
    // Event probability
    EVENT_CHANCE_PER_SECOND: 0.08, // Increased for more dynamic gameplay
    
    // Economy settings - Rebalanced
    SUBSCRIBER_VALUE: 1.5, // Slightly reduced
    VIEWER_DONATION_CHANCE: 0.015, // Increased slightly
    AVERAGE_DONATION_AMOUNT: [1, 25], // Increased max
    LIVE_SUBSCRIBER_RATE: 0.001, // Slightly increased
    
    // Energy recovery - Improved
    ENERGY_RECOVERY_RATE: 20, // Faster recovery
    ENERGY_RECOVERY_INTERVAL: 3, // More frequent updates
    ENERGY_DEPLETION_BASE: 0.25, // Base energy loss per second while streaming
    
    // Misc
    LOG_MAX_ENTRIES: 50, // Reduced for mobile performance
    CHAT_MAX_ENTRIES: 30, // Limit chat messages

    // Subscriber Milestones - More granular
    SUBSCRIBER_MILESTONES: [
        { count: 10, description: "First milestone! Your journey begins.", rewards: { money: 50 } },
        { count: 25, description: "Growing fast! Music streams unlocked!", rewards: { money: 100, maxEnergyBonus: 5 } },
        { count: 50, description: "Solid fanbase! Art streams unlocked!", rewards: { money: 200, reputation: 5 } },
        { count: 100, description: "Triple digits! Coding streams unlocked!", rewards: { money: 500, reputation: 10, maxEnergyBonus: 10 } },
        { count: 250, description: "Rising star! Your dedication shows.", rewards: { money: 1000, reputation: 10 } },
        { count: 500, description: "Half way there! Keep pushing!", rewards: { money: 2000, maxEnergyBonus: 15, reputation: 15 } },
        { count: 750, description: "Almost famous! The finish line is near.", rewards: { money: 3000, reputation: 20 } }
    ],

    // Subscriber Churn Settings (Post-Stream)
    MIN_SUBSCRIBERS_FOR_CHURN: 20, // Minimum subscribers before churn can occur
    BAD_STREAM_CHURN_THRESHOLD: 0.5, // If durationFactor is below this, churn is possible
    BAD_STREAM_CHURN_BASE_PERCENT: 0.05, // Base 5% of subs at risk after a bad stream
    CHURN_REPUTATION_MITIGATION_FACTOR: 0.005, // Churn % is reduced by (Reputation * this_factor). E.g. 100 Rep * 0.005 = 0.5 reduction from base rate.
    MAX_CHURN_PERCENT_CAP: 0.10, // Max 10% of subs can be lost in one event
    
    // Active Rest Settings
    ACTIVE_REST_ENERGY_GAIN: 20, // Energy gained per click of the Rest button

    // Chat momentum settings
    CHAT_MOMENTUM_MULTIPLIER: 0.1, // Viewer boost per active chat message
    CHAT_DECAY_RATE: 0.95, // How fast chat momentum decays
    
    // Viewer retention
    VIEWER_RETENTION_BASE: 0.7, // Base chance viewer stays each update
    VIEWER_RETENTION_REPUTATION_BONUS: 0.002, // Bonus per reputation point
    VIEWER_GROWTH_MOMENTUM: 0.3, // Chance of gaining viewers when chat is active
    
    // Tutorial
    SHOW_TUTORIAL: true,
    TUTORIAL_SHOWN_KEY: 'streamerSim2TutorialShown'
};

CONFIG.SHOP_ITEMS = [
    {
        id: "decent_mic",
        name: "Decent Microphone",
        cost: 80,
        description: "Clearer audio for your viewers.",
        effect: { reputation: 3 }
    },
    {
        id: "pro_mic",
        name: "Pro Microphone",
        cost: 150,
        description: "Boosts your reputation slightly.",
        effect: { reputation: 5 } // One-time boost
    },
    {
        id: "basic_webcam",
        name: "Basic Webcam",
        cost: 70,
        description: "A basic webcam to show your face. Slightly improves stream appeal.",
        effect: { reputation: 2 }
    },
    {
        id: "hd_webcam",
        name: "HD Webcam",
        cost: 250,
        description: "A high-definition webcam. Looks more professional.",
        effect: { reputation: 7 }
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
    },
    {
        id: "gaming_chair_basic",
        name: "Basic Gaming Chair",
        cost: 120,
        description: "A comfortable chair. Recovers a bit of energy.",
        effect: { energy: 15 }
    },
    {
        id: "green_screen_kit",
        name: "Green Screen Kit",
        cost: 100,
        description: "Basic green screen. Makes your stream look a bit more polished.",
        effect: { reputation: 3 }
    }
];
