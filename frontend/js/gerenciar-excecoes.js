// js/gerenciar-excecoes.js

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o seletor de data/hora
  flatpickr(".datetime-picker", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true,
  });

  // --- REFERÊNCIAS AOS ELEMENTOS ---
  const tableBody = document.getElementById('excecoes-table-body');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const excecaoForm = document.getElementById('excecao-form');
  const mensagemModal = document.getElementById('modal-mensagem');
  
  // Campos condicionais
  const escopoSelect = document.getElementById('escopo');
  const campoCodigoSala = document.getElementById('campo-codigo-sala');
  const campoBloco = document.getElementById('campo-bloco');

  // --- FUNÇÕES DO MODAL ---
  const abrirModal = () => modalBackdrop.classList.add('show');
  const fecharModal = () => {
    modalBackdrop.classList.remove('show');
    excecaoForm.reset();
    mensagemModal.innerHTML = '';
    // Reseta os campos condicionais
    campoCodigoSala.style.display = 'block';
    campoBloco.style.display = 'none';
  };

  // --- RENDERIZAÇÃO DA TABELA ---
  function renderizarTabela(excecoes) {
    tableBody.innerHTML = '';
    if (excecoes.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma exceção cadastrada.</td></tr>';
      return;
    }
    
    excecoes.forEach(excecao => {
      // Formata datas
      const inicioFmt = new Date(excecao.inicio).toLocaleString('pt-BR');
      const fimFmt = new Date(excecao.fim).toLocaleString('pt-BR');
      
      const row = `
        <tr>
          <td>${excecao.motivo}</td>
          <td>${excecao.tipo}</td>
          <td>${excecao.sala.codigo}</td>
          <td>${inicioFmt}</td>
          <td>${fimFmt}</td>
          <td class="actions">
            <button class="btn btn-danger btn-sm btn-excluir" data-id="${excecao.id}" title="Excluir Exceção">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
      tableBody.insertAdjacentHTML('beforeend', row);
    });
  }

  // --- LÓGICA DE EXCLUSÃO ---
  async function excluirExcecao(id) {
    const token = localStorage.getItem('access_token');
    if (!confirm(`Tem certeza que deseja excluir a exceção ID ${id}?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/excecoes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao excluir a exceção.');
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
      const payload = jwt_decode.default(token); // Use a chamada correta
      if (payload.tipo !== 'admin') {
        alert('Acesso negado.');
        window.location.href = '../paginasUsuario/index.html';
        return;
      }
    } catch (error) { 
      console.error('ERRO AO VERIFICAR TOKEN:', error);
      localStorage.removeItem('access_token');
      window.location.href = '../paginasAuth/login.html';
      return;
    }

    // Carrega as exceções
    try {
      const response = await fetch('http://localhost:3000/excecoes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao carregar exceções.');
      const excecoes = await response.json();
      renderizarTabela(excecoes);
    } catch (error) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${error.message}</td></tr>`;
    }
  }

  // --- EVENT LISTENERS ---

  // Botões do Modal
  document.getElementById('btn-adicionar-excecao').addEventListener('click', abrirModal);
  document.getElementById('btn-fechar-modal').addEventListener('click', fecharModal);
  document.getElementById('btn-cancelar-modal').addEventListener('click', fecharModal);

  // Botão Sair
  document.getElementById('btn-sair').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = '../paginasAuth/login.html';
  });

  // Listener do select de Escopo
  escopoSelect.addEventListener('change', () => {
    const escopo = escopoSelect.value;
    if (escopo === 'SALA_UNICA') {
      campoCodigoSala.style.display = 'block';
      campoBloco.style.display = 'none';
    } else if (escopo === 'BLOCO') {
      campoCodigoSala.style.display = 'none';
      campoBloco.style.display = 'block';
    } else { // TODAS
      campoCodigoSala.style.display = 'none';
      campoBloco.style.display = 'none';
    }
  });

  // Evento de Submit do Formulário
  excecaoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('access_token');
    
    // Monta o payload com base no DTO que a API espera
    const payload = {
      motivo: document.getElementById('motivo').value,
      tipo: document.getElementById('tipo').value,
      escopo: document.getElementById('escopo').value,
      inicio: document.getElementById('inicio').value,
      fim: document.getElementById('fim').value,
      codigo_sala: document.getElementById('codigo_sala').value,
      bloco: document.getElementById('bloco').value,
    };

    try {
      const response = await fetch('http://localhost:3000/excecoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message.join ? errorData.message.join(', ') : errorData.message);
      }
      fecharModal();
      carregarPagina();
    } catch (error) {
      mensagemModal.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
  });

  // Delegação de evento para os botões de excluir na tabela
  tableBody.addEventListener('click', (event) => {
    const btnExcluir = event.target.closest('.btn-excluir');
    if (btnExcluir) {
      const id = btnExcluir.dataset.id;
      excluirExcecao(id);
    }
  });

  // --- CARREGAMENTO INICIAL ---
  carregarPagina();
});