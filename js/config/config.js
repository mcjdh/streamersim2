export const CONFIG = {
    // Stream settings - optimized for Pi5
    STREAM_MIN_DURATION: 12, // Baseline guidance for short early runs
    STREAM_MAX_DURATION: 120, // Soft cap guidance only; actual duration driven by energy
    
    // Game balance
    STARTING_MONEY: 50,
    STARTING_SUBSCRIBERS: 0,
    STARTING_REPUTATION: 50,
    STARTING_ENERGY: 20, // Improved starting energy for better early game
    
    // Stream content options - Better balanced energy costs
    STREAM_TYPES: [
        { id: "gaming", name: "Gaming", cost: 0, energyCost: 6, baseViewers: 10, unlocked: true }, // Reduced from 8
        { id: "justchatting", name: "Just Chatting", cost: 0, energyCost: 4, baseViewers: 8, unlocked: true }, // Reduced from 5
        { id: "music", name: "Music", cost: 5, energyCost: 8, baseViewers: 15, unlocked: false, unlockAt: 25 }, // Reduced from 10
        { id: "artstream", name: "Art Stream", cost: 10, energyCost: 10, baseViewers: 20, unlocked: false, unlockAt: 50 }, // Reduced from 12
        { id: "coding", name: "Coding", cost: 0, energyCost: 12, baseViewers: 8, unlocked: false, unlockAt: 100 } // Reduced from 15
    ],
    
    // Progression thresholds - Better balanced for actual gameplay
    WIN_CONDITIONS: {
        SUBSCRIBERS: 500, // Reduced from 1000 - more achievable
        MONEY: 2500, // Reduced from 5000 - still challenging
        REPUTATION: 85 // Slightly reduced from 90
    },
    
    // Event probability - reduced for performance
    EVENT_CHANCE_PER_SECOND: 0.05, // Reduced frequency
    
    // Economy settings - performance optimized
    SUBSCRIBER_VALUE: 1.5,
    VIEWER_DONATION_CHANCE: 0.025, // Increased from 0.01 for better engagement
    AVERAGE_DONATION_AMOUNT: [2, 25], // Slightly better donation range
    LIVE_SUBSCRIBER_RATE: 0.001,
    
    // Energy recovery - faster for shorter sessions
    ENERGY_RECOVERY_RATE: 18, // Improved passive recovery (0.3 per second)
    ENERGY_RECOVERY_INTERVAL: 5, // Seconds (still used if needed)
    ENERGY_DEPLETION_BASE: 0.35, // Base per-second drain before curve
    
    // Performance limits for Pi5
    LOG_MAX_ENTRIES: 20, // Reduced for performance
    CHAT_MAX_ENTRIES: 15, // Limit chat messages

    // Subscriber Milestones - Integrated with shop progression
    SUBSCRIBER_MILESTONES: [
        { count: 10, description: "First milestone! Your journey begins.", rewards: { money: 25 } },
        { count: 25, description: "Growing fast! Music streams unlocked!", rewards: { money: 60, maxEnergyBonus: 5 } },
        { count: 50, description: "Solid fanbase! Art streams unlocked! Professional tier unlocked.", rewards: { money: 120, reputation: 5 } },
        { count: 100, description: "Triple digits! Coding streams unlocked! Advanced tier unlocked.", rewards: { money: 250, reputation: 8, maxEnergyBonus: 8 } },
        { count: 200, description: "Growing strong! Synergy tier unlocked! Your reputation spreads.", rewards: { money: 500, reputation: 10 } },
        { count: 350, description: "Rising star! Elite upgrades available! Your dedication shows.", rewards: { money: 800, reputation: 12, maxEnergyBonus: 10 } },
        { count: 500, description: "VICTORY! You've reached streaming stardom! All tiers mastered!", rewards: { money: 1500, maxEnergyBonus: 15, reputation: 15 } }
    ],

    // Subscriber Churn Settings (Post-Stream)
    MIN_SUBSCRIBERS_FOR_CHURN: 20, // Minimum subscribers before churn can occur
    BAD_STREAM_CHURN_THRESHOLD: 0.5, // If durationFactor is below this, churn is possible
    BAD_STREAM_CHURN_BASE_PERCENT: 0.05, // Base 5% of subs at risk after a bad stream
    CHURN_REPUTATION_MITIGATION_FACTOR: 0.005, // Churn % is reduced by (Reputation * this_factor). E.g. 100 Rep * 0.005 = 0.5 reduction from base rate.
    MAX_CHURN_PERCENT_CAP: 0.10, // Max 10% of subs can be lost in one event
    
    // Active Rest Settings
    ACTIVE_REST_ENERGY_GAIN: 6, // About half a base run

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
