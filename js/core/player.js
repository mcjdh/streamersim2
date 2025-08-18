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
        return this.energy > 10; // Minimum energy required to stream
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

        if (this.spendMoney(item.cost)) {
            // Apply item effect
            if (item.effect) {
                if (item.effect.reputation) {
                    this.changeReputation(item.effect.reputation);
                    this.callbacks.logEvent(`Purchased ${item.name}. Reputation increased by ${item.effect.reputation}.`);
                }
                if (item.effect.skill && item.effect.amount) {
                    this.improveSkill(item.effect.skill, item.effect.amount);
                    this.callbacks.logEvent(`Purchased ${item.name}. ${item.effect.skill} skill increased by ${item.effect.amount}.`);
                }
                if (item.effect.energy) {
                    this.recoverEnergy(item.effect.energy);
                    this.callbacks.logEvent(`Purchased ${item.name}. Energy recovered by ${item.effect.energy}.`);
                }
                if (item.effect.maxEnergyBonus) {
                    this.maxEnergy += item.effect.maxEnergyBonus;
                    this.energy = Math.min(this.maxEnergy, this.energy + item.effect.maxEnergyBonus);
                    this.callbacks.logEvent(`Purchased ${item.name}. Max energy increased by ${item.effect.maxEnergyBonus}.`);
                }
                if (item.effect.energyEfficiency) {
                    // Multiplicative stacking: multiply current efficiency by provided factor
                    this.energyEfficiency *= item.effect.energyEfficiency;
                    // Clamp to reasonable bounds
                    this.energyEfficiency = Math.max(0.5, Math.min(1.5, this.energyEfficiency));
                    this.callbacks.logEvent(`Purchased ${item.name}. Energy efficiency improved.`);
                }
                if (item.effect.moneyMultiplier) {
                    // Store a passive income multiplier for rewards calculation
                    this.moneyMultiplier = (this.moneyMultiplier || 1) * item.effect.moneyMultiplier;
                    this.callbacks.logEvent(`Purchased ${item.name}. Income multiplier now x${this.moneyMultiplier.toFixed(2)}.`);
                }
            }

            this.addToInventory(item); // Add item to inventory
            // this.callbacks.updateShop(); // We'll need a way to indicate item is bought or remove it, for now it's re-buyable
            this.callbacks.updateStats(); // spendMoney and effect applications already call this, but good to be sure.
            return true;
        } else {
            this.callbacks.showNotification("Not enough money!");
            return false;
        }
    }
}
