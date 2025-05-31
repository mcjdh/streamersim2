class UI {
    static init() {
        // Show tutorial for new players
        if (CONFIG.SHOW_TUTORIAL && !localStorage.getItem(CONFIG.TUTORIAL_SHOWN_KEY)) {
            this.showTutorial();
        }
        
        // Initialize UI event listeners
        document.getElementById('start-stream').addEventListener('click', () => {
            const selectedStreamType = document.querySelector('input[name="stream-type"]:checked');
            if (selectedStreamType) {
                GAME.startStream(selectedStreamType.value);
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
        
        // Create stream type options
        this.createStreamOptions();
        
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
            <p>1. Choose a stream type and click "Start Stream"</p>
            <p>2. Manage your energy - streaming drains it!</p>
            <p>3. End streams before you run out of energy</p>
            <p>4. Use the Rest button between streams</p>
            <p>5. Buy upgrades to improve your channel</p>
            <p>6. Watch chat for viewer reactions!</p>
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
            if (tapLength < 500 && tapLength > 0) {
                e.preventDefault();
            }
            lastTap = currentTime;
        });
    }
    
    static createStreamOptions() {
        const streamOptionsContainer = document.getElementById('stream-options');
        
        CONFIG.STREAM_TYPES.forEach(streamType => {
            const option = document.createElement('div');
            option.className = 'stream-option';
            
            // Check if unlocked
            const isUnlocked = streamType.unlocked || 
                (streamType.unlockAt && GAME.player.subscribers >= streamType.unlockAt);
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `stream-${streamType.id}`;
            radio.name = 'stream-type';
            radio.value = streamType.id;
            radio.disabled = !isUnlocked;
            
            const label = document.createElement('label');
            label.htmlFor = `stream-${streamType.id}`;
            
            if (isUnlocked) {
                label.textContent = `${streamType.name} ($${streamType.cost}, -${streamType.energyCost} energy/s)`;
            } else {
                label.textContent = `${streamType.name} (Unlock at ${streamType.unlockAt} subs)`;
                option.style.opacity = '0.5';
            }
            
            option.appendChild(radio);
            option.appendChild(label);
            streamOptionsContainer.appendChild(option);
        });
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
                this.createStreamOptions(); // Refresh options
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
        
        const streamOptions = document.getElementById('stream-options');
        const radioButtons = streamOptions.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.disabled = isStreaming;
        });
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
}