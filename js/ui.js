class UI {    static init() {
        // Show tutorial for new players
        if (CONFIG.SHOW_TUTORIAL && !localStorage.getItem(CONFIG.TUTORIAL_SHOWN_KEY)) {
            this.showTutorial();
        }
        
        this.selectedStreamType = localStorage.getItem('selectedStreamType') || 'gaming';
        
        // Initialize dark mode
        this.initDarkMode();
        
        // Initialize UI event listeners
        document.getElementById('start-stream').addEventListener('click', () => {
            if (this.selectedStreamType) {
                GAME.startStream(this.selectedStreamType);
            } else {
                this.showNotification("Select a stream type first!");
            }
        });
        
        document.getElementById('end-stream').addEventListener('click', () => {
            GAME.endStream();
        });
        
        document.getElementById('active-rest').addEventListener('click', () => {
            GAME.performActiveRest(); // Call the new game method
        });
        
        // Dark mode toggle event listener
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });
        
        // Create stream type options
        this.createStreamTypeCards();
        
        // Initial stats update
        this.updateStats();
        this.createShopItems();
        
        // Add energy bar visualization
        this.createEnergyBar();
        
        // Add touch event handlers for mobile
        this.initMobileControls();
    }
      static showTutorial() {
        const tutorialOverlay = document.createElement('div');
        tutorialOverlay.className = 'tutorial-overlay';
        
        const tutorialContent = document.createElement('div');
        tutorialContent.className = 'tutorial-content';
        tutorialContent.innerHTML = `
            <h2>Welcome to Streamer Simulator 2!</h2>
            <p>Your goal is to become a successful streamer by reaching:</p>
            <ul style="text-align: left; margin: 20px auto; max-width: 300px;">
                <li>1,000 Subscribers</li>
                <li>$5,000 in earnings</li>
                <li>90 Reputation</li>
            </ul>
            <p><strong>How to Play:</strong></p>
            <p>1. <strong>Select a stream type</strong> by clicking on a card</p>
            <p>2. Click "Start Stream" to begin streaming</p>
            <p>3. <strong>Switch stream types</strong> while live for variety!</p>
            <p>4. End streams before you run out of energy</p>
            <p>5. Use the Rest button between streams</p>
            <p>6. Buy upgrades to improve your channel</p>
            <p>7. Watch chat for viewer reactions!</p>
            <p><strong>New:</strong> You can now change stream types while live!</p>
            <button id="tutorial-close">Let's Stream!</button>
        `;
        
        tutorialOverlay.appendChild(tutorialContent);
        document.body.appendChild(tutorialOverlay);
        
        document.getElementById('tutorial-close').addEventListener('click', () => {
            document.body.removeChild(tutorialOverlay);
            localStorage.setItem(CONFIG.TUTORIAL_SHOWN_KEY, 'true');
        });
    }
    
    static createEnergyBar() {
        const energyStatItem = document.querySelector('#energy').parentElement;
        const energyBar = document.createElement('div');
        energyBar.className = 'energy-bar';
        energyBar.innerHTML = '<div class="energy-fill"></div>';
        energyStatItem.appendChild(energyBar);
    }
      static initMobileControls() {
        // Add haptic feedback for mobile devices
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                }
            });
        });
        
        // Prevent accidental double-taps
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
            }
            lastTap = currentTime;
        });
        
        // Add swipe gesture for stream type switching (mobile only)
        if (window.innerWidth <= 768) {
            this.initSwipeGestures();
        }
        
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 500);
        });
    }
    
    static initSwipeGestures() {
        const streamDisplay = document.getElementById('stream-display');
        let startX = 0;
        let startY = 0;
        let threshold = 100; // Minimum swipe distance
        
        streamDisplay.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        streamDisplay.addEventListener('touchend', (e) => {
            if (!GAME.currentStream || !GAME.currentStream.active) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Check if it's a horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
                const currentIndex = CONFIG.STREAM_TYPES.findIndex(type => type.id === GAME.currentStream.type);
                const unlockedTypes = CONFIG.STREAM_TYPES.filter(type => 
                    type.unlocked || (type.unlockAt && GAME.player.subscribers >= type.unlockAt)
                );
                
                if (deltaX > 0) {
                    // Swiped right - next stream type
                    const nextIndex = (currentIndex + 1) % unlockedTypes.length;
                    if (unlockedTypes[nextIndex] && unlockedTypes[nextIndex].id !== GAME.currentStream.type) {
                        this.switchStreamType(unlockedTypes[nextIndex].id);
                    }
                } else {
                    // Swiped left - previous stream type
                    const prevIndex = currentIndex - 1 < 0 ? unlockedTypes.length - 1 : currentIndex - 1;
                    if (unlockedTypes[prevIndex] && unlockedTypes[prevIndex].id !== GAME.currentStream.type) {
                        this.switchStreamType(unlockedTypes[prevIndex].id);
                    }
                }
            }
        }, { passive: true });
    }
    
    static handleOrientationChange() {
        // Adjust layout for orientation changes
        const gameContainer = document.getElementById('game-container');
        if (window.innerHeight < window.innerWidth && window.innerWidth <= 768) {
            // Landscape mobile mode
            gameContainer.style.gridTemplateColumns = '1fr 1fr';
            gameContainer.style.gridTemplateRows = 'auto auto auto';
        } else {
            // Portrait mode - reset to default mobile layout
            gameContainer.style.gridTemplateColumns = '1fr';
            gameContainer.style.gridTemplateRows = 'auto auto auto auto auto';        }
    }
    
    static createStreamTypeCards() {
        const cardsContainer = document.getElementById('stream-type-cards');
        cardsContainer.innerHTML = '';
        
        const streamTypeEmojis = {
            'gaming': '🎮',
            'justchatting': '💬',
            'music': '🎵',
            'artstream': '🎨',
            'coding': '💻'
        };
        
        CONFIG.STREAM_TYPES.forEach(streamType => {
            const card = document.createElement('div');
            card.className = 'stream-type-card';
            
            // Check if unlocked
            const isUnlocked = streamType.unlocked || 
                (streamType.unlockAt && GAME.player.subscribers >= streamType.unlockAt);
            
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
                        <div class="card-emoji">${streamTypeEmojis[streamType.id] || '🎥'}</div>
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
                        <div class="card-emoji">${streamTypeEmojis[streamType.id] || '🎥'}</div>
                    </div>
                    <div class="card-unlock-info">
                        Unlock at ${streamType.unlockAt} subscribers
                    </div>
                `;
            }
            
            cardsContainer.appendChild(card);
        });
        
        this.updateQuickSwitchControls();
    }
    
    static selectStreamType(streamTypeId) {
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
    
    static updateQuickSwitchControls() {
        const quickSwitchControls = document.getElementById('quick-switch-controls');
        const quickSwitchButtons = document.getElementById('quick-switch-buttons');
        
        // Show quick switch only when streaming
        if (GAME.currentStream && GAME.currentStream.active) {
            quickSwitchControls.style.display = 'block';
            quickSwitchButtons.innerHTML = '';
            
            // Create buttons for other unlocked stream types
            CONFIG.STREAM_TYPES.forEach(streamType => {
                if (streamType.id === GAME.currentStream.type) return; // Skip current type
                
                const isUnlocked = streamType.unlocked || 
                    (streamType.unlockAt && GAME.player.subscribers >= streamType.unlockAt);
                
                if (isUnlocked) {
                    const btn = document.createElement('button');
                    btn.className = 'quick-switch-btn';
                    btn.textContent = streamType.name;
                    btn.onclick = () => this.switchStreamType(streamType.id);
                    
                    // Check if player can afford the switch
                    const canAfford = GAME.player.money >= streamType.cost;
                    const hasEnergy = GAME.player.energy >= 10; // Cost for switching
                    
                    if (!canAfford || !hasEnergy) {
                        btn.disabled = true;
                        btn.title = !canAfford ? `Need $${streamType.cost}` : 'Need more energy';
                    }
                    
                    quickSwitchButtons.appendChild(btn);
                }
            });
        } else {
            quickSwitchControls.style.display = 'none';
        }
    }
      static switchStreamType(newStreamType) {
        if (!GAME.currentStream || !GAME.currentStream.active) return;
        
        const streamTypeConfig = CONFIG.STREAM_TYPES.find(type => type.id === newStreamType);
        if (!streamTypeConfig) return;
        
        // Check costs
        if (!GAME.player.spendMoney(streamTypeConfig.cost)) {
            this.showNotificationWithType("Not enough money to switch stream type!", 'error');
            return;
        }
        
        if (GAME.player.energy < 10) {
            this.showNotificationWithType("Not enough energy to switch stream type!", 'error');
            return;
        }
        
        // Add loading effect to the target card
        const cards = document.querySelectorAll('.stream-type-card');
        const streamTypeIndex = CONFIG.STREAM_TYPES.findIndex(type => type.id === newStreamType);
        if (streamTypeIndex !== -1 && cards[streamTypeIndex]) {
            cards[streamTypeIndex].classList.add('loading');
        }
        
        // Apply switch cost and change type
        GAME.player.useEnergy(10);
        GAME.currentStream.type = newStreamType;
        
        // Update display with delay for better UX
        setTimeout(() => {
            if (streamTypeIndex !== -1 && cards[streamTypeIndex]) {
                cards[streamTypeIndex].classList.remove('loading');
            }
            
            this.updateStreamDisplay(newStreamType);
            this.selectStreamType(newStreamType);
            this.logEvent(`Switched to ${streamTypeConfig.name} stream!`);
            this.showNotificationWithType(`Switched to ${streamTypeConfig.name}!`, 'success');
            
            // Recalculate energy drain rate for new stream type
            GAME.currentStream.calculateEnergyDrainRate(streamTypeConfig);
            
            // Update quick switch controls
            this.updateQuickSwitchControls();
            
            // Add pulse effect to viewer count to indicate potential change
            this.addPulseEffect('viewers-count');
        }, 300);
    }
    
    static createShopItems() {
        const shopItemsContainer = document.getElementById('shop-items-container');
        shopItemsContainer.innerHTML = ''; // Clear existing items

        CONFIG.SHOP_ITEMS.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shop-item';

            const itemName = document.createElement('h4');
            itemName.textContent = item.name;

            const itemDesc = document.createElement('p');
            itemDesc.textContent = item.description;

            const itemCost = document.createElement('p');
            itemCost.textContent = `Cost: $${item.cost}`;

            const buyButton = document.createElement('button');
            buyButton.textContent = "Buy";
            buyButton.onclick = () => {
                GAME.player.buyItem(item.id);
                // Future: Could update shop UI here if item is single purchase
            };

            itemDiv.appendChild(itemName);
            itemDiv.appendChild(itemDesc);
            itemDiv.appendChild(itemCost);
            itemDiv.appendChild(buyButton);
            shopItemsContainer.appendChild(itemDiv);
        });
    }
    
    static updateStats() {
        document.getElementById('subscribers').textContent = GAME.player.subscribers;
        document.getElementById('money').textContent = GAME.player.money;
        document.getElementById('reputation').textContent = GAME.player.reputation;
        document.getElementById('energy').textContent = Math.floor(GAME.player.energy);
        
        // Update energy bar
        const energyPercent = (GAME.player.energy / GAME.player.maxEnergy) * 100;
        const energyFill = document.querySelector('.energy-fill');
        if (energyFill) {
            energyFill.style.width = `${energyPercent}%`;
            
            // Change color based on energy level
            energyFill.classList.remove('low', 'medium');
            if (energyPercent < 30) {
                energyFill.classList.add('low');
            } else if (energyPercent < 60) {
                energyFill.classList.add('medium');
            }
        }
        
        // Check for newly unlocked stream types
        this.checkStreamUnlocks();
    }
      static checkStreamUnlocks() {
        CONFIG.STREAM_TYPES.forEach(streamType => {
            if (streamType.unlockAt && !streamType.unlocked && 
                GAME.player.subscribers >= streamType.unlockAt) {
                streamType.unlocked = true;
                this.showNotification(`${streamType.name} streams unlocked!`);
                this.createStreamTypeCards(); // Refresh cards
            }
        });
    }
      static updateStreamDisplay(streamType) {
        const streamVideoFeed = document.getElementById('stream-video-feed');
        
        if (!streamType) {
            streamVideoFeed.innerHTML = '<div class="offline-message">Stream Offline</div>';
            document.getElementById('chat-log').innerHTML = '';
            return;
        }
        
        let content = '';
        switch(streamType) {
            case 'gaming':
                content = '<div class="stream-gaming">🎮 Gaming Stream</div>';
                break;
            case 'justchatting':
                content = '<div class="stream-chat">💬 Just Chatting</div>';
                break;
            case 'music':
                content = '<div class="stream-music">🎵 Music Stream</div>';
                break;
            case 'artstream':
                content = '<div class="stream-art">🎨 Art Stream</div>';
                break;
            case 'coding':
                content = '<div class="stream-coding">💻 Coding Stream</div>';
                break;
            default:
                content = '<div class="stream-generic">🎥 Live Stream</div>';
        }
        
        // Add swipe hint for mobile users when streaming
        if (window.innerWidth <= 768 && GAME.currentStream && GAME.currentStream.active) {
            content += '<div class="swipe-hint">Swipe to switch</div>';
        }
        
        streamVideoFeed.innerHTML = content;
    }
    
    static updateViewerCount(count) {
        document.getElementById('viewers-count').textContent = `Viewers: ${count}`;
    }
    
    static updateStreamTimer(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedTime = 
            `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        document.getElementById('stream-timer').textContent = formattedTime;
        
        // Add visual indicator when approaching target duration
        const targetReached = seconds >= GAME.currentStream.targetDuration;
        const timerElement = document.getElementById('stream-timer');
        if (targetReached) {
            timerElement.style.color = '#00ff00';
        } else {
            timerElement.style.color = '#ffffff';
        }
    }
      static toggleStreamControls(isStreaming) {
        document.getElementById('start-stream').disabled = isStreaming;
        document.getElementById('end-stream').disabled = !isStreaming;
        document.getElementById('active-rest').disabled = isStreaming; // Enable/disable rest button
        
        // Update stream type cards - disable switching when not streaming
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
        this.updateQuickSwitchControls();
    }
    
    static highlightEndStream() {
        const endStreamButton = document.getElementById('end-stream');
        endStreamButton.classList.add('highlight');
        setTimeout(() => {
            endStreamButton.classList.remove('highlight');
        }, 500);
    }
    
    static logEvent(message) {
        const eventsLog = document.getElementById('events-log');
        const entry = document.createElement('div');
        entry.className = 'event-entry';
        
        // Add timestamp
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
    
    static showNotification(message) {
        const notificationArea = document.getElementById('notification-area');
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        notificationArea.appendChild(notification);
        
        // Remove notification after animation
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    static showNotificationWithType(message, type = 'info') {
        const notificationArea = document.getElementById('notification-area');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notificationArea.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    static addPulseEffect(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('pulse');
            setTimeout(() => {
                element.classList.remove('pulse');
            }, 3000);
        }
    }
    
    static showDonation(amount) {
        const streamVideoFeed = document.getElementById('stream-video-feed');
        const donation = document.createElement('div');
        donation.className = 'donation-animation';
        donation.textContent = `$${amount}`;
        donation.style.position = 'absolute';
        donation.style.left = `${Math.random() * 60 + 20}%`;
        donation.style.top = `${Math.random() * 60 + 20}%`;
        donation.style.color = '#ffcc00';
        donation.style.fontWeight = 'bold';
        donation.style.fontSize = '24px';
        donation.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';
        donation.style.animation = 'donationFloat 2s forwards';
        
        streamVideoFeed.appendChild(donation);
        
        setTimeout(() => {
            donation.remove();
        }, 2000);
          UI.logEvent(`Received a $${amount} donation!`);
        CHAT_MANAGER.postDonationReaction("GenerousViewer", amount);
    }
    
    static addChatMessage(username, messageText, userColor = '#ffffff') {
        const chatLog = document.getElementById('chat-log');
        const messageEntry = document.createElement('div');
        messageEntry.className = 'chat-message';

        // Parse username for badges
        const userSpan = document.createElement('span');
        userSpan.className = 'chat-username';
        userSpan.innerHTML = `${username}: `; // Using innerHTML to support badges
        userSpan.style.color = userColor;
        userSpan.style.fontWeight = 'bold';

        const textSpan = document.createElement('span');
        textSpan.className = 'chat-text';
        textSpan.innerHTML = messageText; // Using innerHTML to support emotes

        // Determine if chat should auto-scroll BEFORE appending the new message
        // and before removing old messages, as scrollHeight will change.
        const scrollThreshold = 20; // How many pixels from bottom to still consider "at bottom"
        const isScrolledNearBottom = chatLog.scrollTop + chatLog.clientHeight >= chatLog.scrollHeight - scrollThreshold;

        messageEntry.appendChild(userSpan);
        messageEntry.appendChild(textSpan);
        chatLog.appendChild(messageEntry);

        // Limit chat messages for performance
        while (chatLog.children.length > CONFIG.CHAT_MAX_ENTRIES) {
            chatLog.removeChild(chatLog.firstChild);
        }
        
        // Auto-scroll to bottom only if user was already near the bottom
        if (isScrolledNearBottom) {
            chatLog.scrollTop = chatLog.scrollHeight - chatLog.clientHeight; // Precise scroll to bottom
        }
    }
    
    static showVictoryScreen() {
        const gameContainer = document.getElementById('game-container');
        
        // Create victory overlay
        const victoryOverlay = document.createElement('div');
        victoryOverlay.id = 'victory-overlay';
        victoryOverlay.style.position = 'fixed';
        victoryOverlay.style.top = '0';
        victoryOverlay.style.left = '0';
        victoryOverlay.style.width = '100%';
        victoryOverlay.style.height = '100%';
        victoryOverlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
        victoryOverlay.style.display = 'flex';
        victoryOverlay.style.flexDirection = 'column';
        victoryOverlay.style.alignItems = 'center';
        victoryOverlay.style.justifyContent = 'center';
        victoryOverlay.style.color = '#ffffff';
        victoryOverlay.style.zIndex = '100';
        
        // Victory content
        const victoryContent = document.createElement('div');
        victoryContent.innerHTML = `
            <h1 style="color: #9147ff; font-size: 48px; margin-bottom: 20px;">CONGRATULATIONS!</h1>
            <h2>You've become a successful streamer!</h2>
            <p style="margin: 20px 0;">Final stats:</p>
            <ul style="list-style: none; padding: 0; text-align: center; margin-bottom: 20px;">
                <li>Subscribers: ${GAME.player.subscribers}</li>
                <li>Money: $${GAME.player.money}</li>
                <li>Reputation: ${GAME.player.reputation}</li>
                <li>Streams completed: ${GAME.player.stats.streamsCompleted}</li>
                <li>Total streaming time: ${Math.floor(GAME.player.stats.totalStreamTime / 60)} minutes</li>
                <li>Peak viewers: ${GAME.player.stats.maxViewers}</li>
            </ul>
            <button id="play-again" style="margin-top: 20px;">Play Again</button>
        `;
        
        victoryOverlay.appendChild(victoryContent);
        document.body.appendChild(victoryOverlay);
        
        // Add event listener to play again button
        document.getElementById('play-again').addEventListener('click', () => {
            document.body.removeChild(victoryOverlay);
            GAME.reset();
        });
    }
    
    static initDarkMode() {
        // Get saved theme preference or detect system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let theme;
        if (savedTheme) {
            theme = savedTheme;
        } else {
            theme = systemPrefersDark ? 'dark' : 'light';
        }
        
        this.setTheme(theme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) { // Only follow system if no manual preference
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    static setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update toggle button icon
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
            toggleBtn.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
        }
    }
    
    static toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Show notification
        this.showNotification(`Switched to ${newTheme} mode`);
    }
}