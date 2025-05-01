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
    let currentMediaIndex = 0;
    let mediaItems = [];
    let isTransitioning = false;

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
                document.getElementById('gameGenre').textContent = game.genre;
                document.getElementById('gameDescription').textContent = game.description;
                document.documentElement.style.setProperty('--game-cover-image', `url('${game.background}')`);
                
                loadMediaFromGame(game);
            }
        } catch (error) {
            console.error('Error loading game details:', error);
        }
    }

    function loadMediaFromGame(game) {
        mediaItems = [
            ...(game.images || []).map(src => ({ type: 'image', src })),
            ...(game.videos || []).map(src => ({ type: 'video', src }))
        ];

        if (mediaItems.length === 0) {
            mediaItems.push({ type: 'image', src: game.cover });
        }

        const container = document.querySelector('.carousel-container');
        container.innerHTML = '';

        mediaItems.forEach((item, index) => {
            const mediaElement = createMediaItem(item);
            container.appendChild(mediaElement);
        });

        updateCarouselPosition(0);
        createNavigationButtons();
    }

    function createMediaItem(item) {
        const div = document.createElement('div');
        div.className = `media-item ${item.type}`;

        const mediaElement = item.type === 'video' 
            ? createVideoElement(item.src) 
            : createImageElement(item.src);
        
        div.appendChild(mediaElement);
        return div;
    }

    function createVideoElement(src) {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        return video;
    }

    function createImageElement(src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Game media';
        return img;
    }

    function updateCarouselPosition(index) {
        if (isTransitioning) return;
        
        const container = document.querySelector('.carousel-container');
        const items = container.querySelectorAll('.media-item');
        const totalItems = items.length;
        
        // Garantir que o índice esteja dentro dos limites
        if (index < 0) {
            index = totalItems - 1;
        } else if (index >= totalItems) {
            index = 0;
        }

        const itemWidth = items[0].offsetWidth;
        const gap = 20;
        
        isTransitioning = true;
        container.style.transform = `translateX(-${(itemWidth + gap) * index}px)`;
        
        currentMediaIndex = index;
        
        // Remover a flag de transição após a animação
        setTimeout(() => {
            isTransitioning = false;
        }, 300);
    }

    function moveNext() {
        if (!isTransitioning) {
            updateCarouselPosition(currentMediaIndex + 1);
        }
    }

    function movePrev() {
        if (!isTransitioning) {
            updateCarouselPosition(currentMediaIndex - 1);
        }
    }

    function createNavigationButtons() {
        const gallery = document.querySelector('.media-gallery');
        
        gallery.querySelectorAll('.carousel-arrow').forEach(btn => btn.remove());
        
        const prevButton = document.createElement('button');
        const nextButton = document.createElement('button');
        
        prevButton.className = 'carousel-arrow prev';
        nextButton.className = 'carousel-arrow next';
        
        prevButton.innerHTML = '❮';
        nextButton.innerHTML = '❯';
        
        prevButton.addEventListener('click', movePrev);
        nextButton.addEventListener('click', moveNext);
        
        gallery.appendChild(prevButton);
        gallery.appendChild(nextButton);
    }

    function handleKeyNavigation(e) {
        if (e.key === 'ArrowLeft') {
            movePrev();
        } else if (e.key === 'ArrowRight') {
            moveNext();
        }
    }

    document.addEventListener('keydown', handleKeyNavigation);

    // Inicializar
    loadGameDetails();
});