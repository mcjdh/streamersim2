class Stream {
    constructor() {
        this.active = false;
        this.startTime = null;
        this.endTime = null;
        this.duration = 0;
        this.targetDuration = 0;
        this.currentViewers = 0;
        this.type = null;
        this.timer = null;
        this.events = [];
        this.eventTimers = [];
    }
    
    start(streamType) {
        if (this.active) return false;
        
        const streamTypeConfig = CONFIG.STREAM_TYPES.find(type => type.id === streamType);
        if (!streamTypeConfig) return false;
        
        // Check if player can afford and has energy
        if (!GAME.player.spendMoney(streamTypeConfig.cost)) {
            UI.showNotification("Not enough money to start this stream!");
            return false;
        }
        
        if (GAME.player.energy < streamTypeConfig.energyCost) {
            UI.showNotification("Not enough energy to start streaming!");
            return false;
        }
        
        // Set stream properties
        this.active = true;
        this.startTime = new Date();
        this.type = streamType;
        this.currentViewers = this.calculateStartingViewers(streamTypeConfig);
        
        // Random duration between min and max
        this.targetDuration = Math.floor(
            Math.random() * (CONFIG.STREAM_MAX_DURATION - CONFIG.STREAM_MIN_DURATION + 1) + 
            CONFIG.STREAM_MIN_DURATION
        );
        
        // Use energy
        GAME.player.useEnergy(streamTypeConfig.energyCost);
        
        // Start UI updates
        this.startTimers();
        UI.updateStreamDisplay(this.type);
        UI.logEvent(`Started a ${streamTypeConfig.name} stream!`);
        
        return true;
    }
    
    end() {
        if (!this.active) return false;
        
        this.active = false;
        this.endTime = new Date();
        this.duration = (this.endTime - this.startTime) / 1000; // in seconds
        
        // Clear timers
        this.clearTimers();
        
        // Calculate rewards
        const rewards = this.calculateRewards();
        
        // Apply rewards
        GAME.player.addMoney(rewards.money);
        GAME.player.addSubscribers(rewards.subscribers);
        GAME.player.changeReputation(rewards.reputation);
        
        // Update stats
        GAME.player.stats.totalStreamTime += this.duration;
        GAME.player.stats.streamsCompleted++;
        GAME.player.stats.maxViewers = Math.max(GAME.player.stats.maxViewers, this.currentViewers);
        
        // Log results
        UI.logEvent(`Stream ended after ${Math.floor(this.duration)} seconds. Gained $${rewards.money} and ${rewards.subscribers} new subscribers!`);
        
        // Check if player has met win conditions
        if (GAME.player.hasWon()) {
            GAME.victory();
        }
        
        UI.updateStreamDisplay();
        return true;
    }
    
    calculateStartingViewers(streamTypeConfig) {
        // Base viewers
        let viewers = streamTypeConfig.baseViewers;
        
        // Factor in subscribers (some percentage will watch)
        viewers += Math.floor(GAME.player.subscribers * 0.1);
        
        // Factor in reputation
        viewers *= (0.5 + (GAME.player.reputation / 100) * 1.5);
        
        // Factor in relevant skill
        let relevantSkill = 1;
        switch(this.type) {
            case "gaming": 
                relevantSkill = GAME.player.getSkillLevel("gaming"); 
                break;
            case "justchatting":
            case "music": 
                relevantSkill = GAME.player.getSkillLevel("talking"); 
                break;
            case "artstream": 
                relevantSkill = GAME.player.getSkillLevel("creativity"); 
                break;
            case "coding": 
                relevantSkill = GAME.player.getSkillLevel("technical"); 
                break;
        }
        
        viewers *= (0.7 + (relevantSkill * 0.3));
        
        // Add randomness
        viewers *= (0.8 + Math.random() * 0.4);
        
        return Math.floor(viewers);
    }
    
    calculateRewards() {
        const rewards = {
            money: 0,
            subscribers: 0,
            reputation: 0
        };
        
        // Did stream meet target duration?
        const durationFactor = Math.min(this.duration / this.targetDuration, 1.0);
        
        // Subscribers gained based on viewership and duration
        rewards.subscribers = Math.floor(this.currentViewers * 0.05 * durationFactor);
        
        // Money from subscribers
        rewards.money = GAME.player.subscribers * CONFIG.SUBSCRIBER_VALUE * (this.duration / 60);
        
        // Money from donations (already accumulated during stream)
        // Add current money earned from donations
        rewards.money = Math.floor(rewards.money);
        
        // Reputation change
        if (durationFactor >= 0.9) {
            // Met or exceeded target duration - reputation boost
            rewards.reputation = 2;
        } else if (durationFactor < 0.5) {
            // Stream was too short - reputation hit
            rewards.reputation = -3;
        }
        
        return rewards;
    }
    
    updateViewers() {
        if (!this.active) return;
        
        // Random fluctuation in viewers
        const fluctuation = Math.random() > 0.5 ? 1 : -1;
        const changeAmount = Math.floor(Math.random() * 3) * fluctuation;
        
        this.currentViewers = Math.max(0, this.currentViewers + changeAmount);
        
        // Check for donations
        this.checkForDonations();
        
        // Update UI
        UI.updateViewerCount(this.currentViewers);
    }
    
    checkForDonations() {
        // Each viewer has a small chance of donating each second
        const donationChance = CONFIG.VIEWER_DONATION_CHANCE * this.currentViewers;
        
        if (Math.random() < donationChance) {
            const donationAmount = Math.floor(
                Math.random() * 
                (CONFIG.AVERAGE_DONATION_AMOUNT[1] - CONFIG.AVERAGE_DONATION_AMOUNT[0]) + 
                CONFIG.AVERAGE_DONATION_AMOUNT[0]
            );
            
            GAME.player.addMoney(donationAmount);
            GAME.player.stats.totalDonations += donationAmount;
            
            UI.showDonation(donationAmount);
        }
    }
    
    startTimers() {
        // Stream update timer - every second
        this.timer = setInterval(() => {
            // Calculate elapsed time
            const elapsed = Math.floor((new Date() - this.startTime) / 1000);
            
            // Update UI
            UI.updateStreamTimer(elapsed);
            
            // Update viewers
            this.updateViewers();
            
            // Check for random events
            this.checkForRandomEvent();
            
            // Check if we've reached target duration
            if (elapsed >= this.targetDuration) {
                UI.highlightEndStream();
            }
            
            // Use small amounts of energy during stream
            if (elapsed % 4 === 0) {
                GAME.player.useEnergy(1);
                if (GAME.player.energy <= 0) {
                    UI.logEvent("You're exhausted! Stream ended abruptly.");
                    this.end();
                }
            }
        }, 1000);
    }
    
    clearTimers() {
        clearInterval(this.timer);
        this.eventTimers.forEach(timer => clearTimeout(timer));
        this.eventTimers = [];
    }
    
    checkForRandomEvent() {
        if (Math.random() < CONFIG.EVENT_CHANCE_PER_SECOND) {
            const event = EventManager.getRandomEvent(this.type);
            EventManager.triggerEvent(event);
        }
    }
}
