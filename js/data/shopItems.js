/**
 * Shop Items Data - Roguelike/Incremental Style
 * Items now have tiers, synergies, and scaling effects
 */
export const SHOP_ITEMS = [
    // ===== STARTER TIER (Cheap, accessible) =====
    {
        id: "coffee_supply",
        name: "Coffee Supply",
        cost: 25,
        tier: "starter",
        category: "consumables",
        description: "Instant energy boost. The streamer's best friend!",
        effect: { energy: 15 },
        repeatable: true,
        scaling: { costMultiplier: 1.2 } // Gets more expensive each purchase
    },
    {
        id: "basic_mic",
        name: "USB Microphone",
        cost: 40,
        tier: "starter", 
        category: "audio",
        description: "Clear audio = happy viewers. +2 reputation, +10% viewer retention.",
        effect: { reputation: 2, viewerRetentionBonus: 0.1 },
        repeatable: false
    },
    {
        id: "webcam_720p",
        name: "720p Webcam",
        cost: 60,
        tier: "starter",
        category: "video", 
        description: "Show your face! Increases starting viewers by 15%.",
        effect: { reputation: 3, startingViewerMultiplier: 1.15 },
        repeatable: false
    },
    {
        id: "gaming_guide",
        name: "Strategy Guides",
        cost: 30,
        tier: "starter",
        category: "skills",
        description: "Learn the meta! Improves gaming skill, stacks infinitely.",
        effect: { skill: "gaming", amount: 0.3 },
        repeatable: true,
        scaling: { costMultiplier: 1.3 }
    },

    // ===== PROFESSIONAL TIER (Mid-game power spikes) =====
    {
        id: "pro_mic_setup",
        name: "Professional Audio Setup",
        cost: 180,
        tier: "professional",
        category: "audio",
        description: "Studio-quality sound. +5 reputation, +25% donation rate, unlocks 'Audio Synergy'.",
        effect: { reputation: 5, donationRateMultiplier: 1.25 },
        synergy: "audio_master",
        repeatable: false,
        requires: ["basic_mic"]
    },
    {
        id: "hd_webcam_setup", 
        name: "1080p Streaming Setup",
        cost: 220,
        tier: "professional",
        category: "video",
        description: "Crystal clear video. +30% starting viewers, +20% subscriber conversion.",
        effect: { reputation: 6, startingViewerMultiplier: 1.3, subscriberConversionBonus: 0.2 },
        synergy: "video_master",
        repeatable: false,
        requires: ["webcam_720p"]
    },
    {
        id: "energy_efficiency_course",
        name: "Stamina Training Course", 
        cost: 150,
        tier: "professional",
        category: "skills",
        description: "Learn to stream efficiently. -20% energy drain per stream.",
        effect: { energyEfficiency: 0.8 },
        repeatable: true,
        scaling: { costMultiplier: 1.8, effectDiminishing: 0.9 } // Each purchase less effective
    },
    {
        id: "gaming_chair_pro",
        name: "Ergonomic Gaming Chair",
        cost: 200,
        tier: "professional", 
        category: "furniture",
        description: "Comfort = performance. +15 max energy, +50% energy recovery.",
        effect: { maxEnergyBonus: 15, energyRecoveryBonus: 0.5 },
        repeatable: false
    },

    // ===== ADVANCED TIER (Late game scaling) =====
    {
        id: "stream_deck_advanced",
        name: "Advanced Stream Control",
        cost: 350,
        tier: "advanced",
        category: "tech",
        description: "Master stream management. +0.5 all skills, +15% money from all sources.",
        effect: { 
            skill: "all", 
            amount: 0.5, 
            moneyMultiplier: 1.15 
        },
        repeatable: false,
        requires: ["pro_mic_setup"]
    },
    {
        id: "content_creation_suite",
        name: "Content Creation Suite",
        cost: 500,
        tier: "advanced",
        category: "tech", 
        description: "Professional editing tools. Streams generate 2x subscribers when above 75% completion.",
        effect: { 
            completionBonusSubscribers: 2.0,
            completionThreshold: 0.75,
            moneyMultiplier: 1.2
        },
        repeatable: false,
        requires: ["hd_webcam_setup"]
    },
    {
        id: "networking_bootcamp",
        name: "Networking & Marketing Course",
        cost: 400,
        tier: "advanced",
        category: "skills",
        description: "Learn the business! +1 talking skill, streams have 25% chance for 'raid' events.",
        effect: { 
            skill: "talking", 
            amount: 1.0,
            raidEventChance: 0.25
        },
        repeatable: false
    },

    // ===== SYNERGY TIER (Powerful combinations) =====
    {
        id: "full_studio_setup",
        name: "Professional Studio", 
        cost: 800,
        tier: "synergy",
        category: "studio",
        description: "Complete professional setup. Unlocks 'Studio Synergy' - massive bonuses!",
        effect: { 
            reputation: 15,
            startingViewerMultiplier: 1.8,
            energyRecoveryBonus: 1.0,
            moneyMultiplier: 1.5
        },
        synergy: "studio_master",
        repeatable: false,
        requires: ["pro_mic_setup", "hd_webcam_setup", "gaming_chair_pro"]
    },
    {
        id: "influencer_package",
        name: "Influencer Growth Package",
        cost: 1200,
        tier: "synergy", 
        category: "marketing",
        description: "Social media mastery. All streams generate +50% more subs and money.",
        effect: {
            subscriberConversionBonus: 0.5,
            moneyMultiplier: 1.5,
            viewerRetentionBonus: 0.3
        },
        repeatable: false,
        requires: ["networking_bootcamp", "content_creation_suite"]
    },

    // ===== CONSUMABLES & SCALING ITEMS =====
    {
        id: "energy_drink_case",
        name: "Energy Drink Case",
        cost: 80,
        tier: "professional",
        category: "consumables", 
        description: "24-pack of energy drinks. Restores 35 energy + 10% of max energy.",
        effect: { energy: 35, energyPercentBonus: 0.1 },
        repeatable: true,
        scaling: { costMultiplier: 1.15 }
    },
    {
        id: "skill_books",
        name: "Skill Development Books",
        cost: 100,
        tier: "professional",
        category: "skills",
        description: "Choose your path! Increases one random skill by 0.4-0.8.",
        effect: { skill: "random", amount: "0.4-0.8" },
        repeatable: true,
        scaling: { costMultiplier: 1.25 }
    },
    {
        id: "subscriber_promotion",
        name: "Social Media Promotion",
        cost: 150,
        tier: "professional", 
        category: "marketing",
        description: "Buy visibility! Instantly gain 15-30 subscribers based on reputation.",
        effect: { instantSubscribers: "15-30" },
        repeatable: true,
        scaling: { costMultiplier: 1.4 }
    },

    // ===== LATE GAME POWER ITEMS =====
    {
        id: "ai_moderation",
        name: "AI Moderation Tools",
        cost: 600,
        tier: "advanced",
        category: "tech",
        description: "Automated chat management. Prevents all negative events, +20% viewer retention.",
        effect: { 
            negativeEventImmunity: true,
            viewerRetentionBonus: 0.2,
            chatMomentumBonus: 0.5
        },
        repeatable: false
    },
    {
        id: "partnership_deal",
        name: "Sponsorship Partnership",
        cost: 1000,
        tier: "advanced",
        category: "business",
        description: "Corporate backing! +$5 per minute streamed, +25% all income sources.",
        effect: { 
            passiveIncomePerMinute: 5,
            moneyMultiplier: 1.25
        },
        repeatable: false,
        requires: ["full_studio_setup"]
    }
];

/**
 * Shop categories for filtering - Roguelike Style
 */
export const SHOP_CATEGORIES = [
    { id: "all", name: "All Items", icon: "🛍️" },
    { id: "starter", name: "Starter", icon: "🌱", description: "Affordable basics to get started" },
    { id: "professional", name: "Professional", icon: "⭐", description: "Mid-game power spikes" },
    { id: "advanced", name: "Advanced", icon: "🚀", description: "Late-game scaling items" },
    { id: "synergy", name: "Synergy", icon: "⚡", description: "Powerful combinations" },
    { id: "consumables", name: "Consumables", icon: "🍫", description: "Repeatable boosts" },
    { id: "audio", name: "Audio", icon: "🎤" },
    { id: "video", name: "Video", icon: "📹" },
    { id: "skills", name: "Skills", icon: "📚" },
    { id: "tech", name: "Tech", icon: "⚙️" },
    { id: "business", name: "Business", icon: "💼" }
];

/**
 * Synergy definitions - unlock powerful bonuses when conditions are met
 */
export const SYNERGIES = {
    audio_master: {
        name: "Audio Master",
        description: "Professional audio setup complete! +50% donation rates, +10% subscriber conversion.",
        requirements: ["basic_mic", "pro_mic_setup"],
        effect: { donationRateMultiplier: 1.5, subscriberConversionBonus: 0.1 }
    },
    video_master: {
        name: "Video Master", 
        description: "Professional video setup complete! +100% starting viewers, viewers stay 25% longer.",
        requirements: ["webcam_720p", "hd_webcam_setup"],
        effect: { startingViewerMultiplier: 2.0, viewerRetentionBonus: 0.25 }
    },
    studio_master: {
        name: "Studio Master",
        description: "Complete professional studio! All streams generate 2x rewards when above 50% completion.",
        requirements: ["full_studio_setup"],
        effect: { 
            completionBonusAll: 2.0, 
            completionThreshold: 0.5,
            energyEfficiency: 0.7
        }
    }
};