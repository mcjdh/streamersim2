class UI {
    static init() {
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
        
        // Create stream type options
        this.createStreamOptions();
        
        // Initial stats update
        this.updateStats();
        this.createShopItems();
    }
    
    static createStreamOptions() {
        const streamOptionsContainer = document.getElementById('stream-options');
        
        CONFIG.STREAM_TYPES.forEach(streamType => {
            const option = document.createElement('div');
            option.className = 'stream-option';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `stream-${streamType.id}`;
            radio.name = 'stream-type';
            radio.value = streamType.id;
            
            const label = document.createElement('label');
            label.htmlFor = `stream-${streamType.id}`;
            label.textContent = `${streamType.name} ($${streamType.cost}, -${streamType.energyCost} energy)`;
            
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
        document.getElementById('energy').textContent = GAME.player.energy;
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
    }
    
    static toggleStreamControls(isStreaming) {
        document.getElementById('start-stream').disabled = isStreaming;
        document.getElementById('end-stream').disabled = !isStreaming;
        
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
        CHAT_MANAGER.postDonationReaction(GAME.player.username || "GenerousViewer", amount);
    }
    
    static addChatMessage(username, messageText, userColor = '#ffffff') {
        const chatLog = document.getElementById('chat-log');
        const messageEntry = document.createElement('div');
        messageEntry.className = 'chat-message';

        const userSpan = document.createElement('span');
        userSpan.className = 'chat-username';
        userSpan.textContent = `${username}: `;
        userSpan.style.color = userColor;
        userSpan.style.fontWeight = 'bold';

        const textSpan = document.createElement('span');
        textSpan.className = 'chat-text';
        textSpan.textContent = messageText;

        // Determine if chat should auto-scroll BEFORE appending the new message
        // and before removing old messages, as scrollHeight will change.
        const scrollThreshold = 20; // How many pixels from bottom to still consider "at bottom"
        const isScrolledNearBottom = chatLog.scrollTop + chatLog.clientHeight >= chatLog.scrollHeight - scrollThreshold;

        messageEntry.appendChild(userSpan);
        messageEntry.appendChild(textSpan);
        chatLog.appendChild(messageEntry);

        // Limit chat log entries (removes from the top)
        while (chatLog.children.length > CONFIG.LOG_MAX_ENTRIES) { 
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