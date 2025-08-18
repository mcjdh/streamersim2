import { CONFIG } from '../config/config.js';
import {
    USERNAME_PARTS,
    GENERIC_MESSAGES,
    STREAM_TYPE_MESSAGES,
    CONTEXTUAL_MESSAGES,
    SUB_MESSAGES,
    DONATION_REACTIONS,
    EVENT_REACTIONS,
    CHAT_EMOTES,
    USER_COLORS
} from '../data/chatData.js';

export class ChatManager {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
        this.chatTimer = null; // legacy; no longer used by dt loop
        this.momentum = 0; // Chat activity momentum
        this.lastMessageTime = Date.now();
        this.active = false;
        this._accMs = 0;
        this._nextDelayMs = 1500;
        this._burstCount = 0;
        this._burstAcc = 0;
        // Data is now imported from chatData.js for easy tuning
    }

    getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    generateRandomUsername() {
        let username = "";
        const structureType = Math.random();

        if (structureType < 0.4) { // Prefix + Suffix
            username = this.getRandomElement(USERNAME_PARTS.prefixes) + this.getRandomElement(USERNAME_PARTS.suffixes);
        } else if (structureType < 0.7) { // Middle + Suffix
            username = this.getRandomElement(USERNAME_PARTS.middles) + this.getRandomElement(USERNAME_PARTS.suffixes);
        } else { // Prefix + Middle + Suffix
            username = this.getRandomElement(USERNAME_PARTS.prefixes) + this.getRandomElement(USERNAME_PARTS.middles) + this.getRandomElement(USERNAME_PARTS.suffixes);
        }

        // Optionally add numbers
        if (Math.random() < 0.3) {
            username += this.getRandomElement(USERNAME_PARTS.numbers);
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
        const userColor = this.getRandomElement(USER_COLORS);
        const isSub = Math.random() < (Math.min(this.game.player.subscribers, 100) / 200); // Up to 50% chance at 100 subs
        
        let messageText = customMessage;

        if (!customMessage) {
            // Check for contextual messages
            if (Math.random() < 0.3) {
                messageText = this.getContextualMessage();
            } else if (Math.random() < 0.6 || !STREAM_TYPE_MESSAGES[streamType]) {
                messageText = this.getRandomElement(GENERIC_MESSAGES);
            } else {
                messageText = this.getRandomElement(STREAM_TYPE_MESSAGES[streamType]);
            }
            
            // Add emotes to messages
            messageText = this.addEmotes(messageText);
        }
        
        // Add subscriber badge if applicable
        const displayUsername = isSub ? `<span class="subscriber-badge">SUB</span>${username}` : username;
        
        // Update momentum
        this.updateMomentum();
        
        this.ui.addChatMessage(displayUsername, messageText, userColor);
    }
    
    getContextualMessage() {
        const viewers = this.game.currentStream.currentViewers;
        const energy = this.game.player.energy;
        const streamTime = this.game.currentStream.active ? (Date.now() - this.game.currentStream.startTime) / 1000 : 0;
        
        if (viewers < 5) {
            return this.getRandomElement(CONTEXTUAL_MESSAGES.lowViewers);
        } else if (viewers > 50) {
            return this.getRandomElement(CONTEXTUAL_MESSAGES.highViewers);
        } else if (streamTime > 120) {
            return this.getRandomElement(CONTEXTUAL_MESSAGES.longStream);
        } else if (energy < 30) {
            return this.getRandomElement(CONTEXTUAL_MESSAGES.lowEnergy);
        }
        
        return this.getRandomElement(GENERIC_MESSAGES);
    }
    
    addEmotes(message) {
        // Randomly add emotes to messages
        if (Math.random() < 0.4) {
            const emoteKeys = Object.keys(CHAT_EMOTES);
            const randomEmote = this.getRandomElement(emoteKeys);
            message += ` ${randomEmote}`;
        }
        
        // Replace text emotes with emoji
        Object.entries(CHAT_EMOTES).forEach(([text, emoji]) => {
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
        if (this.game.currentStream.active && this.momentum > 5) {
            const viewerBoost = Math.floor(this.momentum * CONFIG.CHAT_MOMENTUM_MULTIPLIER);
            if (Math.random() < CONFIG.VIEWER_GROWTH_MOMENTUM) {
                this.game.currentStream.currentViewers += viewerBoost;
                this.ui.updateViewerCount(this.game.currentStream.currentViewers);
            }
        }
    }

    startChatting(streamType) {
        if (this.chatTimer) {
            clearTimeout(this.chatTimer);
            this.chatTimer = null;
        }
        this.active = true;
        this.streamType = streamType;
        this.momentum = 0;
        this._accMs = 0;
        this._burstCount = 3; // initial messages
        this._burstAcc = 0;
        // prime initial delay based on current viewers
        const viewers = this.game.currentStream.currentViewers || 0;
        const base = 3000, min = 1000;
        this._nextDelayMs = Math.max(min, base - (viewers * 20));
    }

    stopChatting() {
        if (this.chatTimer) { clearTimeout(this.chatTimer); this.chatTimer = null; }
        this.active = false;
        this._accMs = 0;
        this._burstAcc = 0;
        this._burstCount = 0;
    }

    // dt-driven chat loop called from Game heartbeat while streaming
    step(dt) {
        if (!this.active || !this.game.currentStream.active) return;
        const viewers = this.game.currentStream.currentViewers || 0;

        // Handle initial burst quickly
        if (this._burstCount > 0) {
            this._burstAcc += dt;
            if (this._burstAcc >= 0.4) { // ~every 400ms
                this._burstAcc -= 0.4;
                this._burstCount--;
                this.generateChatMessage(this.streamType);
            }
            return;
        }

        this._accMs += dt * 1000;
        const base = 3000, min = 1000;
        const desiredDelay = Math.max(min, base - (viewers * 20));
        // Smoothly adjust toward desired delay
        this._nextDelayMs = this._nextDelayMs * 0.7 + desiredDelay * 0.3;

        if (this._accMs >= this._nextDelayMs) {
            this._accMs = 0;
            const messageCount = viewers > 50 ? Math.floor(Math.random() * 3) + 1 : 1;
            for (let i = 0; i < messageCount; i++) {
                this.generateChatMessage(this.streamType);
            }
        }
    }

    postDonationReaction(donatorName, amount) {
        const messageTemplate = this.getRandomElement(DONATION_REACTIONS);
        const message = messageTemplate
            .replace('{donator}', donatorName)
            .replace('${amount}', amount);
        const reactionUser = this.generateRandomUsername(); // A random chatter reacts
        this.generateChatMessage(this.game.currentStream.type, reactionUser, message);
        
        // Maybe a second, slightly delayed reaction
        if (Math.random() < 0.5) {
            setTimeout(() => {
                const anotherUser = this.generateRandomUsername();
                this.generateChatMessage(this.game.currentStream.type, anotherUser, "So generous!");
            }, Math.random() * 1000 + 500);
        }
    }

    postEventReaction(event) {
        let reactionMessages = EVENT_REACTIONS[event.id] || ["Something happened!", "What was that?", "Interesting..."];
        
        // Special case for trolls based on reputation
        if (event.id === "trolls" && this.game.player.reputation > 70) {
            reactionMessages = [...reactionMessages, "Our community is strong! 💪"];
        }

        if (reactionMessages.length > 0) {
            const reactionUser = this.generateRandomUsername();
            this.generateChatMessage(this.game.currentStream.type, reactionUser, this.getRandomElement(reactionMessages));
        }
    }

    postSubscriberMessage() {
        const months = Math.floor(Math.random() * 24) + 1;
        const subMessage = this.getRandomElement(SUB_MESSAGES).replace('{months}', months);
        const subscriber = this.generateRandomUsername();
        
        this.generateChatMessage(this.game.currentStream.type, subscriber, subMessage);
        
        // Follow-up hype
        setTimeout(() => {
            const hypeUser = this.generateRandomUsername();
            this.generateChatMessage(this.game.currentStream.type, hypeUser, "New sub! Welcome! 🎉");
        }, 500);
    }
}

// Chat manager is now created as an instance in Game class