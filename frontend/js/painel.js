// js/painel.js

// 1. Envolve tudo no 'DOMContentLoaded', assim como no 'index.js'
document.addEventListener('DOMContentLoaded', () => {
    // 2. Chama a função principal de verificação e carregamento
    verificarAcessoAdmin();

    // 3. Adiciona a lógica de logout ao botão "Sair"
    document.getElementById('btn-sair').addEventListener('click', (e) => {
        e.preventDefault(); 
        localStorage.removeItem('access_token');
        window.location.href = '../paginasAuth/login.html';
    });
});

// Esta é a função principal que protege a página
async function verificarAcessoAdmin() {
    // Pega o token de dentro da função, assim como no 'index.js'
    const token = localStorage.getItem('access_token');

    // 1. Verifica se o token existe
    if (!token) {
        alert('Você não está logado. Redirecionando para a página de login.');
        window.location.href = '../paginasAuth/login.html';
        return; 
    }

    try {
        // 2. Tenta decodificar o token e verificar o tipo
        const payload = jwt_decode.default(token); // A chamada correta (com underscore)
        
        if (payload.tipo !== 'admin') {
            // Se não for admin, nega o acesso
            alert('Acesso negado. Você não é um administrador.');
            window.location.href = '../paginasUsuario/index.html';
            return;
        }

        // 3. Se chegou aqui, o usuário é um admin.
        // O console log é opcional, mas bom para confirmar.
        console.log('Acesso de administrador concedido.');
        // (Aqui você poderia chamar outras funções para carregar dados do painel, se necessário)

    } catch (error) {
        // 4. Se o token for inválido/expirado (erro no jwt_decode)
        console.error('Erro ao verificar o token:', error);
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        localStorage.removeItem('access_token');
        window.location.href = '../paginasAuth/login.html';
        return;
    }
}