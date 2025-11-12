// js/gerenciar-recursos.js

document.addEventListener('DOMContentLoaded', () => {
  // --- REFERÊNCIAS AOS ELEMENTOS ---
  const modalBackdrop = document.getElementById('modal-backdrop');
  const btnAdicionar = document.getElementById('btn-adicionar-recurso');
  const btnFecharModal = document.getElementById('btn-fechar-modal');
  const btnCancelarModal = document.getElementById('btn-cancelar-modal');
  const recursoForm = document.getElementById('recurso-form');
  const tableBody = document.getElementById('recursos-table-body'); // Movido para o topo
  const mensagemModal = document.getElementById('modal-mensagem');

  // --- FUNÇÕES DO MODAL ---
  const abrirModal = () => modalBackdrop.classList.add('show');
  const fecharModal = () => {
    modalBackdrop.classList.remove('show');
    recursoForm.reset();
    mensagemModal.innerHTML = '';
  };

  // --- RENDERIZAÇÃO DA TABELA ---
  function renderizarTabela(recursos) {
    tableBody.innerHTML = ''; // Limpa a tabela
    if (recursos.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum recurso cadastrado.</td></tr>';
      return;
    }
    recursos.forEach(recurso => {
      const row = `
        <tr>
          <td>${recurso.id}</td>
          <td>${recurso.nome}</td>
          <td class="actions">
            <button class="btn btn-danger btn-sm btn-excluir" title="Excluir Recurso" data-id="${recurso.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
      tableBody.insertAdjacentHTML('beforeend', row);
    });
  }

  // --- LÓGICA DE EXCLUSÃO (A PARTE QUE FALTAVA) ---
  async function excluirRecurso(id) {
    const token = localStorage.getItem('access_token');
    if (!confirm(`Tem certeza que deseja excluir o recurso ID ${id}?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/recursos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao excluir o recurso.');
      carregarRecursos(); // Recarrega a lista
    } catch (error) {
      alert(error.message);
    }
  }

  // --- LÓGICA DE CARREGAMENTO PRINCIPAL E AUTENTICAÇÃO ---
  async function carregarRecursos() {
    const token = localStorage.getItem('access_token');
    
    // Proteção de rota
    if (!token) {
      window.location.href = '../paginasAuth/login.html';
      return;
    }
    try {
      const payload = jwt_decode.default(token);
      if (payload.tipo !== 'admin') {
        alert('Acesso negado.');
        window.location.href = '../paginasUsuario/index.html';
        return;
      }
    } catch (error) {
      localStorage.removeItem('access_token');
      window.location.href = '../paginasAuth/login.html';
      return;
    }

    // Carregar os recursos da API
    try {
      const response = await fetch('http://localhost:3000/recursos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao carregar recursos.');
      const recursos = await response.json();
      renderizarTabela(recursos);
    } catch (error) {
      tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">${error.message}</td></tr>`;
    }
  }

  // --- EVENT LISTENERS ---

  // Botões do Modal
  btnAdicionar.addEventListener('click', abrirModal);
  btnFecharModal.addEventListener('click', fecharModal);
  btnCancelarModal.addEventListener('click', fecharModal);
  
  // Botão Sair
  document.getElementById('btn-sair').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = '../paginasAuth/login.html';
  });

  // Evento de Submit do Formulário (Salvar novo recurso)
  recursoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nomeRecurso = document.getElementById('nome-recurso').value;
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:3000/recursos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nome: nomeRecurso })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar o recurso.');
      }
      fecharModal();
      carregarRecursos(); // Recarrega a lista

    } catch (error) {
      mensagemModal.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
  });

  // --- DELEGAÇÃO DE EVENTO PARA EXCLUSÃO (A PARTE QUE FALTAVA) ---
  tableBody.addEventListener('click', (event) => {
    const btnExcluir = event.target.closest('.btn-excluir'); // Procura pelo botão de excluir
    
    if (btnExcluir) {
      const id = btnExcluir.dataset.id; // Pega o ID do atributo data-id
      excluirRecurso(id);
    }
  });

  // --- CARREGAMENTO INICIAL ---
  carregarRecursos(); // Chama a função principal
});