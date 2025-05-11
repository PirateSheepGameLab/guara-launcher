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

        // Renderiza cada seção
        sections.sections.forEach(section => {
            renderSection(section, gamesMap);
        });
    } catch (error) {
        console.error('Erro ao carregar as seções:', error);
        showError('Erro ao carregar as seções. Por favor, tente novamente mais tarde.');
    }
}

// Função para renderizar uma seção
function renderSection(section, gamesMap) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const sectionElement = document.createElement('section');
    sectionElement.className = section.id;
    
    if (section.id === 'featured') {
        renderFeaturedSection(sectionElement, section.items, gamesMap);
    } else {
        sectionElement.innerHTML = `<h2>${section.title}</h2>`;
        // Obtém os jogos da seção baseado nos IDs
        const sectionGames = section.gameIds
            .map(id => gamesMap.get(id))
            .filter(game => game !== undefined);

        if (sectionGames.length === 0) return;

        const grid = document.createElement('div');
        grid.className = 'games-grid';
        
        // Adiciona botões de navegação
        const prevButton = document.createElement('button');
        prevButton.className = 'section-nav prev';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.onclick = () => scrollSection(grid, -300);
        
        const nextButton = document.createElement('button');
        nextButton.className = 'section-nav next';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.onclick = () => scrollSection(grid, 300);

        sectionGames.forEach(game => {
            const card = createGameCard(game);
            grid.appendChild(card);
        });

        sectionElement.appendChild(prevButton);
        sectionElement.appendChild(grid);
        sectionElement.appendChild(nextButton);
    }

    mainContent.appendChild(sectionElement);
}

// Função para renderizar seção de destaque
function renderFeaturedSection(container, items, gamesMap) {
    if (!items || items.length === 0) return;

    const carousel = document.createElement('div');
    carousel.className = 'featured-carousel';
    
    // Container para os itens
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'featured-items';
    
    // Adiciona os itens
    items.forEach((item, index) => {
        let itemContent = '';
        
        if (item.type === 'advertisement') {
            itemContent = `
                <div class="featured-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <div class="featured-game featured-ad">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="game-info">
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                            <a href="${item.cta.link}" class="banner-button">
                                ${item.cta.text}
                                <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        } else if (item.type === 'game') {
            const game = gamesMap.get(item.id);
            if (!game) return; // Skip if game not found
            
            itemContent = `
                <div class="featured-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <div class="featured-game" data-game-id="${game.id}">
                        <img src="${game.background}" alt="${game.title}">
                        <div class="game-info">
                            <h3>${game.title}</h3>
                            <p>${game.description}</p>
                            <div class="tags">
                                ${game.genre.split(', ').map(genre => `<span>${genre}</span>`).join('')}
                            </div>
                            <a href="game-details.html?id=${game.id}" class="banner-button">
                                Ver mais
                                <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (itemContent) {
            itemsContainer.innerHTML += itemContent;
        }
    });

    // Adiciona indicadores de página
    const indicators = document.createElement('div');
    indicators.className = 'carousel-indicators';
    items.forEach((_, index) => {
        const indicator = document.createElement('button');
        indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
        indicator.setAttribute('data-index', index);
        indicators.appendChild(indicator);
    });

    carousel.appendChild(itemsContainer);
    carousel.appendChild(indicators);
    container.appendChild(carousel);

    // Adiciona funcionalidade do carrossel
    let currentIndex = 0;
    const itemsList = itemsContainer.querySelectorAll('.featured-item');
    const indicatorButtons = indicators.querySelectorAll('.indicator');

    function updateCarousel() {
        itemsList.forEach((item, index) => {
            item.classList.toggle('active', index === currentIndex);
        });
        indicatorButtons.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
    }

    // Adiciona event listeners para os indicadores
    indicatorButtons.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });

    // Auto-advance every 5 seconds
    let autoAdvance = setInterval(nextSlide, 5000);

    // Pause auto-advance on hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoAdvance);
    });

    carousel.addEventListener('mouseleave', () => {
        autoAdvance = setInterval(nextSlide, 5000);
    });

    // Adiciona event listeners para cliques nos itens
    itemsContainer.querySelectorAll('.featured-game').forEach(gameElement => {
        gameElement.addEventListener('click', (e) => {
            // Se o clique foi no botão CTA, não faz nada (o link já será seguido)
            if (e.target.closest('.cta-button')) return;

            const gameId = gameElement.getAttribute('data-game-id');
            if (gameId) {
                window.location.href = `game-details.html?id=${gameId}`;
            } else if (gameElement.classList.contains('featured-ad')) {
                // Se for um anúncio, pega o link do CTA e abre em nova aba
                const ctaLink = gameElement.querySelector('.cta-button')?.getAttribute('href');
                if (ctaLink) {
                    e.preventDefault(); // Previne o comportamento padrão
                    window.open(ctaLink, '_blank', 'noopener,noreferrer');
                }
            }
        });
    });

    // Adiciona event listener específico para o botão CTA dos anúncios
    itemsContainer.querySelectorAll('.featured-ad .cta-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Previne o comportamento padrão
            const link = button.getAttribute('href');
            if (link) {
                window.open(link, '_blank', 'noopener,noreferrer');
            }
        });
    });
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
    `;

    card.addEventListener('click', () => {
        window.location.href = `game-details.html?id=${game.id}`;
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
    `;

    rankedGame.addEventListener('click', () => {
        window.location.href = `game-details.html?id=${game.id}`;
    });

    return rankedGame;
}

// Função para mostrar erro
function showError(message) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        mainContent.appendChild(errorDiv);
    }
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