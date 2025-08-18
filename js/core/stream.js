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
        this.viewerHistoryWindow = 300; // cap history to last ~5 minutes at 1s ticks
        this.energyDrainRate = CONFIG.ENERGY_DEPLETION_BASE;
        this._elapsedSec = 0; // accumulators for 1s cadence logic
        this._timerStarted = false;
        // EMA for viewers for rewards pacing
        this.viewerEma = 0;
        this.viewerEmaAlpha = 0.25; // fast-ish response over short 12s runs
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
        
        // Target duration becomes a soft hint; actual end is energy-based.
        // Use current energy to compute a target if none provided by meta-prog (future).
        this.targetDuration = Math.min(CONFIG.STREAM_MAX_DURATION, Math.max(CONFIG.STREAM_MIN_DURATION, this.game.player.energy));
        
        // Session energy model: consume entire current energy over the session duration
        this.energyAtStart = this.game.player.energy;
        // Efficiency reduces per-second drain (meta progression)
        const efficiency = Math.max(0.5, Math.min(1.5, this.game.player.energyEfficiency));
        this.sessionDrainPerSec = (this.energyAtStart / Math.max(1, this.targetDuration)) * efficiency;
        
        // Do not deduct upfront energy; run consumes energy evenly over session
        
        // Start UI updates via heartbeat (no local interval)
        this._timerStarted = true;
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
        
        // Build run summary
        const endedBy = endedDueToExhaustion ? 'energy' : 'manual';
        const summary = {
            duration: Math.floor(this.duration),
            avgViewers: Math.round(this.viewerEma || 0),
            peakViewers: this.peakViewers,
            moneyGained: rewards.money,
            subsGained: rewards.subscribers,
            reputationChange: rewards.reputation,
            endedBy,
            streamType: this.type
        };

        // Log results
        this.ui.logEvent(`Stream ended after ${summary.duration} seconds. Gained $${rewards.money} and ${rewards.subscribers} new subscribers!`);
        
        // Check if player has met win conditions
        if (this.game.player.hasWon()) {
            this.game.victory();
        } else {
            // Show run summary overlay with quick actions
            this.ui.showRunSummary(summary);
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
        
        // Apply starting viewer multiplier from upgrades
        viewers *= (this.game.player.startingViewerMultiplier || 1);
        
        // Add randomness
        viewers *= (0.8 + Math.random() * 0.4);
        
        return Math.floor(viewers);
    }
    
    calculateEnergyDrainRate(streamTypeConfig) {
        // Rebased for short 12s sessions: target additional ~25-60% of start cost over a run
        let drainRate = streamTypeConfig.energyCost / 20; // per second

        // Skill reduces energy drain
        const relevantSkillLevel = this.getRelevantSkillLevel();
        drainRate *= (1.1 - (relevantSkillLevel * 0.08)); // ~ up to ~40% reduction at higher skill

        // Reputation makes streaming less tiring
        drainRate *= (1 - (this.game.player.reputation / 300)); // up to ~33% reduction at 100 rep

        this.energyDrainRate = Math.max(0.2, drainRate); // Minimum drain rate for feel
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
        // Use EMA-based average viewers for reward stability
        const avgViewers = this.viewerEma || 0;
        
        // Money calculation with viewer average
        const baseMoneyPerMinute = this.game.player.subscribers * CONFIG.SUBSCRIBER_VALUE;
        const viewerBonus = avgViewers * 0.2; // More weight for short runs
        let moneyEarned = (baseMoneyPerMinute + viewerBonus) * (actualDuration / 60) * durationFactor;
        const incomeMult = this.game.player.moneyMultiplier || 1;
        moneyEarned *= incomeMult;
        rewards.money = Math.floor(moneyEarned);
        
        // Enhanced subscriber calculation with upgrade bonuses
        if (avgViewers > 0) {
            const baseNewSubs = (avgViewers / 15); // More generous - reduced from 20
            const reputationMultiplier = 0.8 + (this.game.player.reputation / 100); // 0.8x to 1.8x - improved
            const peakViewerBonus = (this.peakViewers / 50) * 0.5; // Better peak bonus - from 60 to 50
            const conversionBonus = 1 + (this.game.player.subscriberConversionBonus || 0);
            
            let subscriberGain = (baseNewSubs + peakViewerBonus) * durationFactor * reputationMultiplier * conversionBonus;
            
            // Apply completion bonuses for subscriber gain
            const completionThreshold = this.game.player.completionThreshold || 1;
            if (durationFactor >= completionThreshold) {
                const completionBonus = this.game.player.completionBonusSubscribers || 1;
                subscriberGain *= completionBonus;
            }
            
            rewards.subscribers = Math.floor(subscriberGain);
        }

        // Apply completion bonuses to ALL rewards if threshold met
        const completionThreshold = this.game.player.completionThreshold || 1;
        if (durationFactor >= completionThreshold) {
            const completionBonusAll = this.game.player.completionBonusAll || 1;
            if (completionBonusAll > 1) {
                rewards.money = Math.floor(rewards.money * completionBonusAll);
                rewards.subscribers = Math.floor(rewards.subscribers * completionBonusAll);
                // Don't multiply reputation to avoid inflation
            }
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
        if (retentionRate > 0.7 && this.peakViewers > 10) {
            rewards.reputation += 2;
        }
        
        return rewards;
    }
    
    updateViewers() {
        if (!this.active) return;
        
        // Calculate viewer retention with upgrade bonuses
        const baseRetention = CONFIG.VIEWER_RETENTION_BASE;
        const repBonus = this.game.player.reputation * CONFIG.VIEWER_RETENTION_REPUTATION_BONUS;
        const skillBonus = this.getRelevantSkillLevel() * 0.05;
        const upgradeBonus = this.game.player.viewerRetentionBonus || 0;
        
        this.viewerRetention = Math.min(0.98, baseRetention + repBonus + skillBonus + upgradeBonus);
        
        // Apply retention using expectation (O(1))
        const expectedStay = Math.round(this.currentViewers * this.viewerRetention);
        let newViewerCount = expectedStay;
        
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
        if (this.viewerHistory.length > this.viewerHistoryWindow) {
            this.viewerHistory.shift();
        }
        this.peakViewers = Math.max(this.peakViewers, this.currentViewers);
        // Update EMA
        if (this.viewerEma === 0) {
            this.viewerEma = this.currentViewers;
        } else {
            this.viewerEma = this.viewerEma + this.viewerEmaAlpha * (this.currentViewers - this.viewerEma);
        }
        
        // Check for donations
        this.checkForDonations();
        
        // Update UI
        this.ui.updateViewerCount(this.currentViewers);
    }
    
    checkForDonations() {
        // Enhanced donation system with upgrade multipliers
        const reputationBonus = 1 + (this.game.player.reputation / 200); // up to 1.5x
        const peakFactor = 1 + Math.min(0.5, this.peakViewers / 200); // up to +50%
        const upgradeMultiplier = this.game.player.donationRateMultiplier || 1;
        
        const donationChance = CONFIG.VIEWER_DONATION_CHANCE * this.currentViewers * reputationBonus * peakFactor * upgradeMultiplier;
        
        if (Math.random() < donationChance) {
            let donationAmount = Math.floor(
                Math.random() * 
                (CONFIG.AVERAGE_DONATION_AMOUNT[1] - CONFIG.AVERAGE_DONATION_AMOUNT[0]) + 
                CONFIG.AVERAGE_DONATION_AMOUNT[0]
            );
            
            // Apply money multiplier to donations too
            donationAmount = Math.floor(donationAmount * (this.game.player.moneyMultiplier || 1));
            
            this.game.player.addMoney(donationAmount);
            this.game.player.stats.totalDonations += donationAmount;
            
            this.ui.showDonation(donationAmount);
        }
    }
    
    // Called from Game heartbeat with dt in seconds
    step(dt) {
        if (!this.active) return;
        // Accumulate elapsed for 1 Hz logic
        this._elapsedSec += dt;
        this.duration = (new Date() - this.startTime) / 1000;
        this.ui.updateStreamTimer(Math.floor(this.duration));

        // Remove hard 12s cap: session ends primarily by energy now.

        // Per-second cadence
        while (this._elapsedSec >= 1) {
            this._elapsedSec -= 1;
            this.updateViewers();
            this.checkForRandomEvent();
            if (this.currentViewers > 0 && Math.random() < (this.currentViewers * CONFIG.LIVE_SUBSCRIBER_RATE)) {
                this.game.player.addSubscribers(1);
            }
            // Keep visual hint shortly before target
            if (this.duration >= this.targetDuration - 2) {
                this.ui.highlightEndStream();
            }
            // Drain energy to reach ~0 exactly at session end
            const perSecondDrain = this.sessionDrainPerSec;
            this.game.player.useEnergy(perSecondDrain);
            if (this.game.player.energy <= 0) {
                this.ui.logEvent("You're exhausted! Stream ended abruptly.");
                this.game.chatManager.stopChatting();
                this.end();
                return;
            }
        }
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
