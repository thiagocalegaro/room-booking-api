// js/index.js

// Esta função será executada assim que o conteúdo da página for carregado
document.addEventListener('DOMContentLoaded', () => {
    carregarSalas();
});

// Função principal para buscar e exibir as salas
async function carregarSalas() {
    // 1. Pega o contêiner onde os cards serão inseridos
    const container = document.getElementById('salas-grid-container');
    
    // 2. Pega o token de acesso que foi salvo no localStorage durante o login
    const token = localStorage.getItem('access_token');

    // 3. Verifica se o usuário está logado. Se não, redireciona para a página de login.
    if (!token) {
        alert('Você não está logado. Redirecionando para a página de login.');
        window.location.href = '../paginasAuth/login.html';
        return; // Interrompe a execução da função
    }

    try {
        // 4. Faz a requisição para a API, incluindo o token no cabeçalho
        const response = await fetch('http://localhost:3000/salas', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Envia o token para autenticação
            }
        });

        // 5. Verifica se o token é válido. Se a API retornar 401, o token expirou.
        if (response.status === 401) {
            alert('Sua sessão expirou. Por favor, faça login novamente.');
            localStorage.removeItem('access_token'); // Limpa o token antigo
            window.location.href = '../paginasAuth/login.html';
            return;
        }

        if (!response.ok) {
            throw new Error('Falha ao buscar as salas.');
        }

        // 6. Transforma a resposta em JSON
        const salas = await response.json();

        // 7. Limpa qualquer conteúdo antigo e preenche com as salas da API
        container.innerHTML = ''; // Limpa o contêiner
        if (salas.length === 0) {
            container.innerHTML = '<p>Nenhuma sala disponível no momento.</p>';
        } else {
            salas.forEach(sala => {
                const cardHTML = criarCardSala(sala);
                // Adiciona o HTML do novo card no final do contêiner
                container.insertAdjacentHTML('beforeend', cardHTML);
            });
        }

    } catch (error) {
        console.error('Erro ao carregar salas:', error);
        container.innerHTML = '<p class="text-danger">Ocorreu um erro ao carregar as salas. Tente novamente mais tarde.</p>';
    }
}

// Função auxiliar que gera o HTML para um único card de sala
function criarCardSala(sala) {
    // Aqui você pode adicionar mais informações que vêm da sua API
    // ex: sala.tipo, sala.bloco, etc.
    // Usamos 'N/A' (Não Aplicável) como um valor padrão caso a informação não venha.
    return `
        <div class="sala-card">
          <h3>${sala.codigo}</h3>
          <p>Local: Bloco ${sala.bloco || 'N/A'}</p>
          <p>Capacidade: ${sala.capacidade} pessoas</p>
          <p>Tipo: ${sala.tipo || 'N/A'}</p>
          <p>Horário de funcionamento:   ${sala.hora_inicio} até ${sala.hora_fim}</p>
            
          <button class="btn btn-primary btn-sm" onclick="agendarSala('${sala.codigo}')">Ver horários</button>
        </div>
    `;
}

// A função que já existia no seu HTML para o botão de agendar
function agendarSala(codigoSala) {
    // Redireciona para agendar.html com o parâmetro do CÓDIGO da sala
    window.location.href = `agendar.html?sala=${encodeURIComponent(codigoSala)}`;
}