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
        // Debounced stats updater to reduce redundant UI work
        this._statsUpdateScheduled = false;
        this._statsUpdateDelayMs = 100;
        this._statsUpdateTimer = null;
        this.scheduleStatsUpdate = () => {
            if (this._statsUpdateScheduled) return;
            this._statsUpdateScheduled = true;
            this._statsUpdateTimer = setTimeout(() => {
                this.ui.updateStats();
                this._statsUpdateScheduled = false;
                this._statsUpdateTimer = null;
            }, this._statsUpdateDelayMs);
        };
        // Heartbeat loop state
        this._rafId = null;
        this._lastTs = null;
        this.energyRecoveryEnabled = false;
        // Create player with UI callbacks
        this.player = new Player({
            updateStats: () => this.scheduleStatsUpdate(),
            showNotification: (message) => this.ui.showNotification(message),
            logEvent: (message) => this.ui.logEvent(message)
        });
        this.currentStream = new Stream(this, this.ui);
        this.chatManager = new ChatManager(this, this.ui);
        this.eventManager = new EventManager(this, this.ui);
        this.saveManager = new SaveManager(this);
        this.energyRecoveryTimer = null;
        // Auto-save via heartbeat
        this._autoSaveEnabled = true;
        this._autoSaveAcc = 0;
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
        // Start unified heartbeat
        this.startHeartbeat();
        
        // Enable auto-save (heartbeat-driven)
        this._autoSaveEnabled = true;
        
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
        this.energyRecoveryEnabled = true;
    }
    
    stopEnergyRecovery() {
        this.energyRecoveryEnabled = false;
    }
    
    startAutoSave() {
        this._autoSaveEnabled = true;
    }
    
    stopAutoSave() {
        this._autoSaveEnabled = false;
    }
    
    autoSave() {
        this.saveManager.autoSave();
    }
    
    victory() {
        this.isActive = false;
        this.stopEnergyRecovery();
        this.stopHeartbeat();
        this._autoSaveEnabled = false;
        if (this.currentStream.active) {
            this.endStream();
        }
        
        this.ui.logEvent("CONGRATULATIONS! You've become a successful streamer!");
        this.ui.showVictoryScreen();
    }

    // ===== Heartbeat loop =====
    startHeartbeat() {
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._lastTs = performance.now();
        const tick = (ts) => {
            const dtMs = Math.min(250, ts - this._lastTs); // clamp to avoid huge jumps
            this._lastTs = ts;
            const dt = dtMs / 1000;

            if (this.isActive) {
                if (this.currentStream.active) {
                    this.currentStream.step(dt);
                    // Drive chat timing in heartbeat
                    this.chatManager.step(dt);
                    
                    // Apply passive income during streaming (from sponsorships etc.)
                    if (this.player.passiveIncomePerMinute > 0) {
                        const passiveIncome = (this.player.passiveIncomePerMinute / 60) * dt;
                        this.player.addMoney(Math.floor(passiveIncome));
                    }
                } else if (this.energyRecoveryEnabled && this.player.energy < this.player.maxEnergy) {
                    const baseRecoveryPerSec = CONFIG.ENERGY_RECOVERY_RATE / 60; // energy per second
                    const bonusMultiplier = 1 + (this.player.energyRecoveryBonus || 0);
                    const totalRecoveryPerSec = baseRecoveryPerSec * bonusMultiplier;
                    this.player.recoverEnergy(totalRecoveryPerSec * dt);
                }

                // Auto-save accumulator
                if (this._autoSaveEnabled) {
                    this._autoSaveAcc += dt;
                    if (this._autoSaveAcc >= CONFIG.AUTO_SAVE_INTERVAL) {
                        this._autoSaveAcc = 0;
                        this.saveManager.autoSave();
                    }
                } else {
                    this._autoSaveAcc = 0;
                }
            }

            this._rafId = requestAnimationFrame(tick);
        };
        this._rafId = requestAnimationFrame(tick);
    }

    stopHeartbeat() {
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
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

        const baseEnergyGained = CONFIG.ACTIVE_REST_ENERGY_GAIN;
        const bonusMultiplier = 1 + (this.player.energyRecoveryBonus || 0);
        const totalEnergyGained = Math.floor(baseEnergyGained * bonusMultiplier);
        this.player.recoverEnergy(totalEnergyGained);
        
        // Random rest messages
        const restMessages = [
            `Took a quick break and recovered ${totalEnergyGained} energy.`,
            `Recharged with a power nap! +${totalEnergyGained} energy.`,
            `Grabbed a snack and recovered ${totalEnergyGained} energy.`,
            `Stretched and recovered ${totalEnergyGained} energy.`
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
