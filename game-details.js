// Função para definir a imagem de fundo
function setBackgroundCoverImage() {
    const mainImage = document.getElementById('mainImage');
    if (mainImage && mainImage.src) {
        document.documentElement.style.setProperty('--game-cover-image', `url('${mainImage.src}')`);
    }
}

// Chama a função inicialmente para garantir que o fundo seja definido
setBackgroundCoverImage();

// Carregar detalhes do jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados do jogo
    async function loadGameDetails() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const gameId = urlParams.get('id');
            
            const response = await fetch('games.json');
            const games = await response.json();
            const game = games.find(g => g.id === gameId);
            
            if (game) {
                document.getElementById('gameTitle').textContent = game.title;
                document.getElementById('gameDescription').textContent = game.description;
                document.documentElement.style.setProperty('--game-cover-image', `url('${game.background}')`);
            }
        } catch (error) {
            console.error('Error loading game details:', error);
        }
    }

    // Initialize
    loadGameDetails();
});

// Função para lidar com erros - apenas loga no console, sem exibir para o usuário
function showError(message) {
    console.error('[Debug]:', message);
}