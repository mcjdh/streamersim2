class Game {
    constructor() {
        this.player = new Player();
        this.currentStream = new Stream();
        this.energyRecoveryTimer = null;
        this.isActive = false;
        this.sessionStartTime = Date.now();
        this.firstStream = true;
    }
    
    init() {
        // Initialize the game
        this.player.reset();
        UI.init();
        this.isActive = true;
        
        // Start energy recovery when not streaming
        this.startEnergyRecovery();
        
        // Set initial UI state
        UI.updateStats();
        UI.updateStreamDisplay();
        
        // Personalized welcome message
        const welcomeMessages = [
            "Welcome to Streamer Simulator 2! Start streaming to grow your channel.",
            "Ready to become the next big streamer? Choose a stream type and go live!",
            "Your streaming journey begins now. Build your audience one stream at a time!"
        ];
        UI.logEvent(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]);
    }
    
    reset() {
        // Reset the game state
        this.player.reset();
        UI.updateStats();
        UI.updateStreamDisplay();
        UI.logEvent("Game reset. Good luck on your streaming journey!");
    }
    
    startStream(streamType) {
        if (!this.player.canStream()) {
            UI.showNotification("You don't have enough energy to stream!");
            UI.logEvent("💡 Tip: Use the Rest button to recover energy faster!");
            return false;
        }
        
        // Stop energy recovery during streaming
        this.stopEnergyRecovery();
        
        // Start the stream
        if (this.currentStream.start(streamType)) {
            UI.toggleStreamControls(true);
            
            // First stream hint
            if (this.firstStream) {
                this.firstStream = false;
                setTimeout(() => {
                    UI.logEvent("💡 Tip: End your stream before running out of energy!");
                }, 5000);
            }
            
            return true;
        }
        
        return false;
    }
    
    endStream() {
        if (this.currentStream.end()) {
            UI.toggleStreamControls(false);
            
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
    
    victory() {
        this.isActive = false;
        this.stopEnergyRecovery();
        if (this.currentStream.active) {
            this.endStream();
        }
        
        UI.logEvent("CONGRATULATIONS! You've become a successful streamer!");
        UI.showVictoryScreen();
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
            UI.showNotification("Cannot rest while streaming!");
            return;
        }

        if (this.player.energy >= this.player.maxEnergy) {
            UI.showNotification("Energy is already full!");
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
        UI.logEvent(restMessages[Math.floor(Math.random() * restMessages.length)]);
        
        // Small chance for bonus energy
        if (Math.random() < 0.1) {
            const bonus = 5;
            this.player.recoverEnergy(bonus);
            UI.showNotification(`Feeling refreshed! Bonus +${bonus} energy!`);
        }
    }
}

// Initialize the global game object and start the game when page loads
const GAME = new Game();
window.addEventListener('DOMContentLoaded', () => {
    GAME.init();
    
    // Add CSS for donation animations
    // const style = document.createElement('style');
    // style.textContent = `
    //     @keyframes donationFloat {
    //         0% { transform: scale(0.5); opacity: 0; }
    //         10% { transform: scale(1.2); opacity: 1; }
    //         20% { transform: scale(1); opacity: 1; }
    //         80% { transform: translateY(-20px); opacity: 1; }
    //         100% { transform: translateY(-40px); opacity: 0; }
    //     }
    //     
    //     .highlight {
    //         animation: highlight 0.5s infinite alternate;
    //     }
    //     
    //     @keyframes highlight {
    //         from { background-color: #9147ff; }
    //         to { background-color: #ff4747; }
    //     }
    //     
    //     .stream-gaming, .stream-chat, .stream-music, .stream-art, .stream-coding {
    //         font-size: 24px;
    //         text-align: center;
    //     }
    //     
    //     .stream-option {
    //         display: flex;
    //         align-items: center;
    //         margin: 5px 0;
    //     }
    //     
    //     .stream-option input {
    //         margin-right: 5px;
    //     }
    //     
    //     .offline-message {
    //         font-size: 24px;
    //         color: #666;
    //         text-align: center;
    //     }
    //     
    //     .timestamp {
    //         color: #9147ff;
    //         font-weight: bold;
    //         margin-right: 5px;
    //     }
    // `;
    // document.head.appendChild(style);
});
