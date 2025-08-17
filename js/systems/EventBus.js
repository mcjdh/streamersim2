/**
 * Simple Event Bus for decoupled communication
 * Allows UI components to communicate with systems without direct references
 */
export class EventBus {
    constructor() {
        this.events = new Map();
        this.debugMode = false;
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event to listen for
     * @param {Function} callback - Function to call when event is emitted
     * @param {Object} context - Optional context for the callback
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback, context = null) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }

        const listener = { callback, context };
        this.events.get(eventName).push(listener);

        if (this.debugMode) {
            console.log(`[EventBus] Subscribed to: ${eventName}`);
        }

        // Return unsubscribe function
        return () => this.off(eventName, callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - The callback to remove
     */
    off(eventName, callback) {
        if (!this.events.has(eventName)) return;

        const listeners = this.events.get(eventName);
        const index = listeners.findIndex(listener => listener.callback === callback);
        
        if (index !== -1) {
            listeners.splice(index, 1);
            
            if (this.debugMode) {
                console.log(`[EventBus] Unsubscribed from: ${eventName}`);
            }

            // Clean up empty event arrays
            if (listeners.length === 0) {
                this.events.delete(eventName);
            }
        }
    }

    /**
     * Emit an event to all subscribers
     * @param {string} eventName - Name of the event to emit
     * @param {*} data - Data to pass to event handlers
     */
    emit(eventName, data = null) {
        if (!this.events.has(eventName)) {
            if (this.debugMode) {
                console.log(`[EventBus] No listeners for: ${eventName}`);
            }
            return;
        }

        const listeners = this.events.get(eventName);
        
        if (this.debugMode) {
            console.log(`[EventBus] Emitting: ${eventName}`, data);
        }

        // Call all listeners
        listeners.forEach(({ callback, context }) => {
            try {
                if (context) {
                    callback.call(context, data);
                } else {
                    callback(data);
                }
            } catch (error) {
                console.error(`[EventBus] Error in event handler for ${eventName}:`, error);
            }
        });
    }

    /**
     * Emit an event once and then remove all listeners
     * @param {string} eventName - Name of the event
     * @param {*} data - Data to pass to handlers
     */
    emitOnce(eventName, data = null) {
        this.emit(eventName, data);
        this.events.delete(eventName);
    }

    /**
     * Remove all listeners for an event
     * @param {string} eventName - Name of the event to clear
     */
    clear(eventName) {
        this.events.delete(eventName);
        
        if (this.debugMode) {
            console.log(`[EventBus] Cleared all listeners for: ${eventName}`);
        }
    }

    /**
     * Remove all listeners for all events
     */
    clearAll() {
        this.events.clear();
        
        if (this.debugMode) {
            console.log('[EventBus] Cleared all events');
        }
    }

    /**
     * Get list of all registered events
     * @returns {Array<string>} Array of event names
     */
    getEvents() {
        return Array.from(this.events.keys());
    }

    /**
     * Get number of listeners for an event
     * @param {string} eventName - Name of the event
     * @returns {number} Number of listeners
     */
    getListenerCount(eventName) {
        return this.events.has(eventName) ? this.events.get(eventName).length : 0;
    }

    /**
     * Enable or disable debug logging
     * @param {boolean} enabled - Whether to enable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
}

/**
 * Common game events for better organization
 */
export const GAME_EVENTS = {
    // Player events
    PLAYER_MONEY_CHANGED: 'player:money:changed',
    PLAYER_ENERGY_CHANGED: 'player:energy:changed',
    PLAYER_SUBSCRIBERS_CHANGED: 'player:subscribers:changed',
    PLAYER_REPUTATION_CHANGED: 'player:reputation:changed',
    PLAYER_SKILL_IMPROVED: 'player:skill:improved',
    PLAYER_MILESTONE_REACHED: 'player:milestone:reached',

    // Stream events
    STREAM_STARTED: 'stream:started',
    STREAM_ENDED: 'stream:ended',
    STREAM_TYPE_CHANGED: 'stream:type:changed',
    STREAM_VIEWERS_CHANGED: 'stream:viewers:changed',

    // Shop events
    ITEM_PURCHASED: 'shop:item:purchased',
    SHOP_UPDATED: 'shop:updated',

    // UI events
    NOTIFICATION_SHOW: 'ui:notification:show',
    THEME_CHANGED: 'ui:theme:changed',
    STATS_UPDATE_REQUESTED: 'ui:stats:update',

    // System events
    GAME_SAVED: 'system:game:saved',
    GAME_LOADED: 'system:game:loaded',
    GAME_RESET: 'system:game:reset'
};

// Create a global event bus instance
export const gameEventBus = new EventBus();