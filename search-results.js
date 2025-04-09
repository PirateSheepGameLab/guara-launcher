// Função para carregar os jogos e exibir os resultados
async function loadSearchResults() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('q') || '';
        
        // Atualiza o título com o termo de busca
        document.getElementById('searchResultsTitle').textContent = 
            searchTerm ? `Resultados para: "${searchTerm}"` : 'Todos os jogos';

        // Carrega os jogos
        const response = await fetch('games.json');
        const games = await response.json();

        // Filtra os jogos baseado apenas no título
        const filteredGames = searchTerm
            ? games.filter(game => 
                game.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : games;

        // Exibe os resultados
        displaySearchResults(filteredGames);
        
        // Configura os filtros de gênero
        setupGenreFilters(games);

        // Configura a barra de pesquisa
        setupSearchBar(searchTerm);
    } catch (error) {
        console.error('Erro ao carregar resultados:', error);
        showError('Erro ao carregar os resultados. Por favor, tente novamente mais tarde.');
    }
}

// Função para exibir os resultados da busca
function displaySearchResults(games) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    if (games.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">Nenhum jogo encontrado.</p>';
        return;
    }

    const list = document.createElement('div');
    list.className = 'search-results-list';

    games.forEach(game => {
        const gameItem = document.createElement('div');
        gameItem.className = 'search-result-item';
        gameItem.innerHTML = `
            <img src="${game.cover}" alt="${game.title}">
            <div class="search-result-info">
                <h3>${game.title}</h3>
                <p>${game.description}</p>
                <div class="tags">
                    ${game.genre.split(', ').map(genre => `<span>${genre}</span>`).join('')}
                </div>
            </div>
        `;

        gameItem.addEventListener('click', () => {
            window.location.href = `game-details.html?id=${game.id}`;
        });

        list.appendChild(gameItem);
    });

    resultsContainer.appendChild(list);
}

// Função para configurar os filtros de gênero
function setupGenreFilters(games) {
    const genreFilters = document.getElementById('genreFilters');
    const allGenres = new Set();

    // Coleta todos os gêneros únicos
    games.forEach(game => {
        game.genre.split(', ').forEach(genre => allGenres.add(genre));
    });

    // Cria os checkboxes de gênero
    allGenres.forEach(genre => {
        const label = document.createElement('label');
        label.className = 'genre-checkbox';
        label.innerHTML = `
            <input type="checkbox" value="${genre}">
            <span>${genre}</span>
        `;
        genreFilters.appendChild(label);
    });

    // Adiciona event listeners para os checkboxes
    genreFilters.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            filterResults();
        });
    });
}

// Função para filtrar os resultados
function filterResults() {
    const selectedGenres = Array.from(
        document.querySelectorAll('#genreFilters input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);

    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const originalSearchTerm = urlParams.get('q') || '';

    // Carrega todos os jogos
    fetch('games.json')
        .then(response => response.json())
        .then(games => {
            // Filtra por termo de busca
            let filteredGames = originalSearchTerm
                ? games.filter(game => 
                    game.title.toLowerCase().includes(originalSearchTerm.toLowerCase()) ||
                    game.description.toLowerCase().includes(originalSearchTerm.toLowerCase()) ||
                    game.genre.toLowerCase().includes(originalSearchTerm.toLowerCase())
                )
                : games;

            // Filtra por gêneros selecionados
            if (selectedGenres.length > 0) {
                filteredGames = filteredGames.filter(game =>
                    selectedGenres.some(genre => game.genre.includes(genre))
                );
            }

            displaySearchResults(filteredGames);
        })
        .catch(error => {
            console.error('Erro ao filtrar resultados:', error);
            showError('Erro ao filtrar os resultados. Por favor, tente novamente mais tarde.');
        });
}

// Função para configurar a barra de pesquisa
function setupSearchBar(initialValue) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = initialValue;

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            window.location.href = `search-results.html?q=${encodeURIComponent(searchTerm)}`;
        }
    });
}

// Função para mostrar mensagem de erro
function showError(message) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

// Carrega os resultados quando a página carregar
document.addEventListener('DOMContentLoaded', loadSearchResults); 