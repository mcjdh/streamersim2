import { CONFIG } from '../config/config.js';

export class ShopView {
    constructor(game, notifications) {
        this.game = game;
        this.notifications = notifications;
        this.shopContainer = document.getElementById('shop-items-container');
        this.initEventListeners();
    }

    /**
     * Initialize shop event listeners
     */
    initEventListeners() {
        if (!this.shopContainer) return;

        // Event delegation for buy buttons
        this.shopContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('shop-buy-button')) {
                const itemId = e.target.dataset.itemId;
                if (itemId) {
                    this.buyItem(itemId);
                }
            }
        });
    }

    /**
     * Create shop items display
     */
    createShopItems() {
        if (!this.shopContainer) return;
        
        this.shopContainer.innerHTML = ''; // Clear existing items

        CONFIG.SHOP_ITEMS.forEach(item => {
            const itemElement = this.createShopItem(item);
            this.shopContainer.appendChild(itemElement);
        });
    }

    /**
     * Create individual shop item element
     */
    createShopItem(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        
        // Check if player can afford
        const canAfford = this.game.player.money >= item.cost;
        const isPurchased = this.game.player.purchasedItems?.includes(item.id);
        
        if (!canAfford) {
            itemDiv.classList.add('unaffordable');
        }
        if (isPurchased && !item.repeatable) {
            itemDiv.classList.add('purchased');
        }

        // Create item content
        itemDiv.innerHTML = `
            <div class="shop-item-header">
                <h4 class="shop-item-name">${item.name}</h4>
                <div class="shop-item-cost">$${item.cost}</div>
            </div>
            <p class="shop-item-description">${item.description}</p>
            ${this.createEffectDisplay(item.effect)}
            ${this.createBuyButton(item, canAfford, isPurchased)}
        `;

        return itemDiv;
    }

    /**
     * Create effect display for shop item
     */
    createEffectDisplay(effect) {
        if (!effect) return '';

        const effects = [];
        if (effect.reputation) {
            effects.push(`+${effect.reputation} Reputation`);
        }
        if (effect.skill && effect.amount) {
            effects.push(`+${effect.amount} ${effect.skill} skill`);
        }
        if (effect.energy) {
            effects.push(`+${effect.energy} Energy`);
        }
        if (effect.maxEnergy) {
            effects.push(`+${effect.maxEnergy} Max Energy`);
        }

        if (effects.length === 0) return '';

        return `
            <div class="shop-item-effects">
                ${effects.map(effect => `<span class="effect-tag">${effect}</span>`).join('')}
            </div>
        `;
    }

    /**
     * Create buy button for shop item
     */
    createBuyButton(item, canAfford, isPurchased) {
        const isRepeatable = item.repeatable !== false;
        const buttonDisabled = !canAfford || (isPurchased && !isRepeatable);
        
        let buttonText = 'Buy';
        if (isPurchased && !isRepeatable) {
            buttonText = 'Purchased';
        } else if (!canAfford) {
            buttonText = 'Can\'t Afford';
        }

        return `
            <button class="shop-buy-button" 
                    ${buttonDisabled ? 'disabled' : ''}
                    data-item-id="${item.id}"
                    aria-label="Buy ${item.name} for $${item.cost}">
                ${buttonText}
            </button>
        `;
    }

    /**
     * Handle item purchase
     */
    buyItem(itemId) {
        const item = CONFIG.SHOP_ITEMS.find(shopItem => shopItem.id === itemId);
        if (!item) {
            console.error(`Item with id ${itemId} not found in shop.`);
            this.notifications.error('Item not found!');
            return false;
        }

        // Check if already purchased and not repeatable
        const isPurchased = this.game.player.purchasedItems?.includes(itemId);
        if (isPurchased && item.repeatable === false) {
            this.notifications.warning('Item already purchased!');
            return false;
        }

        // Attempt purchase through player
        const success = this.game.player.buyItem(itemId);
        
        if (success) {
            // Refresh shop display to show updated states
            this.createShopItems();
            
            // Show success notification with effect details
            const effectText = this.getEffectText(item.effect);
            this.notifications.success(
                `Purchased ${item.name}!${effectText ? ' ' + effectText : ''}`,
                6000
            );
        }

        return success;
    }

    /**
     * Get human-readable effect text
     */
    getEffectText(effect) {
        if (!effect) return '';

        const effects = [];
        if (effect.reputation) {
            effects.push(`+${effect.reputation} reputation`);
        }
        if (effect.skill && effect.amount) {
            effects.push(`+${effect.amount} ${effect.skill}`);
        }
        if (effect.energy) {
            effects.push(`+${effect.energy} energy`);
        }
        if (effect.maxEnergy) {
            effects.push(`+${effect.maxEnergy} max energy`);
        }

        return effects.length > 0 ? `(${effects.join(', ')})` : '';
    }

    /**
     * Update shop display (refresh affordability states)
     */
    updateShop() {
        this.createShopItems();
    }

    /**
     * Filter shop items by category (if categories are added later)
     */
    filterByCategory(category) {
        const items = this.shopContainer.querySelectorAll('.shop-item');
        items.forEach(item => {
            const itemData = item.dataset.category;
            if (!category || itemData === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Get shop statistics
     */
    getShopStats() {
        const player = this.game.player;
        const totalItems = CONFIG.SHOP_ITEMS.length;
        const purchasedItems = player.purchasedItems?.length || 0;
        const affordableItems = CONFIG.SHOP_ITEMS.filter(item => 
            player.money >= item.cost
        ).length;

        return {
            totalItems,
            purchasedItems,
            affordableItems,
            completionPercentage: Math.round((purchasedItems / totalItems) * 100)
        };
    }
}