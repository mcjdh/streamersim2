class ChatManager {
    constructor() {
        this.chatTimer = null;
        this.momentum = 0; // Chat activity momentum
        this.lastMessageTime = Date.now();
        this.namePrefixes = ["Epic", "Pro", "Mega", "Stream", "Chat", "The", "Sir", "Lady", "Dr", "Captain"];
        this.nameMiddles = ["Gam", "Play", "View", "Lov", "Cod", "Art", "Song", "Talk", "Blitz", "Flow"];
        this.nameSuffixes = ["er", "Fan", "Star", "Dude", "Girl", "Bot", "King", "Queen", "Pro", "X", "TV", "Live"];
        this.nameNumbers = ["1", "7", "22", "007", "42", "101", "Max", "Pro", "HD"];
        this.genericMessages = [
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
        this.streamTypeMessages = {
            gaming: ["GG!", "What game is this?", "Nice play!", "Heals?", "Clip it!", "Wombo combo!", "Get rekt!"],
            justchatting: ["How is everyone?", "True!", "Tell us more!", "lol", "Interesting point.", "I agree.", "Really?"],
            music: ["Love this song!", "Tune!", "What's the track ID?", "Vibing", "Turn it up!", "Drop the bass!"],
            artstream: ["So creative!", "Amazing art!", "What brushes are you using?", "Love the colors.", "Talented!"],
            coding: ["Nice code!", "What language is that?", "Have you tried X library?", "Syntax error on line 42? Just kidding!", "Clean solution!", "Rubber duck debugging FTW!"]
        };
        this.userColors = ["#FF69B4", "#00FFFF", "#7FFF00", "#FFD700", "#FF4500", "#DA70D6", "#FF7F50", "#ADFF2F"]; // Some bright colors
        
        // Emotes
        this.emotes = {
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
            "Fire": "🔥"
        };
        
        // Enhanced message templates with placeholders
        this.contextualMessages = {
            lowViewers: ["Where is everyone?", "Quiet stream today", "Cozy vibes", "Small stream, big heart"],
            highViewers: ["Chat is popping off!", "So many people!", "This is crazy!", "Front page?!"],
            longStream: ["Marathon stream!", "How long have we been live?", "Dedication!", "Still going strong!"],
            newSubs: ["Welcome new subs!", "Sub hype!", "Growing fast!", "Love to see it!"],
            lowEnergy: ["Streamer looks tired", "Maybe time for a break?", "Energy check", "Stay hydrated!"]
        };
        
        // Subscriber messages
        this.subMessages = [
            "Subbed for {months} months!",
            "Love the content!",
            "Best streamer!",
            "Take my sub!",
            "Supporting the dream!"
        ];
    }

    getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    generateRandomUsername() {
        let username = "";
        const structureType = Math.random();

        if (structureType < 0.4) { // Prefix + Suffix
            username = this.getRandomElement(this.namePrefixes) + this.getRandomElement(this.nameSuffixes);
        } else if (structureType < 0.7) { // Middle + Suffix
            username = this.getRandomElement(this.nameMiddles) + this.getRandomElement(this.nameSuffixes);
        } else { // Prefix + Middle + Suffix
            username = this.getRandomElement(this.namePrefixes) + this.getRandomElement(this.nameMiddles) + this.getRandomElement(this.nameSuffixes);
        }

        // Optionally add numbers
        if (Math.random() < 0.3) {
            username += this.getRandomElement(this.nameNumbers);
        }
        
        // Simple Ghetto Capitalization: Capitalize first letter, could be improved
        // For a quick approach, this will do. Proper capitalization of each part would be better.
        if (username.length > 0) {
            username = username.charAt(0).toUpperCase() + username.slice(1);
        }

        return username || "ChatUser123"; // Fallback
    }

    generateChatMessage(streamType, customUsername = null, customMessage = null) {
        const username = customUsername || this.generateRandomUsername();
        const userColor = this.getRandomElement(this.userColors);
        const isSub = Math.random() < (Math.min(GAME.player.subscribers, 100) / 200); // Up to 50% chance at 100 subs
        
        let messageText = customMessage;

        if (!customMessage) {
            // Check for contextual messages
            if (Math.random() < 0.3) {
                messageText = this.getContextualMessage();
            } else if (Math.random() < 0.6 || !this.streamTypeMessages[streamType]) {
                messageText = this.getRandomElement(this.genericMessages);
            } else {
                messageText = this.getRandomElement(this.streamTypeMessages[streamType]);
            }
            
            // Add emotes to messages
            messageText = this.addEmotes(messageText);
        }
        
        // Add subscriber badge if applicable
        const displayUsername = isSub ? `<span class="subscriber-badge">SUB</span>${username}` : username;
        
        // Update momentum
        this.updateMomentum();
        
        UI.addChatMessage(displayUsername, messageText, userColor);
    }
    
    getContextualMessage() {
        const viewers = GAME.currentStream.currentViewers;
        const energy = GAME.player.energy;
        const streamTime = GAME.currentStream.active ? (Date.now() - GAME.currentStream.startTime) / 1000 : 0;
        
        if (viewers < 5) {
            return this.getRandomElement(this.contextualMessages.lowViewers);
        } else if (viewers > 50) {
            return this.getRandomElement(this.contextualMessages.highViewers);
        } else if (streamTime > 120) {
            return this.getRandomElement(this.contextualMessages.longStream);
        } else if (energy < 30) {
            return this.getRandomElement(this.contextualMessages.lowEnergy);
        }
        
        return this.getRandomElement(this.genericMessages);
    }
    
    addEmotes(message) {
        // Randomly add emotes to messages
        if (Math.random() < 0.4) {
            const emoteKeys = Object.keys(this.emotes);
            const randomEmote = this.getRandomElement(emoteKeys);
            message += ` ${randomEmote}`;
        }
        
        // Replace text emotes with emoji
        Object.entries(this.emotes).forEach(([text, emoji]) => {
            message = message.replace(new RegExp(`\\b${text}\\b`, 'g'), 
                `<span class="chat-emote" title="${text}">${emoji}</span>`);
        });
        
        return message;
    }
    
    updateMomentum() {
        const now = Date.now();
        const timeSinceLastMessage = (now - this.lastMessageTime) / 1000;
        
        // Decay momentum over time
        this.momentum *= Math.pow(CONFIG.CHAT_DECAY_RATE, timeSinceLastMessage);
        
        // Add to momentum
        this.momentum = Math.min(this.momentum + 1, 20); // Cap at 20
        
        this.lastMessageTime = now;
        
        // Apply momentum effect to viewer count
        if (GAME.currentStream.active && this.momentum > 5) {
            const viewerBoost = Math.floor(this.momentum * CONFIG.CHAT_MOMENTUM_MULTIPLIER);
            if (Math.random() < CONFIG.VIEWER_GROWTH_MOMENTUM) {
                GAME.currentStream.currentViewers += viewerBoost;
                UI.updateViewerCount(GAME.currentStream.currentViewers);
            }
        }
    }

    startChatting(streamType) {
        if (this.chatTimer) {
            clearInterval(this.chatTimer);
        }
        
        // Reset momentum
        this.momentum = 0;
        
        // Initial burst of messages with slight staggering
        for (let i = 0; i < 3; i++) { 
            setTimeout(() => this.generateChatMessage(streamType), (i * 500) + (Math.random() * 500)); // Staggered by 0.5s intervals + small random
        }

        // Dynamic chat frequency based on viewers
        const updateChatFrequency = () => {
            if (this.chatTimer) {
                clearInterval(this.chatTimer);
            }
            
            const viewers = GAME.currentStream.currentViewers;
            const baseFrequency = 3000; // 3 seconds
            const minFrequency = 1000; // 1 second
            
            // More viewers = more frequent chat
            const frequency = Math.max(minFrequency, baseFrequency - (viewers * 20));
            
            this.chatTimer = setInterval(() => {
                // Multiple messages if high viewer count
                const messageCount = viewers > 50 ? Math.floor(Math.random() * 3) + 1 : 1;
                for (let i = 0; i < messageCount; i++) {
                    setTimeout(() => this.generateChatMessage(streamType), i * 200);
                }
                
                updateChatFrequency(); // Recursively update frequency
            }, frequency);
        };
        
        updateChatFrequency();
    }

    stopChatting() {
        if (this.chatTimer) {
            clearInterval(this.chatTimer);
            this.chatTimer = null;
        }
    }

    postDonationReaction(donatorName, amount) {
        const messages = [
            `Wow, thanks ${donatorName} for the $${amount} donation! 🎉`,
            `Poggers! $${amount} from ${donatorName}! Thank you! 🙏`,
            `${donatorName} is a legend! Dropped $${amount}! 🔥`,
            `Big love to ${donatorName} for the $${amount}!!! ❤️`
        ];
        const reactionUser = this.generateRandomUsername(); // A random chatter reacts
        this.generateChatMessage(GAME.currentStream.type, reactionUser, this.getRandomElement(messages));
        
        // Maybe a second, slightly delayed reaction
        if (Math.random() < 0.5) {
            setTimeout(() => {
                const anotherUser = this.generateRandomUsername();
                this.generateChatMessage(GAME.currentStream.type, anotherUser, "So generous!");
            }, Math.random() * 1000 + 500);
        }
    }

    postEventReaction(event) {
        let reactionMessages = [];
        switch(event.id) {
            case "raid":
                reactionMessages = ["RAID HYPE!", "Welcome raiders! 👋", "OMG a raid! Pog!", `Thanks for the raid, ${event.name}! Wait, that's the event name...`];
                break;
            case "technical_difficulties":
                reactionMessages = ["Oh no, stream broke! 😭", "F in chat for the stream!", "RIP stream?", "Technical issues again? Classic."];
                break;
            case "big_donation": // This is already handled by postDonationReaction, but an event also fires
                reactionMessages = ["Another big one! 💸", "The money keeps flowing!", "Chat is popping off!"];
                break;
            case "trolls":
                reactionMessages = ["Not the trolls! 😠", "Ban hammer incoming?", "Ignore the trolls!", "Mods, do your thing!"];
                if (GAME.player.reputation > 70) reactionMessages.push("Our community is strong! 💪");
                break;
            case "viral_moment":
                reactionMessages = ["OMG WE WENT VIRAL! 🚀", "TO THE MOON! 🌕", "Clip it and ship it! Viral!", "This is insane! PogChamp"];
                break;
            case "gaming_win":
                reactionMessages = ["EPIC WIN! GGWP!", "Clutch play! 🏆", "That was amazing!", "Winner winner chicken dinner!"];
                break;
            case "coding_breakthrough":
                reactionMessages = ["Code master! 💻", "Big brain solution!", "Solved it! Genius!", "Finally, the bug is squashed! 🐞"];
                break;
            default:
                reactionMessages = ["Something happened!", "What was that?", "Interesting..."];
        }

        if (reactionMessages.length > 0) {
            const reactionUser = this.generateRandomUsername();
            this.generateChatMessage(GAME.currentStream.type, reactionUser, this.getRandomElement(reactionMessages));
        }
    }

    postSubscriberMessage() {
        const months = Math.floor(Math.random() * 24) + 1;
        const subMessage = this.getRandomElement(this.subMessages).replace('{months}', months);
        const subscriber = this.generateRandomUsername();
        
        this.generateChatMessage(GAME.currentStream.type, subscriber, subMessage);
        
        // Follow-up hype
        setTimeout(() => {
            const hypeUser = this.generateRandomUsername();
            this.generateChatMessage(GAME.currentStream.type, hypeUser, "New sub! Welcome! 🎉");
        }, 500);
    }
}

// Initialize the global chat manager
const CHAT_MANAGER = new ChatManager();