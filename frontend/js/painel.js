
document.addEventListener('DOMContentLoaded', () => {
    verificarAcessoAdmin();

    document.getElementById('btn-sair').addEventListener('click', (e) => {
        e.preventDefault(); 
        localStorage.removeItem('access_token');
        window.location.href = '../paginasAuth/login.html';
    });
});

async function verificarAcessoAdmin() {
    const token = localStorage.getItem('access_token');

    if (!token) {
        alert('Você não está logado. Redirecionando para a página de login.');
        window.location.href = '../paginasAuth/login.html';
        return; 
    }

    try {
        const payload = jwt_decode.default(token); 
        
        if (payload.tipo !== 'admin') {
            alert('Acesso negado. Você não é um administrador.');
            window.location.href = '../paginasUsuario/index.html';
            return;
        }

        console.log('Acesso de administrador concedido.');

    } catch (error) {
        console.error('Erro ao verificar o token:', error);
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        localStorage.removeItem('access_token');
        window.location.href = '../paginasAuth/login.html';
        return;
    }
}