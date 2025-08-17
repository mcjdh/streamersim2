/**
 * Chat Data for the Streamer Simulator
 * Contains all chat messages, emotes, and username generation data
 */

/**
 * Username generation components
 */
export const USERNAME_PARTS = {
    prefixes: ["Epic", "Pro", "Mega", "Stream", "Chat", "The", "Sir", "Lady", "Dr", "Captain"],
    middles: ["Gam", "Play", "View", "Lov", "Cod", "Art", "Song", "Talk", "Blitz", "Flow"],
    suffixes: ["er", "Fan", "Star", "Dude", "Girl", "Bot", "King", "Queen", "Pro", "X", "TV", "Live"],
    numbers: ["1", "7", "22", "007", "42", "101", "Max", "Pro", "HD"]
};

/**
 * Generic chat messages
 */
export const GENERIC_MESSAGES = [
    "Hello everyone!",
    "Great stream!",
    "Pog",
    "Kappa",
    "LUL",
    "Nice!",
    "Keep it up!",
    "Love this content.",
    "Hi chat!",
    "What's up?",
    "Sub hype!",
    "Let's gooo!",
    "This is fun!"
];

/**
 * Stream type specific messages
 */
export const STREAM_TYPE_MESSAGES = {
    gaming: [
        "GG!", 
        "What game is this?", 
        "Nice play!", 
        "Heals?", 
        "Clip it!", 
        "Wombo combo!", 
        "Get rekt!",
        "Poggers play!",
        "That was clean!",
        "No way!"
    ],
    justchatting: [
        "How is everyone?", 
        "True!", 
        "Tell us more!", 
        "lol", 
        "Interesting point.", 
        "I agree.", 
        "Really?",
        "That's wild!",
        "Same here!",
        "Facts!"
    ],
    music: [
        "Love this song!", 
        "Tune!", 
        "What's the track ID?", 
        "Vibing", 
        "Turn it up!", 
        "Drop the bass!",
        "Absolute banger!",
        "This hits different!",
        "Add to playlist pls!"
    ],
    artstream: [
        "So creative!", 
        "Amazing art!", 
        "What brushes are you using?", 
        "Love the colors.", 
        "Talented!",
        "How long did this take?",
        "Teach me!",
        "Beautiful work!",
        "Art goals!"
    ],
    coding: [
        "Nice code!", 
        "What language is that?", 
        "Have you tried X library?", 
        "Syntax error on line 42? Just kidding!", 
        "Clean solution!", 
        "Rubber duck debugging FTW!",
        "That's elegant!",
        "Big brain code!",
        "Programming wizard!"
    ]
};

/**
 * Contextual messages based on stream state
 */
export const CONTEXTUAL_MESSAGES = {
    lowViewers: [
        "Where is everyone?", 
        "Quiet stream today", 
        "Cozy vibes", 
        "Small stream, big heart",
        "Quality over quantity!",
        "Intimate setting today"
    ],
    highViewers: [
        "Chat is popping off!", 
        "So many people!", 
        "This is crazy!", 
        "Front page?!",
        "We're blowing up!",
        "Viewer raid incoming!"
    ],
    longStream: [
        "Marathon stream!", 
        "How long have we been live?", 
        "Dedication!", 
        "Still going strong!",
        "Stamina goals!",
        "No sleep squad!"
    ],
    newSubs: [
        "Welcome new subs!", 
        "Sub hype!", 
        "Growing fast!", 
        "Love to see it!",
        "Sub train incoming!",
        "Thanks for the support!"
    ],
    lowEnergy: [
        "Streamer looks tired", 
        "Maybe time for a break?", 
        "Energy check", 
        "Stay hydrated!",
        "Get some rest!",
        "Self-care is important!"
    ]
};

/**
 * Subscriber messages with placeholder support
 */
export const SUB_MESSAGES = [
    "Subbed for {months} months!",
    "Love the content!",
    "Best streamer!",
    "Take my sub!",
    "Supporting the dream!",
    "You deserve it!",
    "Keep up the great work!",
    "Here's to more months!",
    "Proud subscriber!"
];

/**
 * Donation reaction messages
 */
export const DONATION_REACTIONS = [
    "Wow, thanks {donator} for the ${amount} donation! 🎉",
    "Poggers! ${amount} from {donator}! Thank you! 🙏",
    "{donator} is a legend! Dropped ${amount}! 🔥",
    "Big love to {donator} for the ${amount}!!! ❤️",
    "Holy moly! ${amount} from {donator}! 💰",
    "You're amazing {donator}! Thanks for ${amount}! ✨"
];

/**
 * Event reaction messages
 */
export const EVENT_REACTIONS = {
    raid: [
        "RAID HYPE!", 
        "Welcome raiders! 👋", 
        "OMG a raid! Pog!", 
        "Thanks for the raid!",
        "Raid squad assemble!",
        "Love the support!"
    ],
    technical_difficulties: [
        "Oh no, stream broke! 😭", 
        "F in chat for the stream!", 
        "RIP stream?", 
        "Technical issues again? Classic.",
        "Tech problems MonkaS",
        "IT support needed!"
    ],
    big_donation: [
        "Another big one! 💸", 
        "The money keeps flowing!", 
        "Chat is popping off!",
        "Generous viewers!",
        "Big spender alert!",
        "Money raining down!"
    ],
    trolls: [
        "Not the trolls! 😠", 
        "Ban hammer incoming?", 
        "Ignore the trolls!", 
        "Mods, do your thing!",
        "Positive vibes only!",
        "Don't feed the trolls!"
    ],
    viral_moment: [
        "OMG WE WENT VIRAL! 🚀", 
        "TO THE MOON! 🌕", 
        "Clip it and ship it! Viral!", 
        "This is insane! PogChamp",
        "We're famous!",
        "Trending alert!"
    ],
    gaming_win: [
        "EPIC WIN! GGWP!", 
        "Clutch play! 🏆", 
        "That was amazing!", 
        "Winner winner chicken dinner!",
        "Carried!",
        "Pro gamer moves!"
    ],
    coding_breakthrough: [
        "Code master! 💻", 
        "Big brain solution!", 
        "Solved it! Genius!", 
        "Finally, the bug is squashed! 🐞",
        "Programming wizard!",
        "Code poetry!"
    ]
};

/**
 * Chat emotes mapping
 */
export const CHAT_EMOTES = {
    "Pog": "😮",
    "PogChamp": "😲",
    "Kappa": "😏",
    "LUL": "😂",
    "BibleThump": "😭",
    "Kreygasm": "😩",
    "4Head": "😄",
    "CoolCat": "😎",
    "NotLikeThis": "🤦",
    "FeelsGoodMan": "😌",
    "FeelsBadMan": "😢",
    "monkaS": "😰",
    "EZ": "😎",
    "GG": "🎮",
    "Heart": "❤️",
    "Fire": "🔥",
    "PogU": "🤯",
    "5Head": "🧠",
    "OMEGALUL": "🤣"
};

/**
 * User colors for chat display
 */
export const USER_COLORS = [
    "#FF69B4", // Hot Pink
    "#00FFFF", // Cyan
    "#7FFF00", // Chartreuse
    "#FFD700", // Gold
    "#FF4500", // Orange Red
    "#DA70D6", // Orchid
    "#FF7F50", // Coral
    "#ADFF2F", // Green Yellow
    "#87CEEB", // Sky Blue
    "#DDA0DD"  // Plum
];