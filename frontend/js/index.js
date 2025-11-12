// js/index.js

document.addEventListener('DOMContentLoaded', () => {
  carregarPagina();

  document.getElementById('btn-sair').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = '../paginasAuth/login.html';
  });
});

const searchBar = document.getElementById('search-bar');
  const gridContainer = document.getElementById('salas-grid-container');

  searchBar.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    
    const allCards = gridContainer.querySelectorAll('.card-admin');

    allCards.forEach(card => {
      const cardText = card.textContent.toLowerCase();
      
      if (cardText.includes(searchTerm)) {
        card.style.display = 'block'; 
      } else {
        card.style.display = 'none'; 
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

  try {
    const payload = jwt_decode.default(token); 
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

  carregarMeusAgendamentos(token);
  carregarSalasAtivas(token);
}

async function carregarMeusAgendamentos(token) {
  const gridAgendamentos = document.getElementById('meus-agendamentos-grid');
  try {
    const response = await fetch('http://localhost:3000/agendamentos/meus', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Falha ao carregar seus agendamentos.');
    
    const agendamentos = await response.json();
    
    gridAgendamentos.innerHTML = ''; 
    
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

async function carregarSalasAtivas(token) {
  const gridContainer = document.getElementById('salas-grid-container');
  try {
    const response = await fetch('http://localhost:3000/salas/ativas', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Falha ao carregar salas.');
    
    const salas = await response.json();
    renderizarCardsSalas(salas); 

  } catch (error) {
    gridContainer.innerHTML = `<p class="text-center text-danger">${error.message}</p>`;
  }
}

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

function agendarSala(codigoSala) {
  window.location.href = `agendar.html?sala=${encodeURIComponent(codigoSala)}`;
}
