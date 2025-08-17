import { CONFIG } from '../config/config.js';

export class StreamTypeSelector {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;
        this.selectedStreamType = localStorage.getItem('selectedStreamType') || 'gaming';
        this.streamTypeEmojis = {
            'gaming': '🎮',
            'justchatting': '💬',
            'music': '🎵',
            'artstream': '🎨',
            'coding': '💻'
        };
    }

    /**
     * Create stream type selection cards
     */
    createStreamTypeCards() {
        const cardsContainer = document.getElementById('stream-type-cards');
        if (!cardsContainer) return;
        
        cardsContainer.innerHTML = '';
        
        CONFIG.STREAM_TYPES.forEach(streamType => {
            const card = this.createStreamTypeCard(streamType);
            cardsContainer.appendChild(card);
        });
        
        this.updateQuickSwitchControls();
    }

    /**
     * Create individual stream type card
     */
    createStreamTypeCard(streamType) {
        const card = document.createElement('div');
        card.className = 'stream-type-card';
        
        // Check if unlocked
        const isUnlocked = streamType.unlocked || 
            (streamType.unlockAt && this.game.player.subscribers >= streamType.unlockAt);
        
        if (!isUnlocked) {
            card.classList.add('disabled');
        }
        
        // Set selected state
        if (streamType.id === this.selectedStreamType && isUnlocked) {
            card.classList.add('selected');
        }
        
        if (isUnlocked) {
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${streamType.name}</div>
                    <div class="card-emoji">${this.streamTypeEmojis[streamType.id] || '🎥'}</div>
                </div>
                <div class="card-stats">
                    <span>Cost: $${streamType.cost}</span>
                    <span>Energy: -${streamType.energyCost}/s</span>
                    <span>Base Viewers: ${streamType.baseViewers}</span>
                </div>
            `;
            
            // Add accessibility attributes
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Select ${streamType.name} stream type. Cost: $${streamType.cost}`);
            
            card.addEventListener('click', () => {
                this.selectStreamType(streamType.id);
            });
            
            // Add keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectStreamType(streamType.id);
                }
            });
        } else {
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${streamType.name}</div>
                    <div class="card-emoji">${this.streamTypeEmojis[streamType.id] || '🎥'}</div>
                </div>
                <div class="card-unlock-info">
                    Unlock at ${streamType.unlockAt} subscribers
                </div>
            `;
        }
        
        return card;
    }

    /**
     * Select a stream type
     */
    selectStreamType(streamTypeId) {
        // Remove selected class from all cards
        document.querySelectorAll('.stream-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Find and select the new card
        const cards = document.querySelectorAll('.stream-type-card');
        const streamTypeIndex = CONFIG.STREAM_TYPES.findIndex(type => type.id === streamTypeId);
        if (streamTypeIndex !== -1 && cards[streamTypeIndex]) {
            cards[streamTypeIndex].classList.add('selected');
        }
        
        this.selectedStreamType = streamTypeId;
        localStorage.setItem('selectedStreamType', streamTypeId);
        
        this.updateQuickSwitchControls();
    }

    /**
     * Update quick switch controls for live streaming
     */
    updateQuickSwitchControls() {
        const quickSwitchControls = document.getElementById('quick-switch-controls');
        const quickSwitchButtons = document.getElementById('quick-switch-buttons');
        
        if (!quickSwitchControls || !quickSwitchButtons) return;
        
        // Show quick switch only when streaming
        if (this.game.currentStream && this.game.currentStream.active) {
            quickSwitchControls.style.display = 'block';
            quickSwitchButtons.innerHTML = '';
            
            // Create buttons for other unlocked stream types
            CONFIG.STREAM_TYPES.forEach(streamType => {
                if (streamType.id === this.game.currentStream.type) return; // Skip current type
                
                const isUnlocked = streamType.unlocked || 
                    (streamType.unlockAt && this.game.player.subscribers >= streamType.unlockAt);
                
                if (isUnlocked) {
                    const btn = this.createQuickSwitchButton(streamType);
                    quickSwitchButtons.appendChild(btn);
                }
            });
        } else {
            quickSwitchControls.style.display = 'none';
        }
    }

    /**
     * Create quick switch button
     */
    createQuickSwitchButton(streamType) {
        const btn = document.createElement('button');
        btn.className = 'quick-switch-btn';
        btn.textContent = streamType.name;
        btn.onclick = () => this.switchStreamType(streamType.id);
        
        // Check if player can afford the switch
        const canAfford = this.game.player.money >= streamType.cost;
        const hasEnergy = this.game.player.energy >= 10; // Cost for switching
        
        if (!canAfford || !hasEnergy) {
            btn.disabled = true;
            btn.title = !canAfford ? `Need $${streamType.cost}` : 'Need more energy';
        }
        
        return btn;
    }

    /**
     * Switch stream type while live
     */
    switchStreamType(newStreamType) {
        if (!this.game.currentStream || !this.game.currentStream.active) return;
        
        const streamTypeConfig = CONFIG.STREAM_TYPES.find(type => type.id === newStreamType);
        if (!streamTypeConfig) return;
        
        // Check costs
        if (!this.game.player.spendMoney(streamTypeConfig.cost)) {
            this.ui.showNotification("Not enough money to switch stream type!", 'error');
            return;
        }
        
        if (this.game.player.energy < 10) {
            this.ui.showNotification("Not enough energy to switch stream type!", 'error');
            return;
        }
        
        // Add loading effect to the target card
        const cards = document.querySelectorAll('.stream-type-card');
        const streamTypeIndex = CONFIG.STREAM_TYPES.findIndex(type => type.id === newStreamType);
        if (streamTypeIndex !== -1 && cards[streamTypeIndex]) {
            cards[streamTypeIndex].classList.add('loading');
        }
        
        // Apply switch cost and change type
        this.game.player.useEnergy(10);
        this.game.currentStream.type = newStreamType;
        
        // Update display with delay for better UX
        setTimeout(() => {
            if (streamTypeIndex !== -1 && cards[streamTypeIndex]) {
                cards[streamTypeIndex].classList.remove('loading');
            }
            
            this.ui.updateStreamDisplay(newStreamType);
            this.selectStreamType(newStreamType);
            this.ui.logEvent(`Switched to ${streamTypeConfig.name} stream!`);
            this.ui.showNotification(`Switched to ${streamTypeConfig.name}!`, 'success');
            
            // Recalculate energy drain rate for new stream type
            this.game.currentStream.calculateEnergyDrainRate(streamTypeConfig);
            
            // Update quick switch controls
            this.updateQuickSwitchControls();
            
            // Add pulse effect to viewer count to indicate potential change
            this.ui.addPulseEffect('viewers-count');
        }, 300);
    }

    /**
     * Get selected stream type
     */
    getSelectedStreamType() {
        return this.selectedStreamType;
    }

    /**
     * Check for newly unlocked stream types
     */
    checkStreamUnlocks() {
        let hasNewUnlocks = false;
        
        CONFIG.STREAM_TYPES.forEach(streamType => {
            if (streamType.unlockAt && !streamType.unlocked && 
                this.game.player.subscribers >= streamType.unlockAt) {
                streamType.unlocked = true;
                this.ui.showNotification(`${streamType.name} streams unlocked!`);
                hasNewUnlocks = true;
            }
        });
        
        if (hasNewUnlocks) {
            this.createStreamTypeCards(); // Refresh cards
        }
    }
}