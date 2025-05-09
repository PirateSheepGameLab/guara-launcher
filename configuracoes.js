document.addEventListener('DOMContentLoaded', () => {
    const selectFolderBtn = document.getElementById('selectFolder');
    const gamesPathInput = document.getElementById('gamesPath');
    const themeOptions = document.querySelectorAll('.theme-option');

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

    // Get current theme and mark it as active
    const currentTheme = localStorage.getItem('theme') || 'dark';
    themeOptions.forEach(option => {
        if (option.dataset.theme === currentTheme) {
            option.classList.add('active');
        }
    });

    // Theme selection event listeners
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            
            // Remove active class from all options
            themeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to selected option
            option.classList.add('active');
            
            // Save the theme
            localStorage.setItem('theme', theme);

            // Let the theme manager handle the application
            loadTheme();
        });
    });
});