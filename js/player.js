class Player {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.money = CONFIG.STARTING_MONEY;
        this.subscribers = CONFIG.STARTING_SUBSCRIBERS;
        this.reputation = CONFIG.STARTING_REPUTATION;
        this.energy = CONFIG.STARTING_ENERGY;
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
        this.subscribers += amount;
        UI.updateStats();
        return amount;
    }
    
    changeReputation(amount) {
        this.reputation = Math.max(0, Math.min(100, this.reputation + amount));
        UI.updateStats();
        return this.reputation;
    }
    
    useEnergy(amount) {
        this.energy = Math.max(0, this.energy - amount);
        UI.updateStats();
        return this.energy;
    }
    
    recoverEnergy(amount) {
        this.energy = Math.min(100, this.energy + amount);
        UI.updateStats();
        return this.energy;
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
}
