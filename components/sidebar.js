// Função para incluir o menu em todas as páginas
function includeSidebar() {
    const sidebarContainer = document.querySelector('.sidebar');
    if (sidebarContainer) {
        // Get the correct path based on the current page location
        const currentPath = window.location.pathname;
        const isSubFolder = currentPath.includes('/components/');
        const sidebarPath = isSubFolder ? './sidebar.html' : './components/sidebar.html';
        
        fetch(sidebarPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                sidebarContainer.innerHTML = data;
                setupNavigation();
            })
            .catch(error => {
                console.error('Erro ao carregar o menu:', error);
                loadSidebarFallback();
            });
    }
}

// Função de fallback para carregar o sidebar diretamente
function loadSidebarFallback() {
    const sidebarContainer = document.querySelector('.sidebar');
    if (sidebarContainer) {
        const currentPath = window.location.pathname;
        const isSubFolder = currentPath.includes('/components/');
        const iconPath = isSubFolder ? '../images/guara-icon.png' : './images/guara-icon.png';

        sidebarContainer.innerHTML = `
            <div class="sidebar-header">
                <img src="${iconPath}" alt="Guará Launcher" class="launcher-icon">
                <h2>Guará Launcher</h2>
            </div>

            <div class="profile">
                <div class="profile-image">
                    <img src="https://via.placeholder.com/50" alt="Profile">
                </div>
                <div class="profile-info">
                    <h3>Usuário</h3>
                    <span class="level">Nível 42</span>
                </div>
            </div>

            <nav class="main-nav">
                <ul>
                    <li><i class="fas fa-home"></i> <a href="index.html">Início</a></li>
                    <li><i class="fas fa-gamepad"></i> <a href="biblioteca.html">Biblioteca</a></li>
                    <li><i class="fas fa-store"></i> <a href="loja.html">Loja</a></li>
                    <li><i class="fas fa-trophy"></i> <a href="conquistas.html">Conquistas</a></li>
                    <li><i class="fas fa-cog"></i> <a href="configuracoes.html">Configurações</a></li>
                </ul>
            </nav>

            <div class="social-links">
                <a href="#"><i class="fab fa-discord"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-tiktok"></i></a>
                <a href="#"><i class="fab fa-facebook"></i></a>
            </div>
        `;
        setupNavigation();
    }
}

// Função para configurar a navegação
function setupNavigation() {
    const navItems = document.querySelectorAll('.main-nav li');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.getAttribute('href');
                
                // Adiciona classe de transição ao container
                document.body.classList.add('page-transition');
                
                // Use setTimeout para garantir que a transição seja visível
                setTimeout(() => {
                    window.location.href = targetPage;
                }, 150);
            });
        }
    });
}

// Incluir o menu quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', includeSidebar);