/**
 * Streamer Simulator 2 - Pi Edition
 * Main entry point using ES modules
 */

import { Game } from './core/game.js';

// Create global game instance for compatibility with existing code
let GAME;

// Initialize the game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    try {
        GAME = new Game();
        GAME.init();
        
        // Make GAME available globally for dev console debugging
        if (typeof window !== 'undefined') {
            window.GAME = GAME;
        }
        
        console.log('🎮 Streamer Simulator 2 - Pi Edition loaded successfully!');
        console.log('💡 Dev tip: Use GAME in console for debugging');
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        
        // Show user-friendly error
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: #ff4444; color: white; padding: 20px; border-radius: 8px; 
                        font-family: Arial, sans-serif; text-align: center; z-index: 9999;">
                <h3>🚫 Game Failed to Load</h3>
                <p>There was an error starting the game.</p>
                <p style="font-size: 12px; opacity: 0.8;">Check console for details</p>
                <button onclick="location.reload()" 
                        style="margin-top: 10px; padding: 8px 16px; background: white; 
                               color: #ff4444; border: none; border-radius: 4px; cursor: pointer;">
                    Reload Page
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
});

// Export for potential use by other modules
export { GAME };