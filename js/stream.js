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
        CHAT_MANAGER.startChatting(this.type); // Start chat simulation
        
        return true;
    }
    
    end() {
        if (!this.active) return false;
        
        this.active = false;
        this.endTime = new Date();
        this.duration = (this.endTime - this.startTime) / 1000; // in seconds
        
        CHAT_MANAGER.stopChatting(); // Stop chat simulation
        this.clearTimers();
        
        // Calculate rewards
        const rewards = this.calculateRewards();
        
        // Apply rewards
        GAME.player.addMoney(rewards.money);
        GAME.player.addSubscribers(rewards.subscribers);
        GAME.player.changeReputation(rewards.reputation);
        
        // Check for subscriber churn due to bad stream performance
        const durationFactor = Math.min(this.duration / this.targetDuration, 1.0); // Already calculated in calculateRewards, but recalculate for clarity here or pass from there
        const endedDueToExhaustion = GAME.player.energy <= 0;

        if ((durationFactor < CONFIG.BAD_STREAM_CHURN_THRESHOLD || endedDueToExhaustion) && GAME.player.subscribers >= CONFIG.MIN_SUBSCRIBERS_FOR_CHURN) {
            let churnPercent = CONFIG.BAD_STREAM_CHURN_BASE_PERCENT;
            const reputationMitigation = GAME.player.reputation * CONFIG.CHURN_REPUTATION_MITIGATION_FACTOR;
            churnPercent = Math.max(0, churnPercent - reputationMitigation);
            churnPercent = Math.min(churnPercent, CONFIG.MAX_CHURN_PERCENT_CAP);

            if (churnPercent > 0) {
                const subsToLose = Math.floor(GAME.player.subscribers * churnPercent);
                if (subsToLose > 0) {
                    GAME.player.removeSubscribers(subsToLose);
                    let churnReason = "Stream performance was poor.";
                    if (endedDueToExhaustion) churnReason = "Stream ended due to exhaustion.";
                    else if (durationFactor < CONFIG.BAD_STREAM_CHURN_THRESHOLD) churnReason = "Stream was too short.";
                    UI.logEvent(`Lost ${subsToLose} subscribers. Reason: ${churnReason}`);
                    UI.showNotification(`Oh no! Lost ${subsToLose} subscribers due to a bad stream!`);
                }
            }
        }
        
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
        viewers += Math.floor(GAME.player.subscribers * 0.15);
        
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
        
        // Money from subscribers (based on current total subs and duration)
        rewards.money = GAME.player.subscribers * CONFIG.SUBSCRIBER_VALUE * (this.duration / 60);
        
        // Money from donations (already accumulated during stream)
        // Add current money earned from donations
        rewards.money = Math.floor(rewards.money);
        
        // New subscribers based on performance
        // A simple formula: 1 new sub per 50 average viewers, adjusted by reputation and duration factor
        // We use currentViewers as a proxy for average viewers for now.
        // Ensure currentViewers is not zero to avoid division by zero if stream ends abruptly with 0 viewers.
        if (this.currentViewers > 0) {
            const baseNewSubs = (this.currentViewers / 50); 
            const reputationBonus = (GAME.player.reputation / 100) + 0.5; // Min 0.5, Max 1.5 multiplier
            rewards.subscribers = Math.floor(baseNewSubs * durationFactor * reputationBonus);
        } else {
            rewards.subscribers = 0; // No new subs if stream ended with no viewers
        }
        
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

            // Check for new live subscribers
            if (this.currentViewers > 0 && Math.random() < (this.currentViewers * CONFIG.LIVE_SUBSCRIBER_RATE)) {
                GAME.player.addSubscribers(1);
                // Consider a subtle UI notification here in the future if desired
            }
            
            // Check if we've reached target duration
            if (elapsed >= this.targetDuration) {
                UI.highlightEndStream();
            }
            
            // Use energy during stream more rapidly
            // Target: 100 energy in 30 seconds => 100/30 = 3.33 energy per second
            GAME.player.useEnergy(10/3); 
            if (GAME.player.energy <= 0) {
                UI.logEvent("You're exhausted! Stream ended abruptly.");
                CHAT_MANAGER.stopChatting(); // Stop chat if stream ends due to exhaustion
                this.end();
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
