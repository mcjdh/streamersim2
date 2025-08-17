import { CONFIG } from '../config/config.js';
import { Player } from './player.js';
import { Stream } from './stream.js';
import { ModularUI } from '../ui/ModularUI.js';
import { ChatManager } from '../systems/chat.js';
import { EventManager } from '../systems/events.js';
import { SaveManager } from '../systems/SaveManager.js';

export class Game {
    constructor() {
        this.ui = new ModularUI(this);
        // Create player with UI callbacks
        this.player = new Player({
            updateStats: () => this.ui.updateStats(),
            showNotification: (message) => this.ui.showNotification(message),
            logEvent: (message) => this.ui.logEvent(message)
        });
        this.currentStream = new Stream(this, this.ui);
        this.chatManager = new ChatManager(this, this.ui);
        this.eventManager = new EventManager(this, this.ui);
        this.saveManager = new SaveManager(this);
        this.energyRecoveryTimer = null;
        this.isActive = false;
        this.sessionStartTime = Date.now();
        this.firstStream = true;
    }
    
    init() {
        // Initialize the game
        this.player.reset();
        this.ui.init();
        this.isActive = true;
        
        // Start energy recovery when not streaming
        this.startEnergyRecovery();
        
        // Start auto-save
        this.saveManager.startAutoSave();
        
        // Set initial UI state
        this.ui.updateStats();
        this.ui.updateStreamDisplay();
        
        // Personalized welcome message
        const welcomeMessages = [
            "Welcome to Streamer Simulator 2! Start streaming to grow your channel.",
            "Ready to become the next big streamer? Choose a stream type and go live!",
            "Your streaming journey begins now. Build your audience one stream at a time!"
        ];
        this.ui.logEvent(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]);
    }
    
    reset() {
        // Reset the game state
        this.player.reset();
        this.ui.updateStats();
        this.ui.updateStreamDisplay();
        this.ui.logEvent("Game reset. Good luck on your streaming journey!");
    }
    
    startStream(streamType) {
        if (!this.player.canStream()) {
            this.ui.showNotification("You don't have enough energy to stream!");
            this.ui.logEvent("💡 Tip: Use the Rest button to recover energy faster!");
            return false;
        }
        
        // Stop energy recovery during streaming
        this.stopEnergyRecovery();
        
        // Start the stream
        if (this.currentStream.start(streamType)) {
            this.ui.toggleStreamControls(true);
            
            // First stream hint
            if (this.firstStream) {
                this.firstStream = false;
                setTimeout(() => {
                    this.ui.logEvent("💡 Tip: End your stream before running out of energy!");
                }, 5000);
            }
            
            return true;
        }
        
        return false;
    }
    
    endStream() {
        if (this.currentStream.end()) {
            this.ui.toggleStreamControls(false);
            
            // Resume energy recovery
            this.startEnergyRecovery();
            return true;
        }
        
        return false;
    }
    
    startEnergyRecovery() {
        // Clear any existing timer
        if (this.energyRecoveryTimer) {
            clearInterval(this.energyRecoveryTimer);
        }
        
        // Start new timer for energy recovery when not streaming
        this.energyRecoveryTimer = setInterval(() => {
            if (!this.currentStream.active && this.player.energy < this.player.maxEnergy) {
                // Calculate energy recovery
                const recovery = (CONFIG.ENERGY_RECOVERY_RATE / 60) * CONFIG.ENERGY_RECOVERY_INTERVAL;
                this.player.recoverEnergy(recovery);
            }
        }, CONFIG.ENERGY_RECOVERY_INTERVAL * 1000);
    }
    
    stopEnergyRecovery() {
        if (this.energyRecoveryTimer) {
            clearInterval(this.energyRecoveryTimer);
            this.energyRecoveryTimer = null;
        }
    }
    
    startAutoSave() {
        this.saveManager.startAutoSave();
    }
    
    stopAutoSave() {
        this.saveManager.stopAutoSave();
    }
    
    autoSave() {
        this.saveManager.autoSave();
    }
    
    victory() {
        this.isActive = false;
        this.stopEnergyRecovery();
        this.saveManager.stopAutoSave();
        if (this.currentStream.active) {
            this.endStream();
        }
        
        this.ui.logEvent("CONGRATULATIONS! You've become a successful streamer!");
        this.ui.showVictoryScreen();
    }
    
    getGameStats() {
        return {
            daysPlayed: Math.floor(this.player.stats.totalStreamTime / (60 * 24)), // Assuming 1 day = 24 minutes
            totalStreamTime: this.player.stats.totalStreamTime,
            streamsCompleted: this.player.stats.streamsCompleted,
            maxViewers: this.player.stats.maxViewers,
            totalEvents: this.player.stats.totalEvents,
            totalDonations: this.player.stats.totalDonations
        };
    }

    performActiveRest() {
        if (this.currentStream.active) {
            this.ui.showNotification("Cannot rest while streaming!");
            return;
        }

        if (this.player.energy >= this.player.maxEnergy) {
            this.ui.showNotification("Energy is already full!");
            return;
        }

        const energyGained = CONFIG.ACTIVE_REST_ENERGY_GAIN;
        this.player.recoverEnergy(energyGained);
        
        // Random rest messages
        const restMessages = [
            `Took a quick break and recovered ${energyGained} energy.`,
            `Recharged with a power nap! +${energyGained} energy.`,
            `Grabbed a snack and recovered ${energyGained} energy.`,
            `Stretched and recovered ${energyGained} energy.`
        ];
        this.ui.logEvent(restMessages[Math.floor(Math.random() * restMessages.length)]);
        
        // Small chance for bonus energy
        if (Math.random() < 0.1) {
            const bonus = 5;
            this.player.recoverEnergy(bonus);
            this.ui.showNotification(`Feeling refreshed! Bonus +${bonus} energy!`);
        }
    }
}

// Note: Game initialization is now handled by main.js
