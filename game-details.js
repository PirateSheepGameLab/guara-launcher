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
            
            if (!gameId) {
                throw new Error('ID do jogo não fornecido');
            }

            // Tenta carregar o games.json usando caminho relativo
            let games;
            try {
                const response = await fetch('games.json');
                games = await response.json();
            } catch (e) {
                // Se falhar, tenta com caminho absoluto
                const response = await fetch('/games.json');
                games = await response.json();
            }

            const game = games.find(g => g.id === gameId);
            
            if (!game) {
                throw new Error('Jogo não encontrado');
            }

            // Se chegou aqui, o jogo foi encontrado e podemos atualizar a interface
            document.getElementById('gameTitle').textContent = game.title;
            document.getElementById('gameDescription').textContent = game.description;
            
            // Atualiza o background
            document.documentElement.style.setProperty('--game-cover-image', `url('${game.background}')`);
            
            // Atualiza as estatísticas do jogo
            updateGameStats(game);
            
            // Carrega a mídia do jogo
            loadMediaFromGame(game);
            
            // Remove qualquer mensagem de erro existente
            const existingError = document.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }

            await updateGameButtonState(game);

        } catch (error) {
            console.error('Error loading game details:', error);
            // Mostrar mensagem de erro apenas em caso de erro real
            if (error.message === 'ID do jogo não fornecido') {
                showError('ID do jogo não fornecido na URL');
            } else if (error.message === 'Jogo não encontrado') {
                showError('O jogo solicitado não foi encontrado');
            } else {
                showError('Erro ao carregar detalhes do jogo. Por favor, tente novamente.');
            }
        }
    }

    function updateGameStats(game) {
        // Atualiza o tempo de jogo (exemplo)
        const playTimeElement = document.getElementById('statPlayTime');
        if (playTimeElement) {
            playTimeElement.textContent = game.playTime || '0h';
        }

        // Atualiza a última sessão (exemplo)
        const lastSessionElement = document.getElementById('statLastSession');
        if (lastSessionElement) {
            lastSessionElement.textContent = game.lastPlayed || 'Nunca jogado';
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
        if (!container) return;

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

    function showError(message) {
        // Remove existing error if present
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create error message elements
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';

        const icon = document.createElement('span');
        icon.className = 'error-icon';
        icon.textContent = '⚠️';

        const content = document.createElement('span');
        content.className = 'error-content';
        content.textContent = message;

        const closeButton = document.createElement('button');
        closeButton.className = 'error-close';
        closeButton.innerHTML = '×';
        closeButton.onclick = () => errorDiv.remove();

        // Assemble error message
        errorDiv.appendChild(icon);
        errorDiv.appendChild(content);
        errorDiv.appendChild(closeButton);

        // Add to document
        document.body.insertBefore(errorDiv, document.body.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    async function updateGameButtonState(game) {
        const gamesPath = localStorage.getItem('gamesPath');
        if (!gamesPath) {
            const playButton = document.querySelector('.btn-play');
            playButton.textContent = 'Download';
            playButton.onclick = () => {
                showError('Por favor, configure a pasta de jogos nas configurações primeiro.');
            };
            return;
        }

        try {
            const gameExists = await window.electron.fileSystem.checkGameExists(gamesPath, game.title);
            const playButton = document.querySelector('.btn-play');

            if (gameExists) {
                // Game is already downloaded
                playButton.textContent = 'Jogar';
                playButton.disabled = false;
                playButton.onclick = async () => {
                    try {
                        const gamePath = `${gamesPath}\\${game.title}`;
                        const result = await window.electron.fileSystem.findAndRunExe(gamePath);
                        console.log(`Jogo iniciado: ${result.exeName}`);
                    } catch (error) {
                        showError(`Erro ao iniciar o jogo: ${error.message}`);
                        console.error('Erro ao iniciar o jogo:', error);
                    }
                };
            } else {
                // Game needs to be downloaded
                playButton.textContent = 'Download';
                playButton.disabled = false;
                playButton.onclick = async () => {
                    try {
                        await downloadAndExtractGame(game);
                        await updateGameButtonState(game); // Recheck after download
                    } catch (error) {
                        showError('Erro ao baixar o jogo. Por favor, tente novamente.');
                        console.error('Download error:', error);
                    }
                };
            }
        } catch (error) {
            console.error('Error checking game:', error);
            showError('Erro ao verificar o estado do jogo.');
        }
    }

    async function downloadAndExtractGame(game) {
        const gamesPath = localStorage.getItem('gamesPath');
        if (!gamesPath) {
            showError('Por favor, configure a pasta de jogos nas configurações primeiro.');
            return;
        }

        const playButton = document.querySelector('.btn-play');
        const originalText = playButton.textContent;
        
        // Criar barra de progresso
        const progressBar = document.createElement('div');
        progressBar.className = 'download-progress';
        progressBar.innerHTML = `
            <div class="progress-bar">
                <div class="progress" style="width: 0%"></div>
            </div>
            <div class="progress-text">0%</div>
        `;
        playButton.parentElement.insertBefore(progressBar, playButton.nextSibling);
        
        try {
            const zipPath = `${gamesPath}\\${game.title}.zip`;
            const gameFolderPath = `${gamesPath}\\${game.title}`;

            console.log(`Iniciando download do jogo ${game.title}`);
            console.log(`Pasta de destino: ${gamesPath}`);
            console.log(`Arquivo ZIP: ${zipPath}`);

            playButton.textContent = 'Baixando...';
            playButton.disabled = true;

            await window.electron.fileSystem.createDirectory(gamesPath);

            const response = await fetch(game.url);
            if (!response.ok) {
                throw new Error(`Falha ao baixar o jogo. Status: ${response.status}`);
            }

            const contentLength = response.headers.get('content-length');
            const totalSize = parseInt(contentLength, 10);
            let downloadedSize = 0;

            const reader = response.body.getReader();
            const chunks = [];

            while (true) {
                const {done, value} = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                downloadedSize += value.length;
                
                // Atualizar progresso do download
                const progress = (downloadedSize / totalSize) * 100;
                progressBar.querySelector('.progress').style.width = `${progress}%`;
                progressBar.querySelector('.progress-text').textContent = `${Math.round(progress)}% (${(downloadedSize / 1024 / 1024).toFixed(2)}MB / ${(totalSize / 1024 / 1024).toFixed(2)}MB)`;
            }

            console.log('Download concluído, salvando arquivo...');
            const blob = new Blob(chunks);
            const arrayBuffer = await blob.arrayBuffer();
            
            playButton.textContent = 'Extraindo...';
            progressBar.querySelector('.progress-text').textContent = 'Extraindo arquivos...';

            await window.electron.fileSystem.writeFile(zipPath, arrayBuffer);
            console.log('Arquivo ZIP salvo com sucesso');

            console.log('Extraindo arquivos...');
            await window.electron.fileSystem.extractZip(zipPath, gameFolderPath);
            console.log('Arquivos extraídos com sucesso');

            console.log('Removendo arquivo ZIP...');
            await window.electron.fileSystem.deleteFile(zipPath);
            console.log('ZIP removido');

            // Remover barra de progresso
            progressBar.remove();
            
            playButton.textContent = 'Jogar';
            playButton.disabled = false;
            playButton.onclick = () => {
                console.log(`Iniciando o jogo: ${game.title}`);
                // Aqui você pode adicionar a lógica para executar o jogo
            };
            
            console.log(`Jogo ${game.title} instalado com sucesso em: ${gameFolderPath}`);
            
        } catch (error) {
            console.error(`Erro ao baixar ou extrair o jogo ${game.title}:`, error);
            showError(`Erro ao baixar o jogo: ${error.message}`);
            
            progressBar.remove();
            playButton.disabled = false;
            playButton.textContent = originalText;
        }
    }

    // Inicializar
    loadGameDetails();
});