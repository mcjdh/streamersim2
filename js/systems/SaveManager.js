import { CONFIG } from '../config/config.js';

export class SaveManager {
    constructor(game) {
        this.game = game;
        this.saveKey = 'streamerSim2_save';
        this.autoSaveTimer = null;
    }

    /**
     * Serialize complete game state
     */
    serializeGameState() {
        return {
            player: {
                subscribers: this.game.player.subscribers,
                money: this.game.player.money,
                reputation: this.game.player.reputation,
                energy: this.game.player.energy,
                maxEnergy: this.game.player.maxEnergy,
                purchasedItems: this.game.player.purchasedItems || [],
                stats: this.game.player.stats,
                skills: this.game.player.skills,
                achievedMilestones: this.game.player.achievedMilestones
            },
            streamTypes: CONFIG.STREAM_TYPES.map(type => ({
                id: type.id,
                unlocked: type.unlocked
            })),
            selectedStreamType: this.game.ui.selectedStreamType,
            timestamp: Date.now(),
            version: '2.0' // For future compatibility
        };
    }

    /**
     * Deserialize and restore game state
     */
    deserializeGameState(gameState) {
        // Restore player state with fallbacks
        this.game.player.subscribers = gameState.player.subscribers || 0;
        this.game.player.money = gameState.player.money || CONFIG.STARTING_MONEY;
        this.game.player.reputation = gameState.player.reputation || CONFIG.STARTING_REPUTATION;
        this.game.player.energy = gameState.player.energy || CONFIG.STARTING_ENERGY;
        this.game.player.maxEnergy = gameState.player.maxEnergy || CONFIG.STARTING_ENERGY;
        this.game.player.purchasedItems = gameState.player.purchasedItems || [];
        this.game.player.stats = gameState.player.stats || {
            totalStreamTime: 0,
            streamsCompleted: 0,
            maxViewers: 0,
            totalEvents: 0,
            totalDonations: 0
        };
        this.game.player.skills = gameState.player.skills || {
            gaming: 1,
            talking: 1,
            technical: 1,
            creativity: 1
        };
        this.game.player.achievedMilestones = gameState.player.achievedMilestones || [];

        // Restore stream type unlocks
        if (gameState.streamTypes) {
            gameState.streamTypes.forEach(savedType => {
                const configType = CONFIG.STREAM_TYPES.find(t => t.id === savedType.id);
                if (configType) {
                    configType.unlocked = savedType.unlocked;
                }
            });
        }

        // Restore UI state
        this.game.ui.selectedStreamType = gameState.selectedStreamType || 'gaming';
    }

    /**
     * Manual save game
     */
    saveGame() {
        try {
            const gameState = this.serializeGameState();
            gameState.isManualSave = true;
            
            localStorage.setItem(this.saveKey, JSON.stringify(gameState));
            this.game.ui.showNotification('Game saved!', 'success');
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            this.game.ui.showNotification('Save failed!', 'error');
            return false;
        }
    }

    /**
     * Load game from storage
     */
    loadGame() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) {
                this.game.ui.showNotification('No save file found!', 'warning');
                return false;
            }

            const gameState = JSON.parse(saveData);
            
            // Validate save data
            if (!gameState.player || !gameState.timestamp) {
                throw new Error('Invalid save data format');
            }

            this.deserializeGameState(gameState);

            // Update UI to reflect loaded state
            this.game.ui.updateStats();
            this.game.ui.createStreamTypeCards();
            this.game.ui.createShopItems();

            const saveAge = Math.floor((Date.now() - gameState.timestamp) / 1000 / 60);
            const saveType = gameState.isManualSave ? 'Manual' : 'Auto';
            this.game.ui.showNotification(`${saveType} save loaded! (${saveAge}m ago)`, 'success');
            return true;
        } catch (error) {
            console.error('Load failed:', error);
            this.game.ui.showNotification('Load failed! Save may be corrupted.', 'error');
            return false;
        }
    }

    /**
     * Auto-save (silent)
     */
    autoSave() {
        try {
            const gameState = this.serializeGameState();
            gameState.isAutoSave = true;
            
            localStorage.setItem(this.saveKey, JSON.stringify(gameState));
            console.log('Auto-save completed');
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    /**
     * Start auto-save timer
     */
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        this.autoSaveTimer = setInterval(() => {
            if (this.game.isActive) {
                this.autoSave();
            }
        }, CONFIG.AUTO_SAVE_INTERVAL * 1000);
    }

    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Check if save exists
     */
    hasSaveData() {
        return !!localStorage.getItem(this.saveKey);
    }

    /**
     * Get save info without loading
     */
    getSaveInfo() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) return null;

            const gameState = JSON.parse(saveData);
            return {
                timestamp: gameState.timestamp,
                age: Math.floor((Date.now() - gameState.timestamp) / 1000 / 60),
                isManualSave: gameState.isManualSave,
                version: gameState.version || '1.0',
                subscribers: gameState.player?.subscribers || 0,
                money: gameState.player?.money || 0
            };
        } catch (error) {
            console.error('Failed to read save info:', error);
            return null;
        }
    }

    /**
     * Delete save data
     */
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            this.game.ui.showNotification('Save deleted!', 'warning');
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            this.game.ui.showNotification('Failed to delete save!', 'error');
            return false;
        }
    }
}