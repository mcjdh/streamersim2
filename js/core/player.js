import { CONFIG } from '../config/config.js';
import { SHOP_ITEMS } from '../data/shopItems.js';

export class Player {
    constructor(callbacks = {}) {
        this.callbacks = {
            updateStats: callbacks.updateStats || (() => {}),
            showNotification: callbacks.showNotification || (() => {}),
            logEvent: callbacks.logEvent || (() => {})
        };
        this.money = 0;
        this.subscribers = 0;
        this.reputation = 0;
        this.energy = 100;
        this.maxEnergy = CONFIG.STARTING_ENERGY;
        this.energyEfficiency = 1.0; // < 1 drains slower, > 1 drains faster
        this.energyRecoveryBonus = 0; // Bonus to energy recovery rate
        this.moneyMultiplier = 1; // Income multiplier from upgrades
        
        // New roguelike progression properties
        this.startingViewerMultiplier = 1;
        this.viewerRetentionBonus = 0;
        this.subscriberConversionBonus = 0;
        this.donationRateMultiplier = 1;
        this.negativeEventImmunity = false;
        this.raidEventChance = 0;
        this.passiveIncomePerMinute = 0;
        this.chatMomentumBonus = 0;
        this.completionBonusSubscribers = 1;
        this.completionBonusAll = 1;
        this.completionThreshold = 1;
        this.activeSynergies = [];
        this.stats = {
            totalStreamTime: 0,
            streamsCompleted: 0,
            maxViewers: 0,
            totalDonations: 0,
            totalEvents: 0
        };
        this.inventory = [];
        this.skills = {
            gaming: 1,
            talking: 1,
            technical: 1,
            creativity: 1
        };
        this.achievedMilestones = [];
        this.reset();
    }
    
    reset() {
        this.money = CONFIG.STARTING_MONEY;
        this.subscribers = CONFIG.STARTING_SUBSCRIBERS;
        this.reputation = CONFIG.STARTING_REPUTATION;
        this.maxEnergy = CONFIG.STARTING_ENERGY;
        this.energy = this.maxEnergy;
        this.energyEfficiency = 1.0;
        this.energyRecoveryBonus = 0;
        this.moneyMultiplier = 1;
        
        // Reset roguelike progression properties
        this.startingViewerMultiplier = 1;
        this.viewerRetentionBonus = 0;
        this.subscriberConversionBonus = 0;
        this.donationRateMultiplier = 1;
        this.negativeEventImmunity = false;
        this.raidEventChance = 0;
        this.passiveIncomePerMinute = 0;
        this.chatMomentumBonus = 0;
        this.completionBonusSubscribers = 1;
        this.completionBonusAll = 1;
        this.completionThreshold = 1;
        this.activeSynergies = [];
        this.stats = {
            totalStreamTime: 0,
            streamsCompleted: 0,
            maxViewers: 0,
            totalDonations: 0,
            totalEvents: 0
        };
        this.inventory = [];
        this.achievedMilestones = [];
        this.skills = {
            gaming: 1,
            talking: 1,
            technical: 1,
            creativity: 1
        };
    }
    
    addMoney(amount) {
        this.money += amount;
        this.callbacks.updateStats();
        return amount;
    }
    
    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.callbacks.updateStats();
            return true;
        }
        return false;
    }
    
    addSubscribers(amount) {
        if (amount <= 0) return 0;
        const oldSubscribers = this.subscribers;
        this.subscribers += amount;
        this.checkSubscriberMilestones(oldSubscribers);
        this.callbacks.updateStats();
        return amount;
    }
    
    removeSubscribers(amount) {
        if (amount <= 0) return 0;
        const lostSubs = Math.min(this.subscribers, amount); // Cannot lose more than current subs
        this.subscribers -= lostSubs;
        if (this.subscribers < 0) this.subscribers = 0; // Ensure subs don't go negative
        this.callbacks.updateStats();
        return lostSubs;
    }
    
    checkSubscriberMilestones(oldSubscribers) {
        CONFIG.SUBSCRIBER_MILESTONES.forEach(milestone => {
            if (this.subscribers >= milestone.count && oldSubscribers < milestone.count && !this.achievedMilestones.includes(milestone.count)) {
                this.callbacks.showNotification(`MILESTONE: ${milestone.description}`);
                if (milestone.rewards.money) {
                    this.addMoney(milestone.rewards.money);
                    this.callbacks.logEvent(`Gained $${milestone.rewards.money} from a subscriber milestone!`);
                }
                if (milestone.rewards.reputation) {
                    this.changeReputation(milestone.rewards.reputation);
                    this.callbacks.logEvent(`Gained ${milestone.rewards.reputation} reputation from a subscriber milestone!`);
                }
                if (milestone.rewards.maxEnergyBonus) {
                    this.maxEnergy += milestone.rewards.maxEnergyBonus;
                    this.energy = Math.min(this.maxEnergy, this.energy + milestone.rewards.maxEnergyBonus);
                    this.callbacks.logEvent(`Max energy increased by ${milestone.rewards.maxEnergyBonus}! Current energy also boosted.`);
                }
                this.achievedMilestones.push(milestone.count);
                this.callbacks.updateStats();
            }
        });
    }
    
    changeReputation(amount) {
        this.reputation += amount;
        this.reputation = Math.max(0, Math.min(100, this.reputation));
        this.callbacks.updateStats();
        return this.reputation;
    }
    
    useEnergy(amount) {
        this.energy -= amount;
        if (this.energy < 0) this.energy = 0;
        this.callbacks.updateStats();
    }
    
    recoverEnergy(amount) {
        this.energy = Math.min(this.maxEnergy, this.energy + amount);
        this.callbacks.updateStats();
    }
    
    improveSkill(skillName, amount) {
        if (this.skills[skillName] !== undefined) {
            this.skills[skillName] += amount;
            return true;
        }
        return false;
    }
    
    canStream() {
        return this.energy > 5; // Reduced from 10 - allow streaming with lower energy
    }
    
    addToInventory(item) {
        this.inventory.push(item);
    }
    
    hasWon() {
        return (
            this.subscribers >= CONFIG.WIN_CONDITIONS.SUBSCRIBERS &&
            this.money >= CONFIG.WIN_CONDITIONS.MONEY &&
            this.reputation >= CONFIG.WIN_CONDITIONS.REPUTATION
        );
    }
    
    getSkillLevel(skill) {
        return this.skills[skill] || 1;
    }

    buyItem(itemId) {
        const item = SHOP_ITEMS.find(shopItem => shopItem.id === itemId);
        if (!item) {
            console.error(`Item with id ${itemId} not found in shop.`);
            return false;
        }

        // Check requirements
        if (item.requires) {
            const hasRequirements = item.requires.every(reqId => 
                this.purchasedItems.some(p => p.id === reqId)
            );
            if (!hasRequirements) {
                this.callbacks.showNotification(`Requirements not met! Need: ${item.requires.join(', ')}`);
                return false;
            }
        }

        // Calculate dynamic cost (for scaling items)
        let actualCost = item.cost;
        if (item.scaling && item.repeatable) {
            const purchaseCount = this.purchasedItems.filter(p => p.id === itemId).length;
            if (item.scaling.costMultiplier) {
                actualCost = Math.floor(item.cost * Math.pow(item.scaling.costMultiplier, purchaseCount));
            }
        }

        if (this.spendMoney(actualCost)) {
            // Apply item effects with new mechanics
            if (item.effect) {
                this.applyItemEffect(item, itemId);
            }

            // Track purchase for requirements and scaling
            this.addToInventory({ ...item, purchasePrice: actualCost });
            
            // Check and apply synergies
            this.checkSynergies();
            
            this.callbacks.updateStats();
            return true;
        } else {
            this.callbacks.showNotification(`Not enough money! Need $${actualCost}`);
            return false;
        }
    }

    applyItemEffect(item, itemId) {
        const effect = item.effect;
        
        // Basic effects
        if (effect.reputation) {
            this.changeReputation(effect.reputation);
            this.callbacks.logEvent(`Purchased ${item.name}. Reputation +${effect.reputation}.`);
        }
        
        if (effect.energy) {
            let energyGain = effect.energy;
            // Handle percentage bonus
            if (effect.energyPercentBonus) {
                energyGain += Math.floor(this.maxEnergy * effect.energyPercentBonus);
            }
            this.recoverEnergy(energyGain);
            this.callbacks.logEvent(`Purchased ${item.name}. Energy +${energyGain}.`);
        }
        
        if (effect.maxEnergyBonus) {
            this.maxEnergy += effect.maxEnergyBonus;
            this.energy = Math.min(this.maxEnergy, this.energy + effect.maxEnergyBonus);
            this.callbacks.logEvent(`Purchased ${item.name}. Max energy +${effect.maxEnergyBonus}.`);
        }

        // Advanced effects
        if (effect.energyEfficiency) {
            const purchaseCount = this.purchasedItems.filter(p => p.id === itemId).length;
            let effectValue = effect.energyEfficiency;
            
            // Apply diminishing returns if specified
            if (item.scaling && item.scaling.effectDiminishing && purchaseCount > 0) {
                effectValue = Math.pow(effectValue, Math.pow(item.scaling.effectDiminishing, purchaseCount));
            }
            
            this.energyEfficiency *= effectValue;
            this.energyEfficiency = Math.max(0.3, Math.min(1.5, this.energyEfficiency));
            this.callbacks.logEvent(`Purchased ${item.name}. Energy efficiency improved.`);
        }

        // Skill improvements
        if (effect.skill) {
            if (effect.skill === "all") {
                Object.keys(this.skills).forEach(skillName => {
                    this.improveSkill(skillName, effect.amount);
                });
                this.callbacks.logEvent(`Purchased ${item.name}. All skills +${effect.amount}!`);
            } else if (effect.skill === "random") {
                const skills = Object.keys(this.skills);
                const randomSkill = skills[Math.floor(Math.random() * skills.length)];
                let amount = effect.amount;
                if (typeof amount === "string" && amount.includes("-")) {
                    const [min, max] = amount.split("-").map(Number);
                    amount = min + Math.random() * (max - min);
                }
                this.improveSkill(randomSkill, amount);
                this.callbacks.logEvent(`Purchased ${item.name}. ${randomSkill} skill +${amount.toFixed(1)}!`);
            } else {
                this.improveSkill(effect.skill, effect.amount);
                this.callbacks.logEvent(`Purchased ${item.name}. ${effect.skill} skill +${effect.amount}.`);
            }
        }

        // Multiplier effects (store for later use)
        this.applyMultiplierEffects(effect, item.name);
        
        // Special instant effects
        if (effect.instantSubscribers) {
            let amount = effect.instantSubscribers;
            if (typeof amount === "string" && amount.includes("-")) {
                const [min, max] = amount.split("-").map(Number);
                amount = Math.floor(min + Math.random() * (max - min + 1));
                // Scale with reputation
                amount = Math.floor(amount * (0.5 + this.reputation / 100));
            }
            this.addSubscribers(amount);
            this.callbacks.logEvent(`Purchased ${item.name}. Instant +${amount} subscribers!`);
        }
    }

    applyMultiplierEffects(effect, itemName) {
        if (effect.moneyMultiplier) {
            this.moneyMultiplier = (this.moneyMultiplier || 1) * effect.moneyMultiplier;
            this.callbacks.logEvent(`${itemName}. Income multiplier now x${this.moneyMultiplier.toFixed(2)}.`);
        }
        
        if (effect.energyRecoveryBonus) {
            this.energyRecoveryBonus = (this.energyRecoveryBonus || 0) + effect.energyRecoveryBonus;
            this.callbacks.logEvent(`${itemName}. Energy recovery +${(effect.energyRecoveryBonus * 100).toFixed(0)}%.`);
        }

        // Store new effect types for stream mechanics
        if (effect.startingViewerMultiplier) {
            this.startingViewerMultiplier = (this.startingViewerMultiplier || 1) * effect.startingViewerMultiplier;
        }
        
        if (effect.viewerRetentionBonus) {
            this.viewerRetentionBonus = (this.viewerRetentionBonus || 0) + effect.viewerRetentionBonus;
        }
        
        if (effect.subscriberConversionBonus) {
            this.subscriberConversionBonus = (this.subscriberConversionBonus || 0) + effect.subscriberConversionBonus;
        }
        
        if (effect.donationRateMultiplier) {
            this.donationRateMultiplier = (this.donationRateMultiplier || 1) * effect.donationRateMultiplier;
        }

        // Store special flags and bonuses
        if (effect.negativeEventImmunity) this.negativeEventImmunity = true;
        if (effect.raidEventChance) this.raidEventChance = (this.raidEventChance || 0) + effect.raidEventChance;
        if (effect.passiveIncomePerMinute) this.passiveIncomePerMinute = (this.passiveIncomePerMinute || 0) + effect.passiveIncomePerMinute;
        if (effect.chatMomentumBonus) this.chatMomentumBonus = (this.chatMomentumBonus || 0) + effect.chatMomentumBonus;
        if (effect.completionBonusSubscribers) this.completionBonusSubscribers = effect.completionBonusSubscribers;
        if (effect.completionBonusAll) this.completionBonusAll = effect.completionBonusAll;
        if (effect.completionThreshold) this.completionThreshold = effect.completionThreshold;
    }

    checkSynergies() {
        // Import synergies (we'll need to import this)
        import('../data/shopItems.js').then(module => {
            const { SYNERGIES } = module;
            Object.values(SYNERGIES).forEach(synergy => {
                const hasAllRequirements = synergy.requirements.every(reqId => 
                    this.purchasedItems.some(p => p.id === reqId)
                );
                
                if (hasAllRequirements && !this.activeSynergies?.includes(synergy.name)) {
                    this.activeSynergies = this.activeSynergies || [];
                    this.activeSynergies.push(synergy.name);
                    this.applyMultiplierEffects(synergy.effect, `SYNERGY: ${synergy.name}`);
                    this.callbacks.showNotification(`🎉 SYNERGY UNLOCKED: ${synergy.name}!`);
                    this.callbacks.logEvent(`Synergy unlocked: ${synergy.description}`);
                }
            });
        });
    }
}
