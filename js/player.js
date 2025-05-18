class Player {
    constructor() {
        this.money = 0;
        this.subscribers = 0;
        this.reputation = 0;
        this.energy = 100;
        this.maxEnergy = CONFIG.STARTING_ENERGY;
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
        UI.updateStats();
        return amount;
    }
    
    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            UI.updateStats();
            return true;
        }
        return false;
    }
    
    addSubscribers(amount) {
        if (amount <= 0) return 0;
        const oldSubscribers = this.subscribers;
        this.subscribers += amount;
        this.checkSubscriberMilestones(oldSubscribers);
        UI.updateStats();
        return amount;
    }
    
    removeSubscribers(amount) {
        if (amount <= 0) return 0;
        const lostSubs = Math.min(this.subscribers, amount); // Cannot lose more than current subs
        this.subscribers -= lostSubs;
        if (this.subscribers < 0) this.subscribers = 0; // Ensure subs don't go negative
        UI.updateStats();
        return lostSubs;
    }
    
    checkSubscriberMilestones(oldSubscribers) {
        CONFIG.SUBSCRIBER_MILESTONES.forEach(milestone => {
            if (this.subscribers >= milestone.count && oldSubscribers < milestone.count && !this.achievedMilestones.includes(milestone.count)) {
                UI.showNotification(`MILESTONE: ${milestone.description}`);
                if (milestone.rewards.money) {
                    this.addMoney(milestone.rewards.money);
                    UI.logEvent(`Gained $${milestone.rewards.money} from a subscriber milestone!`);
                }
                if (milestone.rewards.reputation) {
                    this.changeReputation(milestone.rewards.reputation);
                    UI.logEvent(`Gained ${milestone.rewards.reputation} reputation from a subscriber milestone!`);
                }
                if (milestone.rewards.maxEnergyBonus) {
                    this.maxEnergy += milestone.rewards.maxEnergyBonus;
                    this.energy = Math.min(this.maxEnergy, this.energy + milestone.rewards.maxEnergyBonus);
                    UI.logEvent(`Max energy increased by ${milestone.rewards.maxEnergyBonus}! Current energy also boosted.`);
                }
                this.achievedMilestones.push(milestone.count);
                UI.updateStats();
            }
        });
    }
    
    changeReputation(amount) {
        this.reputation += amount;
        this.reputation = Math.max(0, Math.min(100, this.reputation));
        UI.updateStats();
        return this.reputation;
    }
    
    useEnergy(amount) {
        this.energy -= amount;
        if (this.energy < 0) this.energy = 0;
        UI.updateStats();
    }
    
    recoverEnergy(amount) {
        this.energy = Math.min(this.maxEnergy, this.energy + amount);
        UI.updateStats();
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
        const item = CONFIG.SHOP_ITEMS.find(shopItem => shopItem.id === itemId);
        if (!item) {
            console.error(`Item with id ${itemId} not found in shop.`);
            return false;
        }

        if (this.spendMoney(item.cost)) {
            // Apply item effect
            if (item.effect) {
                if (item.effect.reputation) {
                    this.changeReputation(item.effect.reputation);
                    UI.logEvent(`Purchased ${item.name}. Reputation increased by ${item.effect.reputation}.`);
                }
                if (item.effect.skill && item.effect.amount) {
                    this.improveSkill(item.effect.skill, item.effect.amount);
                    UI.logEvent(`Purchased ${item.name}. ${item.effect.skill} skill increased by ${item.effect.amount}.`);
                }
                if (item.effect.energy) {
                    this.recoverEnergy(item.effect.energy);
                    UI.logEvent(`Purchased ${item.name}. Energy recovered by ${item.effect.energy}.`);
                }
            }

            this.addToInventory(item); // Add item to inventory
            // UI.updateShop(); // We'll need a way to indicate item is bought or remove it, for now it's re-buyable
            UI.updateStats(); // spendMoney and effect applications already call this, but good to be sure.
            return true;
        } else {
            UI.showNotification("Not enough money!");
            return false;
        }
    }
}
