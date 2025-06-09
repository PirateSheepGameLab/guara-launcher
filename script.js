// Função para carregar as seções do JSON
async function loadSections() {
    try {
        const [sectionsResponse, gamesResponse] = await Promise.all([
            fetch('home-sections.json'),
            fetch('games.json')
        ]);

        if (!sectionsResponse.ok || !gamesResponse.ok) {
            throw new Error('Erro ao carregar os dados');
        }

        const sections = await sectionsResponse.json();
        const games = await gamesResponse.json();

        // Cria um mapa de jogos para acesso rápido
        const gamesMap = new Map(games.map(game => [game.id, game]));

        // Limpa o conteúdo existente
        const homeSection = document.querySelector('#home');
        homeSection.innerHTML = ''; // Clear all content

        // Renderiza cada seção do home-sections.json
        sections.sections.forEach(section => {
            renderSection(section, gamesMap);
        });

        // Inicializa os carrosséis e outros componentes interativos
        initializeInteractiveComponents();
    } catch (error) {
        console.error('Erro ao carregar as seções:', error);
        showError('Erro ao carregar as seções. Por favor, tente novamente mais tarde.');
    }
}

// Função para inicializar componentes interativos
function initializeInteractiveComponents() {
    // Inicializa os controles de scroll horizontal
    const scrollContainers = document.querySelectorAll('.games-grid');
    
    scrollContainers.forEach(container => {
        const prevBtn = container.querySelector('.section-nav.prev');
        const nextBtn = container.querySelector('.section-nav.next');
        
        if (prevBtn && nextBtn) {
            // Mostra/esconde botões baseado no scroll inicial
            prevBtn.style.opacity = container.scrollLeft > 0 ? '1' : '0';
            nextBtn.style.opacity = 
                container.scrollLeft < (container.scrollWidth - container.clientWidth) 
                ? '1' : '0';

            // Event listeners para scroll
            container.addEventListener('scroll', () => {
                prevBtn.style.opacity = container.scrollLeft > 0 ? '1' : '0';
                nextBtn.style.opacity = 
                    container.scrollLeft < (container.scrollWidth - container.clientWidth) 
                    ? '1' : '0';
            });
        }
    });

    // Inicializa animações de hover nos cards
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const info = card.querySelector('.game-card-info');
            if (info) {
                info.style.transform = 'translateY(0)';
            }
        });

        card.addEventListener('mouseleave', () => {
            const info = card.querySelector('.game-card-info');
            if (info) {
                info.style.transform = 'translateY(100%)';
            }
        });
    });
}

// Função para renderizar uma seção
function renderSection(section, gamesMap) {
    const homeSection = document.querySelector('#home');
    if (!homeSection) return;

    const sectionElement = document.createElement('section');
    sectionElement.className = section.id;
    
    if (section.type === 'featured') {
        // Criar o carrossel
        const carousel = document.createElement('div');
        carousel.className = 'featured-carousel';
        
        // Container para os itens
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'featured-items';
        
        // Adiciona os itens
        section.items.forEach((item, index) => {
            const featuredItem = document.createElement('div');
            featuredItem.className = `featured-item ${index === 0 ? 'active' : ''}`;
            featuredItem.setAttribute('data-index', index);

            if (item.type === 'game') {
                const game = gamesMap.get(item.id);
                if (!game) return;

                featuredItem.innerHTML = `
                    <div class="featured-game" data-game-id="${game.id}">
                        <img src="${game.background}" alt="${game.title}">
                        <div class="game-info">
                            <h3>${game.title}</h3>
                            <p>${game.description}</p>
                            <div class="tags">
                                ${game.genre.split(', ').map(genre => `<span>${genre}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                `;

                featuredItem.querySelector('.featured-game').addEventListener('click', () => {
                    showGameDetails(game.id, gamesMap);
                });
            } else if (item.type === 'advertisement') {
                featuredItem.innerHTML = `
                    <div class="featured-game featured-ad">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="game-info">
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                            <a href="${item.cta.link}" class="cta-button" target="_blank" rel="noopener noreferrer">${item.cta.text}</a>
                        </div>
                    </div>
                `;

                // Adiciona event listener específico para o anúncio
                const adElement = featuredItem.querySelector('.featured-ad');
                const ctaButton = adElement.querySelector('.cta-button');
                
                adElement.addEventListener('click', (e) => {
                    // Se o clique não foi no botão CTA, abre o link em nova aba
                    if (!e.target.closest('.cta-button')) {
                        e.preventDefault();
                        window.open(item.cta.link, '_blank', 'noopener,noreferrer');
                    }
                });
            }
            
            itemsContainer.appendChild(featuredItem);
        });

        // Adiciona botões de navegação
        const prevButton = document.createElement('button');
        prevButton.className = 'carousel-nav prev';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';

        const nextButton = document.createElement('button');
        nextButton.className = 'carousel-nav next';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';

        // Adiciona indicadores
        const indicators = document.createElement('div');
        indicators.className = 'carousel-indicators';
        section.items.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('data-index', index);
            indicators.appendChild(indicator);
        });

        carousel.appendChild(prevButton);
        carousel.appendChild(nextButton);
        carousel.appendChild(itemsContainer);
        carousel.appendChild(indicators);
        sectionElement.appendChild(carousel);

        // Configuração do carrossel
        let currentIndex = 0;
        let autoRotateInterval;
        const items = itemsContainer.querySelectorAll('.featured-item');
        const dots = indicators.querySelectorAll('.indicator');

        const updateCarousel = (newIndex) => {
            // Remove classes ativas
            items.forEach(item => {
                item.classList.remove('active', 'next', 'prev');
            });
            dots.forEach(dot => dot.classList.remove('active'));

            // Adiciona classes ativas
            currentIndex = newIndex;
            items[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');

            // Adiciona classes para animação
            const prevIndex = (currentIndex - 1 + items.length) % items.length;
            const nextIndex = (currentIndex + 1) % items.length;
            items[prevIndex].classList.add('prev');
            items[nextIndex].classList.add('next');
        };

        const startAutoRotate = () => {
            stopAutoRotate();
            autoRotateInterval = setInterval(() => {
                const nextIndex = (currentIndex + 1) % items.length;
                updateCarousel(nextIndex);
            }, 5000);
        };

        const stopAutoRotate = () => {
            if (autoRotateInterval) {
                clearInterval(autoRotateInterval);
            }
        };

        // Event Listeners
        prevButton.addEventListener('click', () => {
            const prevIndex = (currentIndex - 1 + items.length) % items.length;
            updateCarousel(prevIndex);
            stopAutoRotate();
            startAutoRotate();
        });

        nextButton.addEventListener('click', () => {
            const nextIndex = (currentIndex + 1) % items.length;
            updateCarousel(nextIndex);
            stopAutoRotate();
            startAutoRotate();
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                updateCarousel(index);
                stopAutoRotate();
                startAutoRotate();
            });
        });

        carousel.addEventListener('mouseenter', stopAutoRotate);
        carousel.addEventListener('mouseleave', startAutoRotate);

        // Inicia o carrossel
        updateCarousel(0);
        startAutoRotate();
    } else if (section.type === 'grid') {
        // Adiciona o título da seção
        sectionElement.innerHTML = `<h2>${section.title}</h2>`;
        
        // Cria o container da grid
        const grid = document.createElement('div');
        grid.className = 'games-grid';

        // Adiciona os jogos
        const sectionGames = section.gameIds
            .map(id => gamesMap.get(id))
            .filter(game => game !== undefined);

        if (sectionGames.length > 0) {
            // Adiciona botões de navegação
            const prevButton = document.createElement('button');
            prevButton.className = 'section-nav prev hidden';
            prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
            
            const nextButton = document.createElement('button');
            nextButton.className = 'section-nav next';
            nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';

            // Adiciona os cards de jogos
            sectionGames.forEach(game => {
                const card = document.createElement('div');
                card.className = 'game-card';
                card.innerHTML = `
                    <img src="${game.cover}" alt="${game.title}">
                    <div class="game-card-info">
                        <h3>${game.title}</h3>
                        <p>${game.description}</p>
                        <div class="tags">
                            ${game.genre.split(', ').map(genre => `<span>${genre}</span>`).join('')}
                        </div>
                    </div>
                `;

                card.addEventListener('click', () => {
                    showGameDetails(game.id, gamesMap);
                });

                grid.appendChild(card);
            });

            // Função para atualizar a visibilidade dos botões de navegação
            const updateNavigation = () => {
                const hasScrollLeft = grid.scrollLeft > 0;
                const hasScrollRight = grid.scrollLeft < (grid.scrollWidth - grid.clientWidth);

                prevButton.classList.toggle('hidden', !hasScrollLeft);
                nextButton.classList.toggle('hidden', !hasScrollRight);

                grid.classList.toggle('has-more-left', hasScrollLeft);
                grid.classList.toggle('has-more-right', hasScrollRight);
            };            // Calcula o tamanho do scroll baseado no tamanho dos cards
            const scrollAmount = 175 + 20; // largura do card + gap

            // Adiciona event listeners para navegação
            prevButton.addEventListener('click', () => {
                grid.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            });

            nextButton.addEventListener('click', () => {
                grid.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });

            // Atualiza a navegação quando o scroll acontece
            grid.addEventListener('scroll', updateNavigation);

            // Atualiza a navegação quando o tamanho da janela muda
            window.addEventListener('resize', updateNavigation);

            sectionElement.appendChild(prevButton);
            sectionElement.appendChild(grid);
            sectionElement.appendChild(nextButton);

            // Inicializa o estado da navegação
            requestAnimationFrame(updateNavigation);
        }
    }

    homeSection.appendChild(sectionElement);
}

// Função para rolar a seção
function scrollSection(element, amount) {
    element.scrollBy({
        left: amount,
        behavior: 'smooth'
    });
}

// Função para renderizar seção em grid
function renderGridSection(container, games) {
    const grid = document.createElement('div');
    grid.className = 'games-grid';

    games.forEach(game => {
        const card = createGameCard(game);
        grid.appendChild(card);
    });

    container.appendChild(grid);
}

// Função para renderizar seção ranqueada
function renderRankedSection(container, games) {
    const rankedList = document.createElement('div');
    rankedList.className = 'top-games';

    games.forEach((game, index) => {
        const rankedGame = createRankedGame(game, index + 1);
        rankedList.appendChild(rankedGame);
    });

    container.appendChild(rankedList);
}

// Função para criar card de jogo
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
        <img src="${game.cover}" alt="${game.title}">
        <div class="game-card-info">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            <div class="tags">
                ${game.genre.split(', ').map(genre => `<span>${genre}</span>`).join('')}
            </div>
        </div>
    `;    card.addEventListener('click', () => {
        showGameDetails(game.id);
    });

    return card;
}

// Função para criar jogo ranqueado
function createRankedGame(game, rank) {
    const rankedGame = document.createElement('div');
    rankedGame.className = 'game-rank';
    rankedGame.innerHTML = `
        <span class="rank">${rank}</span>
        <img src="${game.cover}" alt="${game.title}">
        <div class="game-info">
            <h3>${game.title}</h3>
            <div class="tags">
                ${game.genre.split(', ').slice(0, 2).map(genre => `<span>${genre}</span>`).join('')}
            </div>
        </div>
    `;    rankedGame.addEventListener('click', () => {
        showGameDetails(game.id);
    });

    return rankedGame;
}

// Função para mostrar erro - apenas loga no console
function showError(message) {
    console.error('[Debug]:', message);
}

// Carregar as seções quando a página carregar
document.addEventListener('DOMContentLoaded', loadSections);

// Funcionalidade de busca
const searchInput = document.querySelector('.search input');
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

// DOM Elements
const gamesGrid = document.querySelector('.games-grid');
const genreCheckboxes = document.querySelectorAll('.genre-list input');
const tags = document.querySelectorAll('.tag');
const topGamesContainer = document.querySelector('.top-games');

// Populate games grid
function populateGames(gamesArray = games) {
    gamesGrid.innerHTML = '';
    gamesArray.forEach(game => {
        gamesGrid.appendChild(createGameCard(game));
    });
}

// Populate top 10 monthly
function populateTopGames() {
    topGamesContainer.innerHTML = '';
    const sortedGames = [...games].sort((a, b) => b.plays - a.plays);
    sortedGames.slice(0, 10).forEach((game, index) => {
        topGamesContainer.appendChild(createRankedGame(game, index + 1));
    });
}

// Genre filter functionality
genreCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const selectedGenres = Array.from(genreCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.nextElementSibling.textContent.toLowerCase());
        
        const filteredGames = selectedGenres.length > 0
            ? games.filter(game => 
                game.tags.some(tag => 
                    selectedGenres.includes(tag.toLowerCase())
                )
            )
            : games;
        
        populateGames(filteredGames);
    });
});

// Tag filter functionality
tags.forEach(tag => {
    tag.addEventListener('click', () => {
        const tagText = tag.textContent.toLowerCase();
        const filteredGames = games.filter(game =>
            game.tags.some(gameTag => gameTag.toLowerCase() === tagText)
        );
        populateGames(filteredGames);
        
        // Toggle active state
        tags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
    });
});

// Navigation functionality
const navItems = document.querySelectorAll('.main-nav li');
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // Prevenir o comportamento padrão apenas se o clique não foi em um link
        if (!e.target.closest('a')) {
            e.preventDefault();
        }
        
        // Remover a classe active de todos os itens
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Adicionar a classe active ao item clicado
        item.classList.add('active');
    });
});

// Event listener for navigation items
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    // Load home sections when the page loads
    if (document.querySelector('#home.content-section.active')) {
        loadSections();
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');
            
            // Remove active class from all nav items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav item and corresponding section
            item.classList.add('active');
            document.getElementById(targetSection).classList.add('active');

            // Load home sections if home is clicked
            if (targetSection === 'home') {
                loadSections();
            }
        });
    });
});

// Navegação entre seções
document.addEventListener('DOMContentLoaded', () => {
    // Controle de navegação do menu
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active de todos os itens e seções
            navItems.forEach(i => i.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Adiciona active ao item clicado e sua seção correspondente
            item.classList.add('active');
            const sectionId = item.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Controle de scroll horizontal nas seções de jogos
    const scrollContainers = document.querySelectorAll('.games-grid');
    
    scrollContainers.forEach(container => {
        const prevBtn = container.querySelector('.section-nav.prev');
        const nextBtn = container.querySelector('.section-nav.next');
        
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                container.scrollBy({
                    left: -300,
                    behavior: 'smooth'
                });
            });

            nextBtn.addEventListener('click', () => {
                container.scrollBy({
                    left: 300,
                    behavior: 'smooth'
                });
            });

            // Mostrar/esconder botões baseado no scroll
            container.addEventListener('scroll', () => {
                prevBtn.style.opacity = container.scrollLeft > 0 ? '1' : '0';
                nextBtn.style.opacity = 
                    container.scrollLeft < (container.scrollWidth - container.clientWidth) 
                    ? '1' : '0';
            });
        }
    });

    // Controle da barra de pesquisa
    const searchInput = document.querySelector('.search input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            // Implementar lógica de pesquisa aqui
        });
    }

    // Toggle switches nas configurações
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const setting = e.target.closest('li').querySelector('span').textContent;
            console.log(`${setting} foi ${e.target.checked ? 'ativado' : 'desativado'}`);
            // Implementar lógica de salvamento da configuração
        });
    });

    // Seletor de pasta
    const folderSelect = document.querySelector('.btn-select-folder');
    const folderInput = document.querySelector('.folder-select input');
    if (folderSelect) {
        folderSelect.addEventListener('click', async () => {
            if (window.electronAPI && window.electronAPI.selectFolder) {
                const folderPath = await window.electronAPI.selectFolder();
                if (folderPath && folderInput) {
                    folderInput.value = folderPath;
                    localStorage.setItem('gameInstallFolder', folderPath);
                }
            } else if (window.require) {
                // Fallback para contextIsolation: false
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.invoke('select-folder').then(folderPath => {
                    if (folderPath && folderInput) {
                        folderInput.value = folderPath;
                        localStorage.setItem('gameInstallFolder', folderPath);
                    }
                });
            } else {
                alert('Seleção de pasta não suportada neste ambiente.');
            }
        });
    }

    // Preencher o input da pasta com o valor salvo ao abrir a tela
    if (folderInput) {
        const savedFolder = localStorage.getItem('gameInstallFolder');
        if (savedFolder) {
            folderInput.value = savedFolder;
        }
        // Sempre que o usuário digitar/colar manualmente, salva no localStorage
        folderInput.addEventListener('input', (e) => {
            localStorage.setItem('gameInstallFolder', e.target.value);
        });
    }

    // Animação de hover nos cards de jogos
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const info = card.querySelector('.game-card-info');
            if (info) {
                info.style.transform = 'translateY(0)';
            }
        });

        card.addEventListener('mouseleave', () => {
            const info = card.querySelector('.game-card-info');
            if (info) {
                info.style.transform = 'translateY(100%)';
            }
        });
    });
});

// Função para carregar conteúdo dinamicamente (exemplo)
async function loadGames(section) {
    try {
        // Aqui você implementaria a lógica para carregar os jogos
        // Por exemplo, fazendo uma requisição para sua API
        const response = await fetch(`/api/games/${section}`);
        const games = await response.json();
        
        // Renderizar os jogos na seção apropriada
        const container = document.querySelector(`#${section} .games-grid`);
        if (container) {
            container.innerHTML = games.map(game => `
                <div class="game-card">
                    <img src="${game.image}" alt="${game.title}">
                    <div class="game-card-info">
                        <h3>${game.title}</h3>
                        <p>${game.description}</p>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar jogos:', error);
    }
}

// Função para inicializar o carrossel de destaques
function initFeaturedCarousel() {
    const carousel = document.querySelector('.featured-carousel');
    if (!carousel) return;

    let currentSlide = 0;
    const slides = carousel.querySelectorAll('.featured-item');
    const indicators = carousel.querySelectorAll('.indicator');

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
    }

    // Auto-play do carrossel
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 5000);

    // Click nos indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
}

// Função para mostrar os detalhes do jogo
async function showGameDetails(gameId) {
    try {
        // Esconde todas as seções
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.classList.remove('active'));

        // Mostra a seção de detalhes
        const gameDetailsSection = document.getElementById('game-details');
        gameDetailsSection.classList.add('active');

        // Carrega os dados do jogo
        const response = await fetch('games.json');
        const games = await response.json();
        const game = games.find(g => g.id === gameId);

        if (!game) {
            throw new Error('Jogo não encontrado');
        }        // Prepara os dados do carrossel
        const mediaContent = [...(game.images || []), ...(game.videos || [])];
        
        // Atualiza o conteúdo
        const gameContent = gameDetailsSection.querySelector('.game-content');        
        gameContent.innerHTML = `              <div class="game-header">
                <div class="title-play-container">                    
                    <h1 id="gameTitle">${game.title}</h1>
                    <div class="header-actions">
                        <button class="btn-play">Jogar</button>
                        <button class="btn-favorite"><i class="fas fa-heart"></i></button>
                        <button class="btn-settings"><i class="fas fa-cog"></i></button>
                    </div>
                </div>            
        </div>            
        <div class="status-bar">
            <button class="carousel-nav prev"><i class="fas fa-chevron-left"></i></button>
            <div class="images-container">
                ${mediaContent.map((media, index) => `
                    <div class="image-item">
                        ${media.endsWith('.mp4') 
                            ? `<video src="${media}" controls></video>`
                            : `<img src="${media}" alt="${game.title} - Image ${index + 1}">`
                        }
                    </div>
                `).join('')}
            </div>
            <button class="carousel-nav next"><i class="fas fa-chevron-right"></i></button>
        </div>

            <div class="game-info-btns"> 
                <div class="left-content">
                    <div class="stat-box">
                        <span class="label">Tempo de Jogo</span>
                        <span class="value" id="statPlayTime">1h 45min</span>
                    </div>
                    <div class="stat-box">
                        <span class="label">Última Sessão</span>
                        <span class="value" id="statLastSession">${new Date(game.lastPlayed).toLocaleDateString()}</span>                    
                    </div>  
                </div>
                <div class="right-content">
                </div>      
            </div>            <div class="game-info-sections">
                <div class="game-info-left">
                    <section class="description-section">
                        <h2>Sobre o Jogo</h2>
                        <div class="description-content">
                            <p id="gameDescription" class="game-description">
                                ${game.description}
                            </p>
                        </div>
                    </section>                    <section class="studio-section">
                        <h2>Informações do Jogo</h2>                        <div class="studio-info">
                            <div class="studio-logo">
                                <img src="${game.studio?.logo || 'assets/default-studio.png'}" alt="${game.studio?.name} logo">
                            </div>
                            <div class="studio-details">
                                <div class="studio-name">
                                    <span class="metadata-label">Desenvolvedora:</span>
                                    <span>${game.studio?.name || 'Desenvolvedor'}</span>
                                </div>
                                ${game.publisher ? `
                                <div class="studio-publisher">
                                    <span class="metadata-label">Publisher:</span>
                                    <span>${game.publisher}</span>
                                </div>` : ''}
                            </div>
                        </div>
                        <div class="game-metadata">
                            <div class="metadata-item">
                                <span class="metadata-label">Gêneros</span>
                                <div class="metadata-content">
                                    <div class="genre-tags">
                                        ${game.genre.split(', ').map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                            <div class="metadata-item">
                                <span class="metadata-label">Data de Lançamento</span>
                                <div class="metadata-content">
                                    ${new Date(game.releaseDate || Date.now()).toLocaleDateString('pt-BR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                    ${game.version ? `<br><span class='metadata-label'>Versão:</span> <span>${game.version}</span>` : ''}
                                </div>
                            </div>
                            <div class="metadata-item">
                                <span class="metadata-label">Plataformas</span>
                                <div class="metadata-content">
                                    <div class="platforms">
                                        ${game.platforms.includes('windows') ? '<i class="fab fa-windows platform-icon" title="Windows"></i>' : ''}
                                        ${game.platforms.includes('linux') ? '<i class="fab fa-linux platform-icon" title="Linux"></i>' : ''}
                                        ${game.platforms.includes('mac') ? '<i class="fab fa-apple platform-icon" title="MacOS"></i>' : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="metadata-item">
                                <span class="metadata-label">Requisitos Mínimos</span>
                                <div class="metadata-content">
                                    <div class="requeriments-grid" id="requerimentsGrid">
                                        ${game.requirements ? `
                                        <ul>
                                            ${game.requirements.processor ? `<li><strong>Processador:</strong> ${game.requirements.processor}</li>` : ''}
                                            ${game.requirements.memory ? `<li><strong>Memória:</strong> ${game.requirements.memory}</li>` : ''}
                                            ${game.requirements.graphics ? `<li><strong>Placa de Vídeo:</strong> ${game.requirements.graphics}</li>` : ''}
                                            ${game.requirements.storage ? `<li><strong>Armazenamento:</strong> ${game.requirements.storage}</li>` : ''}
                                            ${game.requirements.os ? `<li><strong>Sistema:</strong> ${game.requirements.os}</li>` : ''}
                                        </ul>
                                        ` : `
                                        <ul>
                                            <li><strong>Processador:</strong> Intel Core i3 ou equivalente</li>
                                            <li><strong>Memória:</strong> 8 GB de RAM</li>
                                            <li><strong>Placa de Vídeo:</strong> Integrada</li>
                                            <li><strong>Armazenamento:</strong> 2 GB</li>
                                            <li><strong>Sistema:</strong> Windows 10/11 (64-bit)</li>
                                        </ul>
                                        `}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <div class="game-info-right">
                    <section class="achievements-section">
                        <h2>Conquistas</h2>
                        <div class="coming-soon-text">EM BREVE</div>
                    </section>
                    <section class="collectibles-section">
                        <h2>Colecionáveis</h2>
                        <div class="coming-soon-text">EM BREVE</div>
                    </section>
                </div>
            </div>
        `;        // Configura o carrossel depois de renderizar o conteúdo
        if (mediaContent.length > 0) {
            const imagesContainer = gameContent.querySelector('.images-container');
            const images = imagesContainer.querySelectorAll('.image-item');
            const prevButton = gameContent.querySelector('.carousel-nav.prev');
            const nextButton = gameContent.querySelector('.carousel-nav.next');
            
            let currentIndex = 1; // Começar da segunda imagem

            function showImage(index) {
                const scrollTo = images[index].offsetLeft - imagesContainer.offsetLeft;
                imagesContainer.scrollTo({
                    left: scrollTo,
                    behavior: 'smooth'
                });
                
                // Atualiza visibilidade dos botões
                prevButton.style.opacity = index === 0 ? '0.5' : '1';
                nextButton.style.opacity = index === images.length - 1 ? '0.5' : '1';
            }

            function showNext() {
                if (currentIndex < images.length - 1) {
                    currentIndex++;
                    showImage(currentIndex);
                }
            }

            function showPrev() {
                if (currentIndex > 0) {
                    currentIndex--;
                    showImage(currentIndex);
                }
            }

            // Configura os event listeners dos botões
            prevButton.addEventListener('click', showPrev);
            nextButton.addEventListener('click', showNext);            // Mostra a segunda imagem
            showImage(1);

            // Auto-play a cada 5 segundos
            let autoplayInterval;
            
            function startAutoplay() {
                autoplayInterval = setInterval(() => {
                    if (currentIndex < images.length - 1) {
                        showNext();
                    } else {
                        currentIndex = 1; // Volta para a segunda imagem
                        showImage(currentIndex);
                    }
                }, 5000);
            }

            function stopAutoplay() {
                clearInterval(autoplayInterval);
            }

            // Inicia o autoplay
            startAutoplay();

            // Pausa o autoplay quando o mouse está sobre o carrossel
            imagesContainer.addEventListener('mouseenter', stopAutoplay);
            imagesContainer.addEventListener('mouseleave', startAutoplay);
            
            // Pausa o autoplay quando os botões são usados
            prevButton.addEventListener('mouseenter', stopAutoplay);
            nextButton.addEventListener('mouseenter', stopAutoplay);
            prevButton.addEventListener('mouseleave', startAutoplay);
            nextButton.addEventListener('mouseleave', startAutoplay);
        }

        // Configura o botão voltar
        const backButton = gameDetailsSection.querySelector('.back-button');
        backButton.addEventListener('click', () => {
            gameDetailsSection.classList.remove('active');
            document.getElementById('home').classList.add('active');
        });

        // Configura o botão jogar
        const playButton = gameContent.querySelector('.btn-play');
        // Cria container para botões de controle de download
        let controlsContainer = gameContent.querySelector('.download-controls');
        if (controlsContainer) controlsContainer.remove();
        controlsContainer = document.createElement('div');
        controlsContainer.className = 'download-controls';
        controlsContainer.style.display = 'none';
        controlsContainer.style.gap = '8px';
        controlsContainer.style.marginTop = '10px';
        controlsContainer.style.justifyContent = 'flex-end';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.flexDirection = 'row';
        // Botão Pausar
        const pauseBtn = document.createElement('button');
        pauseBtn.className = 'btn-download-pause';
        pauseBtn.textContent = 'Pausar';
        // Botão Retomar
        const resumeBtn = document.createElement('button');
        resumeBtn.className = 'btn-download-resume';
        resumeBtn.textContent = 'Recomeçar';
        resumeBtn.style.display = 'none';
        // Botão Cancelar
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-download-cancel';
        cancelBtn.textContent = 'Cancelar';
        controlsContainer.appendChild(pauseBtn);
        controlsContainer.appendChild(resumeBtn);
        controlsContainer.appendChild(cancelBtn);
        playButton.parentNode.insertBefore(controlsContainer, playButton.nextSibling);
        // Cria uma barra de progresso animada dentro do botão
        playButton.style.position = 'relative';
        playButton.style.overflow = 'hidden';
        // Remove barra antiga se houver
        let progressBar = playButton.querySelector('.download-progress-bar');
        if (progressBar) progressBar.remove();
        progressBar = document.createElement('div');
        progressBar.className = 'download-progress-bar';
        progressBar.style.position = 'absolute';
        progressBar.style.left = 0;
        progressBar.style.top = 0;
        progressBar.style.height = '100%';
        progressBar.style.width = '0%';
        progressBar.style.background = 'linear-gradient(90deg, #2196f3, #0d47a1)';
        progressBar.style.zIndex = 0;
        progressBar.style.transition = 'width 0.2s linear';
        playButton.appendChild(progressBar);
        // Garante que o texto do botão fique acima da barra
        playButton.style.zIndex = 1;
        playButton.style.color = '#fff';
        playButton.style.background = '';
        playButton.style.pointerEvents = '';
        playButton.style.userSelect = '';
        playButton.style.fontWeight = 'bold';
        playButton.style.border = '';
        playButton.style.boxShadow = '';
        playButton.style.cursor = 'pointer';

        // --- CHECAGEM DE EXECUTÁVEL ---
        const pastaDestino = localStorage.getItem('gameInstallFolder');
        let hasExecutable = false;
        if (window.electronAPI && window.electronAPI.checkExecutableExists && pastaDestino) {
            hasExecutable = await window.electronAPI.checkExecutableExists(pastaDestino, game.title);
        }
        playButton.textContent = hasExecutable ? 'Jogar' : 'Download';

        // --- PERSISTÊNCIA DO DOWNLOAD ---
        if (window.electronAPI && window.electronAPI.getDownloadStatus) {
            const status = await window.electronAPI.getDownloadStatus();
            if (status.active && status.gameName === game.title) {
                // Download em andamento para este jogo
                playButton.disabled = true;
                controlsContainer.style.display = 'flex';
                pauseBtn.style.display = status.isPaused ? 'none' : 'inline-block';
                resumeBtn.style.display = status.isPaused ? 'inline-block' : 'none';
                cancelBtn.style.display = 'inline-block';
                playButton.textContent = `Baixando... ${status.percent || 0}%`;
                progressBar.style.width = (status.percent || 0) + '%';
                progressBar.style.background = 'linear-gradient(90deg, #2196f3, #0d47a1)';
                progressBar.style.opacity = 1;
                // Reinscreve listener de progresso
                window.electronAPI.onDownloadProgress && window.electronAPI.onDownloadProgress((percent) => {
                    progressBar.style.width = percent + '%';
                    playButton.textContent = `Baixando... ${percent}%`;
                });
                // Reativa controles
                let isPaused = !!status.isPaused;
                pauseBtn.onclick = () => {
                    if (window.electronAPI.pauseDownload) window.electronAPI.pauseDownload();
                    isPaused = true;
                    pauseBtn.style.display = 'none';
                    resumeBtn.style.display = 'inline-block';
                };
                resumeBtn.onclick = () => {
                    if (window.electronAPI.resumeDownload) window.electronAPI.resumeDownload();
                    isPaused = false;
                    pauseBtn.style.display = 'inline-block';
                    resumeBtn.style.display = 'none';
                };
                cancelBtn.onclick = () => {
                    if (window.electronAPI.cancelDownload) window.electronAPI.cancelDownload();
                    playButton.textContent = 'Jogar';
                    progressBar.style.width = '0%';
                    progressBar.style.opacity = 0;
                    controlsContainer.style.display = 'none';
                    playButton.disabled = false;
                };
                // Não adiciona o click do botão jogar enquanto estiver baixando
                return;
            }
        }
        playButton.addEventListener('click', async () => {
            const pastaDestino = localStorage.getItem('gameInstallFolder');
            if (!pastaDestino) {
                alert('Defina a pasta de instalação nas configurações antes de baixar o jogo.');
                return;
            }
            let hasExecutable = false;
            if (window.electronAPI && window.electronAPI.checkExecutableExists) {
                hasExecutable = await window.electronAPI.checkExecutableExists(pastaDestino, game.title);
            }
            if (!hasExecutable) {
                playButton.disabled = true;
                controlsContainer.style.display = 'flex';
                pauseBtn.style.display = 'inline-block';
                resumeBtn.style.display = 'none';
                cancelBtn.style.display = 'inline-block';
                playButton.textContent = 'Baixando... 0%';
                progressBar.style.width = '0%';
                progressBar.style.background = 'linear-gradient(90deg, #2196f3, #0d47a1)';
                progressBar.style.opacity = 1;
                // Adiciona um canal de progresso via IPC
                window.electronAPI.onDownloadProgress && window.electronAPI.onDownloadProgress((percent) => {
                    progressBar.style.width = percent + '%';
                    playButton.textContent = `Baixando... ${percent}%`;
                });
                // Controle dos botões
                let isPaused = false;
                pauseBtn.onclick = () => {
                    if (window.electronAPI.pauseDownload) window.electronAPI.pauseDownload();
                    isPaused = true;
                    pauseBtn.style.display = 'none';
                    resumeBtn.style.display = 'inline-block';
                };
                resumeBtn.onclick = () => {
                    if (window.electronAPI.resumeDownload) window.electronAPI.resumeDownload();
                    isPaused = false;
                    pauseBtn.style.display = 'inline-block';
                    resumeBtn.style.display = 'none';
                };
                cancelBtn.onclick = () => {
                    if (window.electronAPI.cancelDownload) window.electronAPI.cancelDownload();
                    playButton.textContent = 'Jogar';
                    progressBar.style.width = '0%';
                    progressBar.style.opacity = 0;
                    controlsContainer.style.display = 'none';
                    playButton.disabled = false;
                };
                await window.electronAPI.downloadAndExtractGame(game.url, pastaDestino, game.title);
                progressBar.style.width = '100%';
                playButton.textContent = 'Jogar';
                setTimeout(() => {
                    progressBar.style.transition = 'opacity 0.5s';
                    progressBar.style.opacity = 0;
                    progressBar.style.width = '0%';
                }, 800);
                alert('Download e extração concluídos!');
                controlsContainer.style.display = 'none';
                // Após download e extração, checa novamente e atualiza o botão
                let found = false;
                if (window.electronAPI && window.electronAPI.checkExecutableExists) {
                    found = await window.electronAPI.checkExecutableExists(pastaDestino, game.title);
                }
                playButton.textContent = found ? 'Jogar' : 'Download';
                return;
            }
            // ...existing launch logic if any...
        });

    } catch (error) {
        console.error('Erro ao carregar detalhes do jogo:', error);
        showError('Erro ao carregar detalhes do jogo. Por favor, tente novamente mais tarde.');
    }
}

// Função auxiliar para criar elemento de vídeo
function createVideoElement(src) {
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    return video;
}

// Função auxiliar para criar elemento de imagem
function createImageElement(src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Game media';
    return img;
}

// Função para configurar navegação do carrossel
function setupCarouselNavigation(gameContent, mediaItems) {
    let currentIndex = 0;
    const container = gameContent.querySelector('.carousel-container');
    const prevButton = gameContent.querySelector('.carousel-arrow.prev');
    const nextButton = gameContent.querySelector('.carousel-arrow.next');

    function updateCarousel(index) {
        currentIndex = index;
        container.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            updateCarousel(currentIndex - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < mediaItems.length - 1) {
            updateCarousel(currentIndex + 1);
        }
    });

    // Inicializa o carrossel
    updateCarousel(0);
}

// Ajustando o tamanho da fonte e espaçamento do título e descrição para melhor proporção nos game cards
const style = document.createElement('style');
style.textContent = `
.game-card-info h3 {
    font-size: 1.1em;
    margin-bottom: 8px;
    line-height: 1.2;
}

.game-card-info p {
    font-size: 0.9em;
    opacity: 0.8;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
}

.game-card-info .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.game-card-info .tags span {
    background: rgba(255, 255, 255, 0.15);
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.8em;
}
`;
document.head.appendChild(style);
// Adiciona CSS global para a barra de progresso do botão
(function(){
    if (!document.getElementById('btn-download-progress-style')) {
        const style = document.createElement('style');
        style.id = 'btn-download-progress-style';
        style.textContent = `
        .btn-play { position: relative; overflow: hidden; }
        .btn-play .download-progress-bar {
            position: absolute;
            left: 0; top: 0; height: 100%; width: 0%;
            background: linear-gradient(90deg, #2196f3, #0d47a1);
            z-index: 0;
            transition: width 0.2s linear, opacity 0.5s;
            pointer-events: none;
        }
        .btn-play[disabled] { cursor: not-allowed; }
        .btn-play span, .btn-play i { position: relative, z-index: 1; }
        `;
        document.head.appendChild(style);
    }
})();
// Adiciona CSS global para os botões de controle de download
(function(){
    if (!document.getElementById('btn-download-controls-style')) {
        const style = document.createElement('style');
        style.id = 'btn-download-controls-style';
        style.textContent = `
        .download-controls { display: flex; gap: 8px; margin-top: 10px; }
        .download-controls button {
            background: #222; color: #fff; border: none; border-radius: 6px; padding: 6px 16px;
            cursor: pointer; font-weight: 500; transition: background 0.2s;
        }
        .download-controls button:hover { background: #1976d2; }
        `;
        document.head.appendChild(style);
    }
})();