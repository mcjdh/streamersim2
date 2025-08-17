export class StatsPanel {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.initElements();
    }

    /**
     * Cache DOM elements for performance
     */
    initElements() {
        this.elements = {
            subscribers: document.getElementById('subscribers'),
            money: document.getElementById('money'),
            reputation: document.getElementById('reputation'),
            energy: document.getElementById('energy'),
            energyFill: document.querySelector('.energy-fill')
        };
    }

    /**
     * Update all stats display
     */
    updateStats() {
        const player = this.game.player;
        
        // Update text values
        if (this.elements.subscribers) {
            this.elements.subscribers.textContent = player.subscribers;
        }
        if (this.elements.money) {
            this.elements.money.textContent = player.money;
        }
        if (this.elements.reputation) {
            this.elements.reputation.textContent = player.reputation;
        }
        if (this.elements.energy) {
            const energyPercent = Math.floor((player.energy / player.maxEnergy) * 100);
            this.elements.energy.textContent = energyPercent;
        }

        // Update energy bar
        this.updateEnergyBar();
    }

    /**
     * Update energy bar visualization
     */
    updateEnergyBar() {
        if (!this.elements.energyFill) return;

        const player = this.game.player;
        const energyPercent = (player.energy / player.maxEnergy) * 100;
        
        this.elements.energyFill.style.width = `${energyPercent}%`;
        
        // Change color based on energy level
        this.elements.energyFill.classList.remove('low', 'medium');
        if (energyPercent < 30) {
            this.elements.energyFill.classList.add('low');
        } else if (energyPercent < 60) {
            this.elements.energyFill.classList.add('medium');
        }
    }

    /**
     * Create energy bar if it doesn't exist
     */
    createEnergyBar() {
        const energyStatItem = document.querySelector('#energy').parentElement;
        if (!energyStatItem) return;

        const existingBar = energyStatItem.querySelector('.energy-bar');
        if (existingBar) return; // Already exists

        const energyBar = document.createElement('div');
        energyBar.className = 'energy-bar';
        energyBar.innerHTML = '<div class="energy-fill"></div>';
        energyStatItem.appendChild(energyBar);

        // Update cached element
        this.elements.energyFill = energyBar.querySelector('.energy-fill');
    }

    /**
     * Add pulse effect to a stat element
     */
    addPulseEffect(statName) {
        const element = this.elements[statName];
        if (element) {
            element.classList.add('pulse');
            setTimeout(() => {
                element.classList.remove('pulse');
            }, 3000);
        }
    }

    /**
     * Highlight stat changes with animation
     */
    highlightChange(statName, oldValue, newValue) {
        const element = this.elements[statName];
        if (!element) return;

        const isIncrease = newValue > oldValue;
        const changeClass = isIncrease ? 'stat-increase' : 'stat-decrease';
        
        element.classList.add(changeClass);
        setTimeout(() => {
            element.classList.remove(changeClass);
        }, 1000);
    }

    /**
     * Get formatted stats for display
     */
    getFormattedStats() {
        const player = this.game.player;
        return {
            subscribers: player.subscribers.toLocaleString(),
            money: `$${player.money.toLocaleString()}`,
            reputation: `${player.reputation}/100`,
            energy: `${Math.floor(player.energy)}/${player.maxEnergy}`,
            energyPercent: Math.round((player.energy / player.maxEnergy) * 100)
        };
    }
}