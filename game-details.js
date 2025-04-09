// Função para carregar os detalhes do jogo
async function loadGameDetails() {
    try {
        // Pegar o ID do jogo da URL
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('id');

        // Carregar dados do jogo
        const response = await fetch('games.json');
        const games = await response.json();
        const game = games.find(g => g.id === parseInt(gameId));

        if (!game) {
            console.error('Jogo não encontrado');
            return;
        }

        // Atualizar título e informações do jogo
        document.getElementById('gameTitle').textContent = game.title;
        document.getElementById('mainImage').src = game.background;
        document.getElementById('mainImage').alt = game.title;

        // Preencher miniaturas de mídia
        const mediaThumbnails = document.getElementById('mediaThumbnails');
        mediaThumbnails.innerHTML = '';
        let activeThumbnail = null;

        const updateMainMedia = (element, type) => {
            const mainMediaContainer = document.querySelector('.main-media');
            mainMediaContainer.innerHTML = ''; // Limpa o conteúdo
            if (type === 'image') {
                const img = document.createElement('img');
                img.id = 'mainImage';
                img.src = element;
                img.alt = game.title;
                mainMediaContainer.appendChild(img);
            } else if (type === 'video') {
                const videoEl = document.createElement('video');
                videoEl.id = 'mainVideo';
                videoEl.src = element;
                videoEl.controls = true;
                videoEl.autoplay = true;
                mainMediaContainer.appendChild(videoEl);
            }
        };

        const handleThumbnailClick = (thumbnail, element, type) => {
            if (activeThumbnail) {
                activeThumbnail.classList.remove('active');
            }
            thumbnail.classList.add('active');
            activeThumbnail = thumbnail;
            updateMainMedia(element, type);
        };

        // Adicionar miniaturas de imagens
        game.images.forEach((image, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'media-thumbnail';
            thumbnail.innerHTML = `<img src="${image}" alt="${game.title} - Imagem ${index + 1}">`;
            thumbnail.addEventListener('click', () => handleThumbnailClick(thumbnail, image, 'image'));
            mediaThumbnails.appendChild(thumbnail);
            if (index === 0) { // Define a primeira imagem como ativa inicialmente
                handleThumbnailClick(thumbnail, image, 'image');
            }
        });

        // Adicionar miniaturas de vídeos
        game.videos.forEach((video) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'media-thumbnail video';
            // Usar a imagem de fundo do jogo como poster temporário
            thumbnail.innerHTML = `
                <img src="${game.background}" alt="Video Thumbnail">
                <div class="video-overlay"><i class="fas fa-play"></i></div>
            `;
            thumbnail.addEventListener('click', () => handleThumbnailClick(thumbnail, video, 'video'));
            mediaThumbnails.appendChild(thumbnail);
        });

        // Configurar botão de jogar
        const btnPlay = document.querySelector('.btn-play');
        btnPlay.addEventListener('click', () => {
            window.location.href = game.url;
        });

        // Funcionalidade das setas de rolagem das miniaturas
        setupThumbnailScroll();

    } catch (error) {
        console.error('Erro ao carregar detalhes do jogo:', error);
    }
}

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