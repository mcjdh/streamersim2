export class Notifications {
    constructor() {
        this.notificationArea = document.getElementById('notification-area');
        this.maxNotifications = 5;
    }

    /**
     * Show a basic notification
     */
    show(message, duration = 5000) {
        this.showWithType(message, 'info', duration);
    }

    /**
     * Show notification with specific type
     */
    showWithType(message, type = 'info', duration = 5000) {
        if (!this.notificationArea) {
            console.warn('Notification area not found');
            return;
        }

        const notification = this.createNotification(message, type);
        this.notificationArea.appendChild(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Remove notification after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Limit number of notifications
        this.limitNotifications();
    }

    /**
     * Create notification element
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add icon based on type
        const icon = this.getIconForType(type);
        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-text">${message}</span>
            <button class="notification-close" aria-label="Close notification">×</button>
        `;

        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        return notification;
    }

    /**
     * Get appropriate icon for notification type
     */
    getIconForType(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove notification with animation
     */
    removeNotification(notification) {
        if (!notification.parentNode) return;

        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Limit number of visible notifications
     */
    limitNotifications() {
        const notifications = this.notificationArea.querySelectorAll('.notification');
        if (notifications.length > this.maxNotifications) {
            const oldestNotification = notifications[0];
            this.removeNotification(oldestNotification);
        }
    }

    /**
     * Show success notification
     */
    success(message, duration = 5000) {
        this.showWithType(message, 'success', duration);
    }

    /**
     * Show warning notification
     */
    warning(message, duration = 7000) {
        this.showWithType(message, 'warning', duration);
    }

    /**
     * Show error notification
     */
    error(message, duration = 8000) {
        this.showWithType(message, 'error', duration);
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        const notifications = this.notificationArea.querySelectorAll('.notification');
        notifications.forEach(notification => {
            this.removeNotification(notification);
        });
    }

    /**
     * Show persistent notification (must be manually closed)
     */
    showPersistent(message, type = 'info') {
        const notification = this.createNotification(message, type);
        notification.classList.add('persistent');
        this.notificationArea.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        return notification;
    }
}