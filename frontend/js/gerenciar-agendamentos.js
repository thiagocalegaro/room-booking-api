// js/gerenciar-agendamentos-admin.js

document.addEventListener('DOMContentLoaded', () => {
  
  const gridContainer = document.getElementById('agendamentos-grid-container');
  const searchBar = document.getElementById('search-bar'); 

  function renderizarCards(agendamentos) {
  gridContainer.innerHTML = '';
  // ... (verificação de agendamentos.length) ...
  
  agendamentos.forEach(agendamento => {
    const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    
    // O HTML do card foi reestruturado
    const card = `
      <div class="agendamento-card-user"> 
        
        <div class="card-content-main">
          <h3>Sala: ${agendamento.sala.codigo}</h3>
          <p><span class="label">Data:</span> ${dataFormatada}</p>
          <p><span class="label">Horário:</span> ${agendamento.hora_inicio.substring(0, 5)} - ${agendamento.hora_fim.substring(0, 5)}</p>
          <p><span class="label">Tipo:</span> ${agendamento.sala.tipo || 'N/A'}</p> 
        </div>

        <div class="card-footer-user">
          <div class="user-info">
            <p><span class="label">Usuário:</span> ${agendamento.usuario.nome}</p>
            <p><span class="label">Email:</span> ${agendamento.usuario.email}</p>
          </div>
          <button class="btn btn-danger btn-sm btn-icon btn-excluir" data-id="${agendamento.id}" title="Cancelar Agendamento">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>

      </div>
    `;
    gridContainer.insertAdjacentHTML('beforeend', card);
  });
}

  async function cancelarAgendamento(id) {
    const token = localStorage.getItem('access_token');
    if (!confirm(`Tem certeza que deseja cancelar o agendamento ID ${id}?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/agendamentos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao cancelar o agendamento.');
      buscarErenderizarAgendamentos(); 
    } catch (error) {
      alert(error.message);
    }
  }

  async function buscarErenderizarAgendamentos() {
    const token = localStorage.getItem('access_token');
    
    gridContainer.innerHTML = '<p class="text-center text-muted">Carregando agendamentos...</p>';

    try {
      const response = await fetch(`http://localhost:3000/agendamentos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao carregar agendamentos.');
      
      const agendamentos = await response.json();
      renderizarCards(agendamentos);
      
      filtrarCardsEmTempoReal(); 

    } catch (error) {
      gridContainer.innerHTML = `<p class="text-center text-danger">${error.message}</p>`;
    }
  }

  function verificarAcesso() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '../paginasAuth/login.html';
      return false;
    }
    try {
      const payload = jwt_decode.default(token);
      if (payload.tipo !== 'admin') {
        alert('Acesso negado. Esta é uma área de administrador.');
        window.location.href = '../paginasUsuario/index.html';
        return false;
      }
      return true;
    } catch (error) { 
      localStorage.removeItem('access_token');
      window.location.href = '../paginasAuth/login.html';
      return false;
    }
  }
  
  function filtrarCardsEmTempoReal() {
    const searchTerm = searchBar.value.toLowerCase();
    const allCards = gridContainer.querySelectorAll('.agendamento-card-user');

    allCards.forEach(card => {
      const cardText = card.textContent.toLowerCase();
      if (cardText.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  document.getElementById('btn-sair').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = '../paginasAuth/login.html';
  });
  
    searchBar.addEventListener('input', filtrarCardsEmTempoReal);
  
  gridContainer.addEventListener('click', (event) => {
    const btnCancelar = event.target.closest('.btn-excluir');
    if (btnCancelar) {
      const id = btnCancelar.dataset.id;
      cancelarAgendamento(id);
    }
  });

  if (verificarAcesso()) {
    buscarErenderizarAgendamentos();
  }
});