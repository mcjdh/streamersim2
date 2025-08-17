import { CONFIG } from '../config/config.js';
import { ThemeService } from './ThemeService.js';
import { StatsPanel } from './StatsPanel.js';
import { StreamTypeSelector } from './StreamTypeSelector.js';
import { Notifications } from './Notifications.js';
import { ShopView } from './ShopView.js';

export class ModularUI {
    constructor(game) {
        this.game = game;
        
        // Initialize specialized modules
        this.themeService = new ThemeService();
        this.statsPanel = new StatsPanel(game);
        this.notifications = new Notifications();
        this.streamTypeSelector = new StreamTypeSelector(game, this);
        this.shopView = new ShopView(game, this.notifications);
    }

    /**
     * Initialize the UI system
     */
    init() {
        // Show tutorial for new players
        if (CONFIG.SHOW_TUTORIAL && !localStorage.getItem(CONFIG.TUTORIAL_SHOWN_KEY)) {
            this.showTutorial();
        }

        // Initialize UI components
        this.initEventListeners();
        this.statsPanel.createEnergyBar();
        this.streamTypeSelector.createStreamTypeCards();
        this.statsPanel.updateStats();
        this.shopView.createShopItems();
        this.initKeyboardControls();
    }

    /**
     * Initialize main UI event listeners
     */
    initEventListeners() {
        // Stream controls
        document.getElementById('start-stream')?.addEventListener('click', () => {
            const selectedType = this.streamTypeSelector.getSelectedStreamType();
            if (selectedType) {
                this.game.startStream(selectedType);
            } else {
                this.notifications.warning("Select a stream type first!");
            }
        });

        document.getElementById('end-stream')?.addEventListener('click', () => {
            this.game.endStream();
        });

        document.getElementById('active-rest')?.addEventListener('click', () => {
            this.game.performActiveRest();
        });

        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            const newTheme = this.themeService.toggle();
            this.notifications.show(`Switched to ${newTheme} mode`);
        });
    }

    /**
     * Initialize keyboard controls
     */
    initKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Prevent shortcuts during tutorial or if input is focused
            if (document.querySelector('.tutorial-overlay') || 
                document.activeElement.tagName === 'INPUT') {
                return;
            }

            switch(e.key.toLowerCase()) {
                case ' ': // Space - Start/End stream
                    e.preventDefault();
                    if (this.game.currentStream.active) {
                        document.getElementById('end-stream').click();
                    } else {
                        document.getElementById('start-stream').click();
                    }
                    break;
                case 'r': // R - Rest
                    e.preventDefault();
                    document.getElementById('active-rest').click();
                    break;
                case '1': // Stream type shortcuts
                case '2':
                case '3':
                case '4':
                case '5':
                    e.preventDefault();
                    const streamIndex = parseInt(e.key) - 1;
                    const streamTypes = CONFIG.STREAM_TYPES;
                    if (streamIndex < streamTypes.length) {
                        const streamType = streamTypes[streamIndex];
                        const isUnlocked = streamType.unlocked || 
                            (streamType.unlockAt && this.game.player.subscribers >= streamType.unlockAt);
                        if (isUnlocked) {
                            this.streamTypeSelector.selectStreamType(streamType.id);
                        }
                    }
                    break;
                case 'escape': // ESC - Close tutorial/notifications
                    e.preventDefault();
                    const tutorial = document.querySelector('.tutorial-overlay');
                    if (tutorial) {
                        tutorial.querySelector('button').click();
                    } else {
                        this.notifications.clearAll();
                    }
                    break;
                case 's': // S - Save game (Ctrl+S)
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.game.saveManager.saveGame();
                    }
                    break;
                case 'l': // L - Load game (Ctrl+L)
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.game.saveManager.loadGame();
                    }
                    break;
            }
        });
    }

    // ====== Delegation methods to modules ======

    /**
     * Update stats display
     */
    updateStats() {
        this.statsPanel.updateStats();
        this.streamTypeSelector.checkStreamUnlocks();
        this.shopView.updateShop();
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (type === 'info') {
            this.notifications.show(message);
        } else {
            this.notifications.showWithType(message, type);
        }
    }

    /**
     * Create stream type cards
     */
    createStreamTypeCards() {
        this.streamTypeSelector.createStreamTypeCards();
    }

    /**
     * Create shop items
     */
    createShopItems() {
        this.shopView.createShopItems();
    }

    /**
     * Get selected stream type
     */
    get selectedStreamType() {
        return this.streamTypeSelector.getSelectedStreamType();
    }

    /**
     * Set selected stream type
     */
    set selectedStreamType(value) {
        this.streamTypeSelector.selectStreamType(value);
    }

    // ====== Stream-specific UI methods ======

    /**
     * Update stream display
     */
    updateStreamDisplay(streamType) {
        const streamVideoFeed = document.getElementById('stream-video-feed');
        if (!streamVideoFeed) return;

        if (!streamType) {
            streamVideoFeed.innerHTML = '<div class="offline-message">Stream Offline</div>';
            document.getElementById('chat-log').innerHTML = '';
            return;
        }

        const streamContent = {
            'gaming': '<div class="stream-gaming">🎮 Gaming Stream</div>',
            'justchatting': '<div class="stream-chat">💬 Just Chatting</div>',
            'music': '<div class="stream-music">🎵 Music Stream</div>',
            'artstream': '<div class="stream-art">🎨 Art Stream</div>',
            'coding': '<div class="stream-coding">💻 Coding Stream</div>'
        };

        streamVideoFeed.innerHTML = streamContent[streamType] || '<div class="stream-generic">🎥 Live Stream</div>';
    }

    /**
     * Toggle stream controls
     */
    toggleStreamControls(isStreaming) {
        const startBtn = document.getElementById('start-stream');
        const endBtn = document.getElementById('end-stream');
        const restBtn = document.getElementById('active-rest');

        if (startBtn) startBtn.disabled = isStreaming;
        if (endBtn) endBtn.disabled = !isStreaming;
        if (restBtn) restBtn.disabled = isStreaming;

        // Update stream type cards
        const streamTypeCards = document.querySelectorAll('.stream-type-card:not(.disabled)');
        streamTypeCards.forEach(card => {
            if (isStreaming) {
                card.style.pointerEvents = 'none';
                card.style.opacity = '0.7';
            } else {
                card.style.pointerEvents = 'auto';
                card.style.opacity = '1';
            }
        });

        // Update quick switch controls
        this.streamTypeSelector.updateQuickSwitchControls();
    }

    /**
     * Update viewer count display
     */
    updateViewerCount(count) {
        const viewerElement = document.getElementById('viewers-count');
        if (viewerElement) {
            viewerElement.textContent = `Viewers: ${count}`;
        }
    }

    /**
     * Update stream timer display
     */
    updateStreamTimer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedTime = 
            `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        const timerElement = document.getElementById('stream-timer');
        if (timerElement) {
            timerElement.textContent = formattedTime;

            // Add visual indicator when approaching target duration
            const targetReached = seconds >= this.game.currentStream.targetDuration;
            timerElement.style.color = targetReached ? '#00ff00' : '#ffffff';
        }
    }

    /**
     * Highlight end stream button
     */
    highlightEndStream() {
        const endStreamButton = document.getElementById('end-stream');
        if (endStreamButton) {
            endStreamButton.classList.add('highlight');
            setTimeout(() => {
                endStreamButton.classList.remove('highlight');
            }, 500);
        }
    }

    // ====== Event and chat methods ======

    /**
     * Log an event
     */
    logEvent(message) {
        const eventsLog = document.getElementById('events-log');
        if (!eventsLog) return;

        const entry = document.createElement('div');
        entry.className = 'event-entry';

        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        entry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
        eventsLog.appendChild(entry);

        // Limit log entries
        while (eventsLog.children.length > CONFIG.LOG_MAX_ENTRIES) {
            eventsLog.removeChild(eventsLog.firstChild);
        }

        // Auto-scroll to bottom
        eventsLog.scrollTop = eventsLog.scrollHeight;
    }

    /**
     * Add chat message
     */
    addChatMessage(username, messageText, userColor = '#ffffff') {
        const chatLog = document.getElementById('chat-log');
        if (!chatLog) return;

        const messageEntry = document.createElement('div');
        messageEntry.className = 'chat-message';

        const userSpan = document.createElement('span');
        userSpan.className = 'chat-username';
        // Use innerHTML to properly render HTML elements like subscriber badges
        userSpan.innerHTML = `${username}: `;
        userSpan.style.color = userColor;
        userSpan.style.fontWeight = 'bold';

        const textSpan = document.createElement('span');
        textSpan.className = 'chat-text';
        // Use innerHTML to properly render HTML elements like emotes
        textSpan.innerHTML = messageText;

        const scrollThreshold = 20;
        const isScrolledNearBottom = chatLog.scrollTop + chatLog.clientHeight >= chatLog.scrollHeight - scrollThreshold;

        messageEntry.appendChild(userSpan);
        messageEntry.appendChild(textSpan);
        chatLog.appendChild(messageEntry);

        // Limit chat messages
        while (chatLog.children.length > CONFIG.CHAT_MAX_ENTRIES) {
            chatLog.removeChild(chatLog.firstChild);
        }

        // Auto-scroll if near bottom
        if (isScrolledNearBottom) {
            chatLog.scrollTop = chatLog.scrollHeight - chatLog.clientHeight;
        }
    }

    /**
     * Show donation animation
     */
    showDonation(amount) {
        const streamVideoFeed = document.getElementById('stream-video-feed');
        if (!streamVideoFeed) return;

        const donation = document.createElement('div');
        donation.className = 'donation-animation';
        donation.textContent = `$${amount}`;
        donation.style.cssText = `
            position: absolute;
            left: ${Math.random() * 60 + 20}%;
            top: ${Math.random() * 60 + 20}%;
            color: #ffcc00;
            font-weight: bold;
            font-size: 24px;
            text-shadow: 0 0 5px rgba(0,0,0,0.8);
            animation: donationFloat 2s forwards;
        `;

        streamVideoFeed.appendChild(donation);

        setTimeout(() => {
            donation.remove();
        }, 2000);

        this.logEvent(`Received a $${amount} donation!`);
        this.game.chatManager.postDonationReaction("GenerousViewer", amount);
    }

    /**
     * Add pulse effect to element
     */
    addPulseEffect(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('pulse');
            setTimeout(() => {
                element.classList.remove('pulse');
            }, 3000);
        }
    }

    // ====== Tutorial and victory screen ======

    /**
     * Show tutorial
     */
    showTutorial() {
        const tutorialOverlay = document.createElement('div');
        tutorialOverlay.className = 'tutorial-overlay';

        const tutorialContent = document.createElement('div');
        tutorialContent.className = 'tutorial-content';
        tutorialContent.innerHTML = `
            <h2>Streamer Sim 2 - Pi Edition</h2>
            <p><strong>Goal:</strong> 1,000 subs, $5,000, 90 reputation</p>
            <p><strong>Controls:</strong></p>
            <p>• Click stream type → Start Stream</p>
            <p>• Switch types while live for variety</p>
            <p>• Rest when energy is low</p>
            <p>• Buy upgrades to grow faster</p>
            <p><strong>Keyboard shortcuts:</strong></p>
            <p>Space: Start/End | R: Rest | 1-5: Stream types</p>
            <p>Ctrl+S: Save | Ctrl+L: Load | ESC: Close dialogs</p>
            <button id="tutorial-close">Start Streaming!</button>
        `;

        tutorialOverlay.appendChild(tutorialContent);
        document.body.appendChild(tutorialOverlay);

        document.getElementById('tutorial-close').addEventListener('click', () => {
            document.body.removeChild(tutorialOverlay);
            localStorage.setItem(CONFIG.TUTORIAL_SHOWN_KEY, 'true');
        });
    }

    /**
     * Show victory screen
     */
    showVictoryScreen() {
        const victoryOverlay = document.createElement('div');
        victoryOverlay.id = 'victory-overlay';
        victoryOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.8); display: flex; flex-direction: column;
            align-items: center; justify-content: center; color: #ffffff; z-index: 100;
        `;

        const stats = this.game.player.stats;
        victoryOverlay.innerHTML = `
            <div>
                <h1 style="color: #9147ff; font-size: 48px; margin-bottom: 20px;">CONGRATULATIONS!</h1>
                <h2>You've become a successful streamer!</h2>
                <p style="margin: 20px 0;">Final stats:</p>
                <ul style="list-style: none; padding: 0; text-align: center; margin-bottom: 20px;">
                    <li>Subscribers: ${this.game.player.subscribers}</li>
                    <li>Money: $${this.game.player.money}</li>
                    <li>Reputation: ${this.game.player.reputation}</li>
                    <li>Streams completed: ${stats.streamsCompleted}</li>
                    <li>Total streaming time: ${Math.floor(stats.totalStreamTime / 60)} minutes</li>
                    <li>Peak viewers: ${stats.maxViewers}</li>
                </ul>
                <button id="play-again" style="margin-top: 20px;">Play Again</button>
            </div>
        `;

        document.body.appendChild(victoryOverlay);

        document.getElementById('play-again').addEventListener('click', () => {
            document.body.removeChild(victoryOverlay);
            this.game.reset();
        });
    }
}