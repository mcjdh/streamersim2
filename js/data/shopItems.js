/**
 * Shop Items Data
 * Contains all purchasable items for the streamer simulator
 */
export const SHOP_ITEMS = [
    {
        id: "decent_mic",
        name: "Decent Microphone",
        cost: 80,
        category: "audio",
        description: "Clearer audio for your viewers.",
        effect: { reputation: 3 },
        repeatable: false
    },
    {
        id: "pro_mic",
        name: "Pro Microphone",
        cost: 150,
        category: "audio",
        description: "Boosts your reputation slightly.",
        effect: { reputation: 5 },
        repeatable: false
    },
    {
        id: "basic_webcam",
        name: "Basic Webcam",
        cost: 70,
        category: "video",
        description: "A basic webcam to show your face. Slightly improves stream appeal.",
        effect: { reputation: 2 },
        repeatable: false
    },
    {
        id: "hd_webcam",
        name: "HD Webcam",
        cost: 250,
        category: "video",
        description: "A high-definition webcam. Looks more professional.",
        effect: { reputation: 7 },
        repeatable: false
    },
    {
        id: "gaming_guide",
        name: "Gaming Strategy Guide",
        cost: 75,
        category: "skills",
        description: "Slightly increases your gaming skill.",
        effect: { skill: "gaming", amount: 0.2 },
        repeatable: true
    },
    {
        id: "energy_drinks",
        name: "Energy Drink Supply (1 Week)",
        cost: 50,
        category: "consumables",
        description: "Instantly recovers some energy.",
        effect: { energy: 25 },
        repeatable: true
    },
    {
        id: "gaming_chair_basic",
        name: "Basic Gaming Chair",
        cost: 120,
        category: "furniture",
        description: "A comfortable chair. Recovers a bit of energy.",
        effect: { energy: 15 },
        repeatable: false
    },
    {
        id: "green_screen_kit",
        name: "Green Screen Kit",
        cost: 100,
        category: "video",
        description: "Basic green screen. Makes your stream look a bit more polished.",
        effect: { reputation: 3 },
        repeatable: false
    },
    // Additional items for progression
    {
        id: "rgb_lighting",
        name: "RGB Lighting Kit",
        cost: 180,
        category: "ambiance",
        description: "Colorful lighting setup. Attracts more viewers.",
        effect: { reputation: 4 },
        repeatable: false
    },
    {
        id: "stream_deck",
        name: "Stream Deck",
        cost: 200,
        category: "tech",
        description: "Professional streaming control panel. Boosts technical skill.",
        effect: { skill: "technical", amount: 0.3 },
        repeatable: false
    }
];

/**
 * Shop categories for filtering
 */
export const SHOP_CATEGORIES = [
    { id: "all", name: "All Items", icon: "🛍️" },
    { id: "audio", name: "Audio", icon: "🎤" },
    { id: "video", name: "Video", icon: "📹" },
    { id: "skills", name: "Skills", icon: "📚" },
    { id: "consumables", name: "Consumables", icon: "⚡" },
    { id: "furniture", name: "Furniture", icon: "🪑" },
    { id: "ambiance", name: "Ambiance", icon: "💡" },
    { id: "tech", name: "Tech", icon: "⚙️" }
];