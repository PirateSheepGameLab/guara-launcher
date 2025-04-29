// Função para definir a imagem de fundo
function setBackgroundCoverImage() {
    const mainImage = document.getElementById('mainImage');
    if (mainImage && mainImage.src) {
        document.documentElement.style.setProperty('--game-cover-image', `url('${mainImage.src}')`);
    }
}

// Função para atualizar a imagem/vídeo principal
function updateMainMedia(index, allMedia) {
    const mediaContainer = document.querySelector('.main-media');
    const media = allMedia[index];
    
    mediaContainer.innerHTML = '';
    
    if (media.endsWith('.mp4')) {
        const video = document.createElement('video');
        video.src = media;
        video.controls = true;
        mediaContainer.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = media;
        img.alt = `${game.title} - Imagem ${index + 1}`;
        mediaContainer.appendChild(img);
    }
}

// Função para carregar os detalhes do jogo
async function loadGameDetails() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('id');
        
        const response = await fetch('games.json');
        const games = await response.json();
        const game = games.find(g => g.id === gameId);

        if (!game) {
            console.error('Jogo não encontrado');
            return;
        }

        // Atualizar a imagem de fundo usando a imagem de capa do jogo
        document.documentElement.style.setProperty('--game-cover-image', `url('${game.cover}')`);

        // Atualizar título e informações do jogo
        document.getElementById('gameTitle').textContent = game.title;
        document.getElementById('mainImage').src = game.images[0];
        document.getElementById('mainImage').alt = game.title;
        document.getElementById('gameGenre').textContent = game.genre;
        document.getElementById('gameDescription').textContent = game.description;

        // Configurar o carrossel
        let currentImageIndex = 0;
        const allMedia = [...game.images];
        if (game.videos) {
            allMedia.push(...game.videos);
        }

        function updateMainMedia(index) {
            const mediaContainer = document.querySelector('.main-media');
            const media = allMedia[index];
            
            mediaContainer.innerHTML = '';
            
            if (media && media.endsWith('.mp4')) {
                const video = document.createElement('video');
                video.src = media;
                video.controls = true;
                mediaContainer.appendChild(video);
            } else if (media) {
                const img = document.createElement('img');
                img.src = media;
                img.alt = `${game.title} - Imagem ${index + 1}`;
                mediaContainer.appendChild(img);
            }
        }

        // Configurar botões de navegação
        const prevButton = document.querySelector('.carousel-arrow.prev');
        const nextButton = document.querySelector('.carousel-arrow.next');

        prevButton.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + allMedia.length) % allMedia.length;
            updateMainMedia(currentImageIndex);
        });

        nextButton.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % allMedia.length;
            updateMainMedia(currentImageIndex);
        });

        // Mostrar a primeira imagem
        if (allMedia.length > 0) {
            updateMainMedia(0);
        }

        // Configurar botão de jogar
        const btnPlay = document.querySelector('.btn-play');
        if (btnPlay) {
            btnPlay.addEventListener('click', () => {
                window.location.href = game.url;
            });
        }

    } catch (error) {
        console.error('Erro ao carregar detalhes do jogo:', error);
    }
}

// Chama a função inicialmente para garantir que o fundo seja definido
setBackgroundCoverImage();

// Função para configurar a rolagem das miniaturas
function setupThumbnailScroll() {
    const thumbnailsContainer = document.getElementById('mediaThumbnails');
    const scrollLeftButton = document.querySelector('.thumbnail-arrow.left');
    const scrollRightButton = document.querySelector('.thumbnail-arrow.right');
    const scrollAmount = 200; // Quantidade de pixels para rolar

    scrollLeftButton.addEventListener('click', () => {
        thumbnailsContainer.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    scrollRightButton.addEventListener('click', () => {
        thumbnailsContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Opcional: Esconder setas se não houver scroll
    const checkScroll = () => {
        const maxScrollLeft = thumbnailsContainer.scrollWidth - thumbnailsContainer.clientWidth;
        scrollLeftButton.style.display = thumbnailsContainer.scrollLeft > 0 ? 'flex' : 'none';
        scrollRightButton.style.display = thumbnailsContainer.scrollLeft < maxScrollLeft - 5 ? 'flex' : 'none'; // -5 para margem de erro
    };

    thumbnailsContainer.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll); // Verificar no resize também
    checkScroll(); // Verificar inicialmente
}

// Carregar detalhes do jogo quando a página carregar
document.addEventListener('DOMContentLoaded', loadGameDetails);

// Configurar barra de pesquisa
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = e.target.value.trim();
                if (searchTerm) {
                    window.location.href = `search-results.html?q=${encodeURIComponent(searchTerm)}`;
                }
            }
        });
    }
});