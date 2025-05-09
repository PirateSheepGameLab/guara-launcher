// Theme configuration
const themes = {
    dark: {
        '--sidebar-color': '#000000',
        '--button-color': '#333333',
        '--overlay-background': 'rgba(0, 0, 0, 0.5)',
        '--hover-overlay': 'rgba(255, 255, 255, 0.1)'
    },
    grey: {
        '--sidebar-color': '#333333',
        '--button-color': '#000000',
        '--overlay-background': 'rgba(0, 0, 0, 0.5)',
        '--hover-overlay': 'rgba(255, 255, 255, 0.1)'
    },
    fancy: {
        '--sidebar-color': '#1a73e8',
        '--button-color': '#e91e63',
        '--overlay-background': 'rgba(0, 0, 0, 0.5)',
        '--hover-overlay': 'rgba(255, 255, 255, 0.1)'
    }
};

function loadTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(currentTheme);
}

function applyTheme(themeName) {
    const theme = themes[themeName];
    if (theme) {
        Object.entries(theme).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });

        // Update active state of theme options if they exist
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === themeName);
        });

        // Store the selected theme
        localStorage.setItem('theme', themeName);
    }
}

// Load theme when the document is ready
document.addEventListener('DOMContentLoaded', loadTheme);