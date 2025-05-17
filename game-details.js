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
                
                loadMediaFromGame(game);
            }
        } catch (error) {
            console.error('Error loading game details:', error);
        }
    }

    function loadMediaFromGame(game) {
        const mediaItems = [
            ...(game.images || []).map(src => ({ type: 'image', src })),
            ...(game.videos || []).map(src => ({ type: 'video', src }))
        ];

        if (mediaItems.length === 0) {
            mediaItems.push({ type: 'image', src: game.cover });
        }

        const container = document.querySelector('.carousel-container');
        container.innerHTML = '';

        mediaItems.forEach(item => {
            const mediaElement = createMediaItem(item);
            container.appendChild(mediaElement);
        });

        setupCarouselNavigation();
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

    function setupCarouselNavigation() {
        const container = document.querySelector('.carousel-container');
        const prevButton = document.querySelector('.carousel-arrow.prev');
        const nextButton = document.querySelector('.carousel-arrow.next');

        // Function to update navigation visibility
        const updateNavigation = () => {
            const hasScrollLeft = container.scrollLeft > 0;
            const hasScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);

            container.classList.toggle('has-more-left', hasScrollLeft);
            container.classList.toggle('has-more-right', hasScrollRight);
        };        // Function to handle scrolling
        const scroll = (direction) => {
            const items = Array.from(container.querySelectorAll('.media-item'));
            const currentScroll = container.scrollLeft;
            
            // Find the current visible item
            const itemWidth = items[0].offsetWidth + 20; // width + gap
            const currentIndex = Math.round(currentScroll / itemWidth);
            
            // Calculate target index
            let targetIndex = currentIndex + direction;
            
            // Handle bounds
            if (targetIndex < 0) {
                targetIndex = items.length - 1;
            } else if (targetIndex >= items.length) {
                targetIndex = 0;
            }
            
            // Calculate target scroll position
            const targetScroll = targetIndex * itemWidth;

            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        };

        // Add click handlers for navigation buttons
        prevButton.addEventListener('click', () => scroll(-1));
        nextButton.addEventListener('click', () => scroll(1));

        // Update navigation on scroll and resize
        container.addEventListener('scroll', updateNavigation);
        window.addEventListener('resize', updateNavigation);

        // Initialize navigation state
        requestAnimationFrame(updateNavigation);
    }

    function handleKeyNavigation(e) {
        if (e.key === 'ArrowLeft') {
            document.querySelector('.carousel-arrow.prev').click();
        } else if (e.key === 'ArrowRight') {
            document.querySelector('.carousel-arrow.next').click();
        }
    }

    document.addEventListener('keydown', handleKeyNavigation);

    // Initialize
    loadGameDetails();
});