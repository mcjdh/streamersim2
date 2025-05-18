class ChatManager {
    constructor() {
        this.chatTimer = null;
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
        let messageText = customMessage;

        if (!customMessage) {
            // Higher chance for generic message, then stream specific
            if (Math.random() < 0.6 || !this.streamTypeMessages[streamType]) {
                messageText = this.getRandomElement(this.genericMessages);
            } else {
                messageText = this.getRandomElement(this.streamTypeMessages[streamType]);
            }
        }
        
        UI.addChatMessage(username, messageText, userColor);
    }

    startChatting(streamType) {
        if (this.chatTimer) {
            clearInterval(this.chatTimer);
        }
        // Initial burst of messages with slight staggering
        for (let i = 0; i < 3; i++) { 
            setTimeout(() => this.generateChatMessage(streamType), (i * 500) + (Math.random() * 500)); // Staggered by 0.5s intervals + small random
        }

        this.chatTimer = setInterval(() => {
            this.generateChatMessage(streamType);
        }, (Math.random() * 4 + 2) * 1000); // Message every 2-6 seconds
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
}

// Initialize the global chat manager
const CHAT_MANAGER = new ChatManager(); 