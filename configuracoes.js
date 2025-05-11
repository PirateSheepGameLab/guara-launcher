document.addEventListener('DOMContentLoaded', async () => {
    const selectFolderBtn = document.getElementById('selectFolder');
    const gamesPathInput = document.getElementById('gamesPath');
    const themeOptionsContainer = document.querySelector('.theme-options');

    // Get the stored path if it exists
    const storedPath = localStorage.getItem('gamesPath');
    if (storedPath) {
        gamesPathInput.value = storedPath;
    }

    selectFolderBtn.addEventListener('click', async () => {
        // We need to use IPC to communicate with the main process
        const result = await window.electron.openFolderDialog();
        
        if (result && result.filePaths && result.filePaths[0]) {
            const selectedPath = result.filePaths[0];
            gamesPathInput.value = selectedPath;
            localStorage.setItem('gamesPath', selectedPath);
        }
    });

    // Load themes from JSON
    try {
        const response = await fetch('themes.json');
        const data = await response.json();
        
        // Clear existing theme options
        themeOptionsContainer.innerHTML = '';
        
        // Create theme options dynamically
        data.themes.forEach(theme => {
            const themeOption = document.createElement('div');
            themeOption.className = 'theme-option';
            themeOption.dataset.theme = theme.theme;
            
            themeOption.innerHTML = `
                <div class="theme-preview">
                    <div class="preview-bar" style="background-color: ${theme.colors.sidebarBackground}"></div>
                    <div class="preview-button" style="background-color: ${theme.colors.primaryButton}; border: 1px solid ${theme.colors.borderColor}"></div>
                </div>
                <span>${theme.theme.charAt(0).toUpperCase() + theme.theme.slice(1)}</span>
            `;
            
            themeOptionsContainer.appendChild(themeOption);
        });

        // Get current theme and mark it as active
        const currentTheme = localStorage.getItem('theme') || 'dark';
        document.querySelectorAll('.theme-option').forEach(option => {
            if (option.dataset.theme === currentTheme) {
                option.classList.add('active');
            }
        });

        // Theme selection event listeners
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                
                // Remove active class from all options
                document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                
                // Add active class to selected option
                option.classList.add('active');
                
                // Apply the theme using the theme manager
                if (window.themeManager) {
                    window.themeManager.applyTheme(theme);
                }
            });
        });
    } catch (error) {
        console.error('Error loading themes:', error);
    }
});