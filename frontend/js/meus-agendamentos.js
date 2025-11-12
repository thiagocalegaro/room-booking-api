// js/meus-agendamentos.js

document.addEventListener('DOMContentLoaded', () => {
  // --- REFERÊNCIAS AOS ELEMENTOS ---
  // 👇 MODIFICADO: Trocamos a referência da tabela pelo grid
  const gridContainer = document.getElementById('agendamentos-grid-container');

  function renderizarCards(agendamentos) {
  gridContainer.innerHTML = '';
  
  agendamentos.forEach(agendamento => {
    const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    
    const card = `
      <div class="agendamento-card-user"> 
        
        <div class="card-content-main">
          <h3>Sala: ${agendamento.sala.codigo}</h3>
          <p><span class="label">Data:</span> ${dataFormatada}</p>
          <p><span class="label">Horário:</span> ${agendamento.hora_inicio.substring(0, 5)} - ${agendamento.hora_fim.substring(0, 5)}</p>
          <p><span class="label">Tipo:</span> ${agendamento.sala.tipo || 'N/A'}</p> 
        </div>

        <div class="card-button-wrapper">
          <button class="btn btn-danger btn-sm btn-icon btn-excluir" data-id="${agendamento.id}" title="Cancelar Agendamento">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
        
      </div>
    `;
    gridContainer.insertAdjacentHTML('beforeend', card);
  });
  }

  // --- LÓGICA DE CANCELAMENTO (Sem alteração) ---
  async function cancelarAgendamento(id) {
    const token = localStorage.getItem('access_token');
    if (!confirm(`Tem certeza que deseja cancelar o agendamento?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/agendamentos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao cancelar o agendamento.');
      carregarPagina(); // Recarrega a lista
    } catch (error) {
      alert(error.message);
    }
  }

  // --- LÓGICA DE CARREGAMENTO PRINCIPAL E AUTENTICAÇÃO ---
  async function carregarPagina() {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      window.location.href = '../paginasAuth/login.html';
      return;
    }
    try {
      const payload = jwt_decode.default(token); 
      if (!payload) {
        throw new Error('Token inválido');
      }
    } catch (error) { 
      console.error('ERRO AO VERIFICAR TOKEN:', error);
      localStorage.removeItem('access_token');
      window.location.href = '../paginasAuth/login.html';
      return;
    }

    // Carrega os agendamentos do usuário
    try {
      const response = await fetch('http://localhost:3000/agendamentos/meus', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao carregar seus agendamentos.');
      
      const agendamentos = await response.json();
      renderizarCards(agendamentos); // Chama a nova função de renderização

    } catch (error) {
      gridContainer.innerHTML = `<p class="text-center text-danger">${error.message}</p>`;
    }
  }

  // --- EVENT LISTENERS ---

  document.getElementById('btn-sair').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = '../paginasAuth/login.html';
  });
  
  // 👇 MODIFICADO: Agora escuta os cliques no 'gridContainer'
  gridContainer.addEventListener('click', (event) => {
    const btnCancelar = event.target.closest('.btn-excluir');
    if (btnCancelar) {
      const id = btnCancelar.dataset.id;
      cancelarAgendamento(id);
    }
  });

  // --- CARREGAMENTO INICIAL ---
  carregarPagina();
});