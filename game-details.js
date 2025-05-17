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
                
                // Add status bar with carousel
                const mediaContent = [...(game.images || []), ...(game.videos || [])];
                if (mediaContent.length > 0) {
                    const statusBar = document.createElement('div');
                    statusBar.className = 'status-bar';
                    
                    const carouselContainer = document.createElement('div');
                    carouselContainer.className = 'carousel-container';
                    
                    const carouselContent = document.createElement('div');
                    carouselContent.className = 'carousel-content';
                    
                    // Add media items
                    mediaContent.forEach((media, index) => {
                        const item = document.createElement('div');
                        item.className = 'carousel-item';
                        
                        if (media.endsWith('.mp4')) {
                            const video = document.createElement('video');
                            video.src = media;
                            video.controls = true;
                            item.appendChild(video);
                        } else {
                            const img = document.createElement('img');
                            img.src = media;
                            img.alt = `${game.title} - Image ${index + 1}`;
                            item.appendChild(img);
                        }
                        
                        carouselContent.appendChild(item);
                    });
                    
                    // Add controls
                    const controls = document.createElement('div');
                    controls.className = 'carousel-controls';
                    
                    const prevButton = document.createElement('button');
                    prevButton.className = 'carousel-button';
                    prevButton.innerHTML = '❮';
                    prevButton.onclick = () => moveCarousel(-1);
                    
                    const nextButton = document.createElement('button');
                    nextButton.className = 'carousel-button';
                    nextButton.innerHTML = '❯';
                    nextButton.onclick = () => moveCarousel(1);
                    
                    controls.appendChild(prevButton);
                    controls.appendChild(nextButton);
                    
                    // Add dots
                    const dots = document.createElement('div');
                    dots.className = 'carousel-dots';
                    mediaContent.forEach((_, index) => {
                        const dot = document.createElement('span');
                        dot.className = `carousel-dot${index === 0 ? ' active' : ''}`;
                        dot.onclick = () => goToSlide(index);
                        dots.appendChild(dot);
                    });
                    
                    carouselContainer.appendChild(carouselContent);
                    carouselContainer.appendChild(controls);
                    carouselContainer.appendChild(dots);
                    statusBar.appendChild(carouselContainer);
                    
                    // Insert status bar after the game title
                    const gameTitle = document.getElementById('gameTitle');
                    gameTitle.parentNode.insertBefore(statusBar, gameTitle.nextSibling);
                    
                    // Carousel functionality
                    let currentSlide = 0;
                    
                    function moveCarousel(direction) {
                        const totalSlides = mediaContent.length;
                        currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
                        updateCarousel();
                    }
                    
                    function goToSlide(index) {
                        currentSlide = index;
                        updateCarousel();
                    }
                    
                    function updateCarousel() {
                        carouselContent.style.transform = `translateX(-${currentSlide * 100}%)`;
                        
                        // Update dots
                        const dots = document.querySelectorAll('.carousel-dot');
                        dots.forEach((dot, index) => {
                            dot.classList.toggle('active', index === currentSlide);
                        });
                        
                        // Pause all videos except the current one
                        const videos = carouselContent.querySelectorAll('video');
                        videos.forEach((video, index) => {
                            if (index === currentSlide) {
                                video.play().catch(() => {}); // Ignore autoplay errors
                            } else {
                                video.pause();
                            }
                        });
                    }
                    
                    // Auto-advance carousel every 5 seconds
                    const autoAdvanceInterval = setInterval(() => {
                        if (!document.querySelector('.carousel-content:hover')) {
                            moveCarousel(1);
                        }
                    }, 5000);
                    
                    // Clean up interval when leaving the page
                    window.addEventListener('beforeunload', () => {
                        clearInterval(autoAdvanceInterval);
                    });
                }
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