import { CONFIG } from '../config/config.js';

export class Stream {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
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
        this.viewerRetention = CONFIG.VIEWER_RETENTION_BASE;
        this.peakViewers = 0;
        this.viewerHistory = [];
        this.energyDrainRate = CONFIG.ENERGY_DEPLETION_BASE;
    }
    
    start(streamType) {
        if (this.active) return false;
        
        const streamTypeConfig = CONFIG.STREAM_TYPES.find(type => type.id === streamType);
        if (!streamTypeConfig) return false;
        
        // Check if player can afford and has energy
        if (!this.game.player.spendMoney(streamTypeConfig.cost)) {
            this.ui.showNotification("Not enough money to start this stream!");
            return false;
        }
        
        if (this.game.player.energy < streamTypeConfig.energyCost) {
            this.ui.showNotification("Not enough energy to start streaming!");
            return false;
        }
          // Set stream properties
        this.active = true;
        this.startTime = new Date();
        this.type = streamType;
        this.currentViewers = this.calculateStartingViewers(streamTypeConfig);
        this.peakViewers = this.currentViewers;
        this.viewerHistory = [this.currentViewers];
        
        // Set target duration based on config
        this.targetDuration = CONFIG.STREAM_MIN_DURATION + 
            Math.random() * (CONFIG.STREAM_MAX_DURATION - CONFIG.STREAM_MIN_DURATION);
        
        // Calculate energy drain rate based on stream type and skills
        this.calculateEnergyDrainRate(streamTypeConfig);
        
        // Use energy
        this.game.player.useEnergy(streamTypeConfig.energyCost);
        
        // Start UI updates
        this.startTimers();
        this.ui.updateStreamDisplay(this.type);
        this.ui.logEvent(`Started a ${streamTypeConfig.name} stream!`);
        this.game.chatManager.startChatting(this.type); // Start chat simulation
        
        return true;
    }
    
    end() {
        if (!this.active) return false;
        
        this.active = false;
        this.endTime = new Date();
        this.duration = (this.endTime - this.startTime) / 1000; // in seconds
        
        this.game.chatManager.stopChatting(); // Stop chat simulation
        this.clearTimers();
        
        // Calculate rewards
        const rewards = this.calculateRewards();
        
        // Apply rewards
        this.game.player.addMoney(rewards.money);
        this.game.player.addSubscribers(rewards.subscribers);
        this.game.player.changeReputation(rewards.reputation);
        
        // Check for subscriber churn due to bad stream performance
        const durationFactor = Math.min(this.duration / this.targetDuration, 1.0); // Already calculated in calculateRewards, but recalculate for clarity here or pass from there
        const endedDueToExhaustion = this.game.player.energy <= 0;

        if ((durationFactor < CONFIG.BAD_STREAM_CHURN_THRESHOLD || endedDueToExhaustion) && this.game.player.subscribers >= CONFIG.MIN_SUBSCRIBERS_FOR_CHURN) {
            let churnPercent = CONFIG.BAD_STREAM_CHURN_BASE_PERCENT;
            const reputationMitigation = this.game.player.reputation * CONFIG.CHURN_REPUTATION_MITIGATION_FACTOR;
            churnPercent = Math.max(0, churnPercent - reputationMitigation);
            churnPercent = Math.min(churnPercent, CONFIG.MAX_CHURN_PERCENT_CAP);

            if (churnPercent > 0) {
                const subsToLose = Math.floor(this.game.player.subscribers * churnPercent);
                if (subsToLose > 0) {
                    this.game.player.removeSubscribers(subsToLose);
                    let churnReason = "Stream performance was poor.";
                    if (endedDueToExhaustion) churnReason = "Stream ended due to exhaustion.";
                    else if (durationFactor < CONFIG.BAD_STREAM_CHURN_THRESHOLD) churnReason = "Stream was too short.";
                    this.ui.logEvent(`Lost ${subsToLose} subscribers. Reason: ${churnReason}`);
                    this.ui.showNotification(`Oh no! Lost ${subsToLose} subscribers due to a bad stream!`);
                }
            }
        }
        
        // Update stats
        this.game.player.stats.totalStreamTime += this.duration;
        this.game.player.stats.streamsCompleted++;
        this.game.player.stats.maxViewers = Math.max(this.game.player.stats.maxViewers, this.currentViewers);
        
        // Log results
        this.ui.logEvent(`Stream ended after ${Math.floor(this.duration)} seconds. Gained $${rewards.money} and ${rewards.subscribers} new subscribers!`);
        
        // Check if player has met win conditions
        if (this.game.player.hasWon()) {
            this.game.victory();
        }
        
        this.ui.updateStreamDisplay();
        return true;
    }
    
    calculateStartingViewers(streamTypeConfig) {
        // Base viewers
        let viewers = streamTypeConfig.baseViewers;
        
        // Factor in subscribers (some percentage will watch)
        viewers += Math.floor(this.game.player.subscribers * 0.15);
        
        // Factor in reputation
        viewers *= (0.5 + (this.game.player.reputation / 100) * 1.5);
        
        // Factor in relevant skill
        let relevantSkill = 1;
        switch(this.type) {
            case "gaming": 
                relevantSkill = this.game.player.getSkillLevel("gaming"); 
                break;
            case "justchatting":
            case "music": 
                relevantSkill = this.game.player.getSkillLevel("talking"); 
                break;
            case "artstream": 
                relevantSkill = this.game.player.getSkillLevel("creativity"); 
                break;
            case "coding": 
                relevantSkill = this.game.player.getSkillLevel("technical"); 
                break;
        }
        
        viewers *= (0.7 + (relevantSkill * 0.3));
        
        // Add randomness
        viewers *= (0.8 + Math.random() * 0.4);
        
        return Math.floor(viewers);
    }
    
    calculateEnergyDrainRate(streamTypeConfig) {
        let drainRate = streamTypeConfig.energyCost / 30; // Base rate
        
        // Skill reduces energy drain
        const relevantSkillLevel = this.getRelevantSkillLevel();
        drainRate *= (1.2 - (relevantSkillLevel * 0.1)); // Up to 50% reduction at skill 5
        
        // Reputation makes streaming less tiring
        drainRate *= (1 - (this.game.player.reputation / 200)); // Up to 50% reduction at 100 rep
        
        this.energyDrainRate = Math.max(0.1, drainRate); // Minimum drain rate
    }
    
    getRelevantSkillLevel() {
        const skillMap = {
            "gaming": "gaming",
            "justchatting": "talking",
            "music": "talking",
            "artstream": "creativity",
            "coding": "technical"
        };
        return this.game.player.getSkillLevel(skillMap[this.type] || "talking");
    }
    
    calculateRewards() {
        const rewards = {
            money: 0,
            subscribers: 0,
            reputation: 0
        };
        
        // Enhanced duration factor calculation
        const actualDuration = this.duration;
        const targetCompletion = actualDuration / this.targetDuration;
        const durationFactor = Math.min(targetCompletion, 1.0);
        
        // Average viewers throughout stream
        const avgViewers = this.viewerHistory.length > 0 
            ? this.viewerHistory.reduce((a, b) => a + b, 0) / this.viewerHistory.length 
            : 0;
        
        // Money calculation with viewer average
        const baseMoneyPerMinute = this.game.player.subscribers * CONFIG.SUBSCRIBER_VALUE;
        const viewerBonus = avgViewers * 0.1; // Extra money from viewers
        rewards.money = Math.floor((baseMoneyPerMinute + viewerBonus) * (actualDuration / 60) * durationFactor);
        
        // Subscriber calculation with better formula
        if (avgViewers > 0) {
            const baseNewSubs = (avgViewers / 30); // 1 sub per 30 average viewers
            const reputationMultiplier = 0.5 + (this.game.player.reputation / 100); // 0.5x to 1.5x
            const peakViewerBonus = (this.peakViewers / 100) * 0.5; // Bonus for high peak
            
            rewards.subscribers = Math.floor(
                (baseNewSubs + peakViewerBonus) * durationFactor * reputationMultiplier
            );
        }
        
        // Reputation changes
        if (durationFactor >= 0.9) {
            rewards.reputation = 3; // Better reward for completing streams
        } else if (durationFactor >= 0.7) {
            rewards.reputation = 1;
        } else if (durationFactor < 0.3) {
            rewards.reputation = -5; // Harsh penalty for very short streams
        } else if (durationFactor < 0.5) {
            rewards.reputation = -2;
        }
        
        // Bonus reputation for high viewer retention
        const retentionRate = this.currentViewers / Math.max(this.peakViewers, 1);
        if (retentionRate > 0.8 && this.peakViewers > 20) {
            rewards.reputation += 2;
        }
        
        return rewards;
    }
    
    updateViewers() {
        if (!this.active) return;
        
        // Calculate viewer retention
        const baseRetention = CONFIG.VIEWER_RETENTION_BASE;
        const repBonus = this.game.player.reputation * CONFIG.VIEWER_RETENTION_REPUTATION_BONUS;
        const skillBonus = this.getRelevantSkillLevel() * 0.05;
        
        this.viewerRetention = Math.min(0.95, baseRetention + repBonus + skillBonus);
        
        // Apply retention
        let newViewerCount = this.currentViewers;
        
        // Each viewer has a chance to leave
        for (let i = 0; i < this.currentViewers; i++) {
            if (Math.random() > this.viewerRetention) {
                newViewerCount--;
            }
        }
        
        // Chance for new viewers based on chat momentum
        if (this.game.chatManager.momentum > 5) {
            const growthChance = CONFIG.VIEWER_GROWTH_MOMENTUM * (this.game.chatManager.momentum / 10);
            if (Math.random() < growthChance) {
                newViewerCount += Math.floor(Math.random() * 3) + 1;
            }
        }
        
        // Random fluctuation
        const fluctuation = Math.floor(Math.random() * 3) - 1; // -1 to +1
        newViewerCount = Math.max(0, newViewerCount + fluctuation);
        
        this.currentViewers = newViewerCount;
        this.viewerHistory.push(this.currentViewers);
        this.peakViewers = Math.max(this.peakViewers, this.currentViewers);
        
        // Check for donations
        this.checkForDonations();
        
        // Update UI
        this.ui.updateViewerCount(this.currentViewers);
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
            
            this.game.player.addMoney(donationAmount);
            this.game.player.stats.totalDonations += donationAmount;
            
            this.ui.showDonation(donationAmount);
        }
    }
    
    startTimers() {
        // Stream update timer - every second
        this.timer = setInterval(() => {
            // Calculate elapsed time
            const elapsed = Math.floor((new Date() - this.startTime) / 1000);
            
            // Update UI
            this.ui.updateStreamTimer(elapsed);
            
            // Update viewers
            this.updateViewers();
            
            // Check for random events
            this.checkForRandomEvent();

            // Check for new live subscribers
            if (this.currentViewers > 0 && Math.random() < (this.currentViewers * CONFIG.LIVE_SUBSCRIBER_RATE)) {
                this.game.player.addSubscribers(1);
                // Consider a subtle UI notification here in the future if desired
            }
            
            // Check if we've reached target duration
            if (elapsed >= this.targetDuration) {
                this.ui.highlightEndStream();
            }
            
            // Dynamic energy usage based on calculated drain rate
            this.game.player.useEnergy(this.energyDrainRate);
            if (this.game.player.energy <= 0) {
                this.ui.logEvent("You're exhausted! Stream ended abruptly.");
                this.game.chatManager.stopChatting(); // Stop chat if stream ends due to exhaustion
                this.end();
            }
        }, 1000);
    }
      clearTimers() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.eventTimers.forEach(timer => clearTimeout(timer));
        this.eventTimers = [];
    }
    
    checkForRandomEvent() {
        if (Math.random() < CONFIG.EVENT_CHANCE_PER_SECOND) {
            const event = this.game.eventManager.getRandomEvent(this.type);
            this.game.eventManager.triggerEvent(event);
        }
    }
    
    switchType(newStreamType) {
        if (!this.active) return false;
        
        const streamTypeConfig = CONFIG.STREAM_TYPES.find(type => type.id === newStreamType);
        if (!streamTypeConfig) return false;
        
        const oldType = this.type;
        this.type = newStreamType;
        
        // Recalculate energy drain rate for new stream type
        this.calculateEnergyDrainRate(streamTypeConfig);
        
        // Log the switch
        this.ui.logEvent(`Switched from ${oldType} to ${newStreamType} stream!`);
        
        return true;
    }
}
