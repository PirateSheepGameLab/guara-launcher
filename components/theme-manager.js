class ThemeManager {
    constructor() {
        this.themes = {};
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.loadThemes();
    }

    async loadThemes() {
        try {
            const response = await fetch('themes.json');
            const data = await response.json();
            this.themes = data.themes.reduce((acc, theme) => {
                acc[theme.theme] = {
                    // Background colors
                    mainBackground: theme.colors.background,
                    sidebarColor: theme.colors.sidebarBackground,
                    overlayBackground: `${theme.colors.background}CC`, // 80% opacity
                    hoverOverlay: `${theme.colors.primaryButton}1A`, // 10% opacity

                    // Text colors
                    textColor: theme.colors.fontColor,
                    textSecondary: theme.colors.fontColor,
                    sidebarText: theme.colors.sidebarText,
                    bannerText: theme.colors.bannerTextColor,

                    // Button colors
                    buttonColor: theme.colors.primaryButton,
                    buttonText: theme.colors.primaryButtonText,
                    accentColor: theme.colors.primaryButton,

                    // Icon colors
                    iconColor: theme.colors.iconColor,

                    // Border colors
                    borderColor: theme.colors.borderColor
                };
                return acc;
            }, {});
            
            this.init();
        } catch (error) {
            console.error('Error loading themes:', error);
        }
    }

    init() {
        // Apply theme immediately when the manager is initialized
        this.applyTheme(this.currentTheme);
        
        // Set up theme change listeners
        this.setupThemeListeners();
        
        // Listen for storage events to sync theme across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                this.applyTheme(e.newValue);
            }
        });
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        // Apply theme variables to root
        Object.entries(theme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, value);
        });

        // Set theme attribute for CSS selectors
        document.documentElement.setAttribute('data-theme', themeName);
        
        // Update current theme
        this.currentTheme = themeName;
        localStorage.setItem('theme', themeName);

        // Update active state of theme options if they exist
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === themeName);
        });

        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));
    }

    setupThemeListeners() {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const themeName = option.dataset.theme;
                this.applyTheme(themeName);
            });
        });
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});