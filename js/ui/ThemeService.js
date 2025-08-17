export class ThemeService {
    constructor() {
        this.storageKey = 'theme';
        this.currentTheme = null;
        this.init();
    }

    /**
     * Initialize theme system
     */
    init() {
        // Get saved theme preference or detect system preference
        const savedTheme = localStorage.getItem(this.storageKey);
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
            if (!localStorage.getItem(this.storageKey)) { // Only follow system if no manual preference
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    /**
     * Set theme and update DOM
     */
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update toggle button icon if it exists
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
            toggleBtn.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
        }
    }

    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        localStorage.setItem(this.storageKey, newTheme);
        return newTheme;
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Check if dark mode is active
     */
    isDarkMode() {
        return this.currentTheme === 'dark';
    }

    /**
     * Reset to system preference
     */
    resetToSystem() {
        localStorage.removeItem(this.storageKey);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(systemPrefersDark ? 'dark' : 'light');
    }
}