export const CONFIG = {
    // Stream settings - optimized for Pi5
    STREAM_MIN_DURATION: 30, // Shorter for quick gameplay
    STREAM_MAX_DURATION: 90, // Reduced max duration
    
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
    
    // Event probability - reduced for performance
    EVENT_CHANCE_PER_SECOND: 0.05, // Reduced frequency
    
    // Economy settings - performance optimized
    SUBSCRIBER_VALUE: 1.5,
    VIEWER_DONATION_CHANCE: 0.01, // Slightly reduced
    AVERAGE_DONATION_AMOUNT: [1, 20],
    LIVE_SUBSCRIBER_RATE: 0.001,
    
    // Energy recovery - faster for shorter sessions
    ENERGY_RECOVERY_RATE: 25, // Faster recovery
    ENERGY_RECOVERY_INTERVAL: 5, // Less frequent updates for performance
    ENERGY_DEPLETION_BASE: 0.3, // Slightly higher depletion
    
    // Performance limits for Pi5
    LOG_MAX_ENTRIES: 20, // Reduced for performance
    CHAT_MAX_ENTRIES: 15, // Limit chat messages

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

    // Simplified chat momentum for performance
    CHAT_MOMENTUM_MULTIPLIER: 0.05, // Reduced calculations
    CHAT_DECAY_RATE: 0.9, // Faster decay, less computation
    
    // Simplified viewer retention
    VIEWER_RETENTION_BASE: 0.75, // Slightly higher base
    VIEWER_RETENTION_REPUTATION_BONUS: 0.001, // Reduced bonus
    VIEWER_GROWTH_MOMENTUM: 0.2, // Reduced for performance
    
    // Tutorial
    SHOW_TUTORIAL: true,
    TUTORIAL_SHOWN_KEY: 'streamerSim2TutorialShown',
    
    // Performance settings for Pi5
    UI_UPDATE_INTERVAL: 1000, // Update UI every 1 second instead of more frequent
    ANIMATION_REDUCED: true, // Flag to disable heavy animations
    PERFORMANCE_MODE: true, // Enable performance optimizations
    AUTO_SAVE_INTERVAL: 60 // Auto-save every 60 seconds
};

// Shop items moved to js/data/shopItems.js for better organization
