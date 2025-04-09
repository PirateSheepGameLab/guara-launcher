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

        // Atualiza o Quick Launch com os primeiros 4 jogos
        updateQuickLaunch(games.slice(0, 4));
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
    sectionElement.innerHTML = `<h2>${section.title}</h2>`;

    // Obtém os jogos da seção baseado nos IDs
    const sectionGames = section.gameIds
        .map(id => gamesMap.get(id))
        .filter(game => game !== undefined);

    if (sectionGames.length === 0) return;

    // Determina o tipo de renderização baseado no ID da seção
    if (section.id === 'featured') {
        renderFeaturedSection(sectionElement, sectionGames[0]);
    } else {
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
function renderFeaturedSection(container, game) {
    if (!game) return;

    container.innerHTML += `
        <div class="featured-game">
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

    const featuredGame = container.querySelector('.featured-game');
    featuredGame.addEventListener('click', () => {
        window.location.href = `game-details.html?id=${game.id}`;
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

// Função para atualizar Quick Launch
function updateQuickLaunch(games) {
    const quickLaunchList = document.querySelector('.quick-launch ul');
    if (!quickLaunchList) return;

    quickLaunchList.innerHTML = '';
    games.forEach(game => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${game.cover}" alt="${game.title}">
            ${game.title}
        `;
        quickLaunchList.appendChild(li);
    });
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
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        try {
            const [sectionsResponse, gamesResponse] = await Promise.all([
                fetch('home-sections.json'),
                fetch('games.json')
            ]);

            const sections = await sectionsResponse.json();
            const games = await gamesResponse.json();
            const gamesMap = new Map(games.map(game => [game.id, game]));

            // Limpa o conteúdo atual
            const mainContent = document.querySelector('.main-content');
            mainContent.innerHTML = '';

            // Filtra os jogos que correspondem ao termo de busca
            const filteredGamesMap = new Map(
                Array.from(gamesMap.entries()).filter(([_, game]) => 
                    game.title.toLowerCase().includes(searchTerm) ||
                    game.description.toLowerCase().includes(searchTerm) ||
                    game.genre.toLowerCase().includes(searchTerm)
                )
            );

            // Renderiza as seções com os jogos filtrados
            sections.sections.forEach(section => {
                const sectionElement = document.createElement('section');
                sectionElement.className = section.id;
                sectionElement.innerHTML = `<h2>${section.title}</h2>`;

                const sectionGames = section.gameIds
                    .map(id => filteredGamesMap.get(id))
                    .filter(game => game !== undefined);

                if (sectionGames.length > 0) {
                    if (section.id === 'featured') {
                        renderFeaturedSection(sectionElement, sectionGames[0]);
                    } else if (section.id === 'top-games') {
                        renderRankedSection(sectionElement, sectionGames);
                    } else {
                        renderGridSection(sectionElement, sectionGames);
                    }
                    mainContent.appendChild(sectionElement);
                }
            });
        } catch (error) {
            console.error('Erro ao filtrar jogos:', error);
        }
    });
}

// Função para carregar a ordem salva do Quick Launch
function loadQuickLaunchOrder() {
    const savedOrder = localStorage.getItem('quickLaunchOrder');
    if (savedOrder) {
        const quickLaunchList = document.querySelector('.quick-launch ul');
        const order = JSON.parse(savedOrder);
        const fragment = document.createDocumentFragment();
        
        order.forEach(itemHTML => {
            const li = document.createElement('li');
            li.innerHTML = itemHTML;
            fragment.appendChild(li);
        });
        
        quickLaunchList.innerHTML = '';
        quickLaunchList.appendChild(fragment);
    }
}

// Carregar a ordem salva quando a página carregar
document.addEventListener('DOMContentLoaded', loadQuickLaunchOrder);

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
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
    });
}); 