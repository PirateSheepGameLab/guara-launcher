// Função para carregar os jogos do JSON
async function loadGames() {
    try {
        const response = await fetch('games.json');
        const games = await response.json();
        displayGames(games);
        displayFeaturedGame(games[0]); // Exibe o primeiro jogo como destaque
    } catch (error) {
        console.error('Erro ao carregar os jogos:', error);
    }
}

// Função para exibir os jogos na grid
function displayGames(games) {
    const gamesGrid = document.querySelector('.games-grid');
    gamesGrid.innerHTML = ''; // Limpa o conteúdo atual

    games.forEach(game => {
        const genres = game.genre.split(', ');
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <img src="${game.cover}" alt="${game.title}">
            <div class="game-card-info">
                <h3>${game.title}</h3>
                <p>${game.description}</p>
                <div class="tags">
                    ${genres.map(genre => `<span>${genre}</span>`).join('')}
                </div>
            </div>
        `;

        // Adicionar evento de clique para navegação
        card.addEventListener('click', () => {
            window.location.href = `game-details.html?id=${game.id}`;
        });

        gamesGrid.appendChild(card);
    });
}

// Função para exibir o jogo em destaque
function displayFeaturedGame(game) {
    const featuredSection = document.querySelector('.featured-game');
    if (featuredSection && game) {
        featuredSection.innerHTML = `
            <img src="${game.background}" alt="${game.title}">
            <div class="game-info">
                <h3>${game.title}</h3>
                <p>${game.description}</p>
                <div class="tags">
                    ${game.genre.split(', ').map(genre => `<span>${genre}</span>`).join('')}
                </div>
            </div>
        `;

        // Adicionar evento de clique para navegação
        featuredSection.addEventListener('click', () => {
            window.location.href = `game-details.html?id=${game.id}`;
        });
    }
}

// Carregar os jogos quando a página carregar
document.addEventListener('DOMContentLoaded', loadGames);

// Funcionalidade de drag and drop para Quick Launch
document.addEventListener('DOMContentLoaded', () => {
    const quickLaunchList = document.querySelector('.quick-launch ul');
    if (quickLaunchList) {
        const items = quickLaunchList.querySelectorAll('li');
        
        items.forEach(item => {
            item.setAttribute('draggable', true);
            
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.innerHTML);
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });
        
        quickLaunchList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            const siblings = [...quickLaunchList.querySelectorAll('li:not(.dragging)')];
            const nextSibling = siblings.find(sibling => {
                const box = sibling.getBoundingClientRect();
                return e.clientY <= box.top + box.height / 2;
            });
            
            if (nextSibling) {
                quickLaunchList.insertBefore(draggingItem, nextSibling);
            } else {
                quickLaunchList.appendChild(draggingItem);
            }
        });
        
        // Salvar ordem após soltar
        quickLaunchList.addEventListener('drop', (e) => {
            e.preventDefault();
            saveQuickLaunchOrder();
        });
    }
});

// Função para salvar a ordem do Quick Launch
function saveQuickLaunchOrder() {
    const quickLaunchList = document.querySelector('.quick-launch ul');
    const items = [...quickLaunchList.querySelectorAll('li')];
    const order = items.map(item => item.innerHTML);
    localStorage.setItem('quickLaunchOrder', JSON.stringify(order));
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
const searchInput = document.querySelector('.search input');
const genreCheckboxes = document.querySelectorAll('.genre-list input');
const tags = document.querySelectorAll('.tag');
const topGamesContainer = document.querySelector('.top-games');

// Create game card element
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
        <img src="${game.image}" alt="${game.title}">
        <div class="game-card-info">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            <div class="tags">
                ${game.tags.map(tag => `<span>${tag}</span>`).join('')}
            </div>
            <div class="rating">
                ${'★'.repeat(Math.floor(game.rating))}${game.rating % 1 >= 0.5 ? '½' : ''}
                ${'☆'.repeat(5 - Math.ceil(game.rating))}
            </div>
        </div>
    `;
    
    return card;
}

// Create ranked game element
function createRankedGame(game, rank) {
    const rankedGame = document.createElement('div');
    rankedGame.className = 'game-rank';
    rankedGame.innerHTML = `
        <span class="rank">${rank}</span>
        <img src="${game.image}" alt="${game.title}">
        <div class="game-info">
            <h3>${game.title}</h3>
            <div class="tags">
                ${game.tags.slice(0, 2).map(tag => `<span>${tag}</span>`).join('')}
            </div>
        </div>
    `;
    return rankedGame;
}

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

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredGames = games.filter(game => 
        game.title.toLowerCase().includes(searchTerm) ||
        game.description.toLowerCase().includes(searchTerm) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    populateGames(filteredGames);
});

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