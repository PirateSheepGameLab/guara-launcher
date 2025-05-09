// Função para incluir o menu em todas as páginas
function includeSidebar() {
    const sidebarContainer = document.querySelector('.sidebar');
    if (sidebarContainer) {
        fetch('/components/sidebar.html')
            .then(response => response.text())
            .then(data => {
                sidebarContainer.innerHTML = data;
                setupNavigation();
            })
            .catch(error => {
                console.error('Erro ao carregar o menu:', error);
            });
    }
}

// Função para configurar a navegação
function setupNavigation() {
    const navItems = document.querySelectorAll('.main-nav li');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Pré-carregar as páginas
    const pages = ['index.html', 'biblioteca.html', 'loja.html', 'conquistas.html', 'configuracoes.html'];
    pages.forEach(page => {
        if (page !== currentPage) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
        }
    });

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
                
                // Aguarda a animação de fade out
                setTimeout(() => {
                    window.location.href = targetPage;
                }, 150);
            });
        }
    });
}

// Incluir o menu quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', includeSidebar); 