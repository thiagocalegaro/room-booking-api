// js/index.js

document.addEventListener('DOMContentLoaded', () => {
  // 1. Carrega tudo da página
  carregarPagina();

  // 2. Adiciona o listener de logout
  document.getElementById('btn-sair').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = '../paginasAuth/login.html';
  });
});

const searchBar = document.getElementById('search-bar');
  const gridContainer = document.getElementById('salas-grid-container');

  searchBar.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    
    // Pega todos os cards que estão na tela
    const allCards = gridContainer.querySelectorAll('.card-admin');

    allCards.forEach(card => {
      // Pega todo o texto de dentro do card
      const cardText = card.textContent.toLowerCase();
      
      // Verifica se o texto do card inclui o termo da pesquisa
      if (cardText.includes(searchTerm)) {
        card.style.display = 'block'; // Mostra o card
      } else {
        card.style.display = 'none'; // Esconde o card
      }
    });
  });

async function carregarPagina() {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    alert('Você não está logado.');
    window.location.href = '../paginasAuth/login.html';
    return;
  }

  // 1. Verifica o token
  try {
    const payload = jwt_decode.default(token); // Use a chamada correta
    if (payload.tipo === 'admin') {
      window.location.href = '../paginasAdm/painel.html';
      return;
    }
  } catch (error) { 
    console.error('Erro ao verificar token:', error);
    localStorage.removeItem('access_token');
    window.location.href = '../paginasAuth/login.html';
    return;
  }

  // 2. Chama as duas funções de carregamento
  carregarMeusAgendamentos(token);
  carregarSalasAtivas(token);
}

/**
 * Busca e renderiza os 3 próximos agendamentos do usuário
 */
async function carregarMeusAgendamentos(token) {
  const gridAgendamentos = document.getElementById('meus-agendamentos-grid');
  try {
    const response = await fetch('http://localhost:3000/agendamentos/meus', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Falha ao carregar seus agendamentos.');
    
    const agendamentos = await response.json();
    
    gridAgendamentos.innerHTML = ''; // Limpa o "carregando"
    
    // Pega apenas os 3 primeiros
    const proximosAgendamentos = agendamentos.slice(0, 3);

    if (proximosAgendamentos.length === 0) {
      gridAgendamentos.innerHTML = '<p class="text-center text-muted">Você não possui agendamentos futuros.</p>';
      return;
    }

    proximosAgendamentos.forEach(agendamento => {
      const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      const cardHTML = `
        <div class="agendamento-card-user">
          <h3>Sala: ${agendamento.sala.codigo}</h3>
          <p><span class="label">Data:</span> ${dataFormatada}</p>
          <p><span class="label">Horário:</span> ${agendamento.hora_inicio.substring(0, 5)} - ${agendamento.hora_fim.substring(0, 5)}</p>
        </div>
      `;
      gridAgendamentos.insertAdjacentHTML('beforeend', cardHTML);
    });

  } catch (error) {
    gridContainer.innerHTML = `<p class="text-center text-danger">${error.message}</p>`;
  }
}

/**
 * Busca e renderiza todas as salas ativas
 */
async function carregarSalasAtivas(token) {
  const gridContainer = document.getElementById('salas-grid-container');
  try {
    const response = await fetch('http://localhost:3000/salas/ativas', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Falha ao carregar salas.');
    
    const salas = await response.json();
    renderizarCardsSalas(salas); // Chama a função que já existia

  } catch (error) {
    gridContainer.innerHTML = `<p class="text-center text-danger">${error.message}</p>`;
  }
}

/**
 * Renderiza os cards das salas (Função que você já tinha)
 */
function renderizarCardsSalas(salas) {
  const container = document.getElementById('salas-grid-container');
  container.innerHTML = '';
  
  if (salas.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">Nenhuma sala ativa no momento.</p>';
    return;
  }

  salas.forEach(sala => {
    const recursosHtml = gerarListaRecursos(sala.recursos); 

    const cardHTML = `
      <div class="card-admin">
        <h3>${sala.codigo} - ${sala.tipo}</h3>
        <div class="card-content-wrapper">
          <div class="card-col-details">
            <p>Bloco ${sala.bloco || 'N/A'}</p>
            <p>Capacidade: ${sala.capacidade} pessoas</p>
            <ul class="card-details">
              <li>Abre: ${sala.hora_inicio.substring(0, 5)}</li>
              <li>Fecha: ${sala.hora_fim.substring(0, 5)}</li>
              <li>Sábado: ${sala.disponivel_sabado ? 'Sim' : 'Não'}</li>
              <li>Domingo: ${sala.disponivel_domingo ? 'Sim' : 'Não'}</li>
            </ul>
          </div>
          <div class="card-col-recursos">
            ${recursosHtml}
          </div>
        </div>
        <button class="btn btn-primary w-100" style="margin-top: 1rem;" onclick="agendarSala('${sala.codigo}')">
          Agendar
        </button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', cardHTML);
  });
}

/**
 * Função auxiliar para listar os recursos no card (Função que você já tinha)
 */
function gerarListaRecursos(recursos) {
  if (!recursos || recursos.length === 0) {
    return `
      <p class="card-recursos-titulo">Recursos:</p>
      <p class="card-recursos-compacto">Sem recursos adicionados.</p>
    `;
  }
  const listaFormatada = recursos.map(rec => `${rec.nome} | Qtd: ${rec.quantidade}`).join(', ');
  return `
    <p class="card-recursos-titulo">Recursos:</p>
    <p class="card-recursos-compacto">${listaFormatada}</p>
  `;
}

/**
 * Função global chamada pelo botão "Agendar"
 */
function agendarSala(codigoSala) {
  window.location.href = `agendar.html?sala=${encodeURIComponent(codigoSala)}`;
}
/*
document.getElementById('botao-link').addEventListener('click', () => {
    window.location.href = '../paginasUsuario/meus-agendamentos.html';
  });*/