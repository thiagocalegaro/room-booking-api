// js/gerenciar-usuarios.js

document.addEventListener('DOMContentLoaded', () => {
  // Referências aos elementos principais
  const tableBody = document.getElementById('usuarios-table-body');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const usuarioForm = document.getElementById('usuario-form');
  const modalTitle = document.getElementById('modal-title');
  const hiddenInput = document.getElementById('usuario-id-hidden');
  const mensagemModal = document.getElementById('modal-mensagem');
  const btnSalvar = document.getElementById('btn-salvar-usuario');
  const btnExcluirModal = document.getElementById('btn-excluir-modal');
  const totalUsuariosSpan = document.getElementById('total-usuarios-span');
  const searchBar = document.getElementById('search-bar');

  searchBar.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    
    // Seleciona todas as LINHAS da tabela
    const allRows = tableBody.querySelectorAll('tr');

    allRows.forEach(row => {
      // Pega o texto da linha
      const rowText = row.textContent.toLowerCase();
      
      if (rowText.includes(searchTerm)) {
        // Para tabelas, 'display' vazio reverte para 'table-row'
        row.style.display = ''; 
      } else {
        row.style.display = 'none'; // Esconde a linha
      }
    });
  });

  // --- FUNÇÕES DO MODAL ---
  const abrirModal = () => modalBackdrop.classList.add('show');
  const fecharModal = () => {
    modalBackdrop.classList.remove('show');
    usuarioForm.reset();
    mensagemModal.innerHTML = '';
    hiddenInput.value = '';
    btnExcluirModal.classList.remove('show');
  };

function renderizarTabela(usuarios) {
  tableBody.innerHTML = '';
  
  totalUsuariosSpan.textContent = usuarios.length;
  
  if (usuarios.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum usuário cadastrado.</td></tr>';
    return;
  }
  
  usuarios.forEach(usuario => {
    const tipoFormatado = usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1);
    
    // 👇 MUDANÇA AQUI: A linha <tr> agora é o botão de editar e é clicável
    const row = `
      <tr class="btn-editar clickable-row" data-id="${usuario.id}" title="Clique para editar">
        <td>${usuario.id}</td>
        <td>${usuario.nome}</td>
        <td>${usuario.email}</td>
        <td>${tipoFormatado}</td>
        </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', row);
  });
}

  // --- LÓGICA DE DADOS (API) ---

  // Abre o modal de edição
  async function abrirModalParaEditar(id) {
    const token = localStorage.getItem('access_token');
    try {
      // A API de usuários precisa de um método 'findOne'
      const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Não foi possível carregar os dados do usuário.');
      
      const usuario = await response.json();

      modalTitle.textContent = `Editar Usuário: ${usuario.nome}`;
      btnSalvar.textContent = 'Atualizar';
      hiddenInput.value = usuario.id;
      
      document.getElementById('tipo').value = usuario.tipo; // Preenche o select

      btnExcluirModal.classList.add('show');
      abrirModal();
    } catch (error) { alert(error.message); }
  }

  // Lógica de exclusão
  async function excluirUsuario(id) {
    const token = localStorage.getItem('access_token');
    if (!confirm(`Tem certeza que deseja excluir o usuário ID ${id}?`)) return;
    try {
      const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao excluir o usuário.');
      fecharModal();
      carregarPagina(); // Recarrega a lista
    } catch (error) { alert(error.message); }
  }

  // Lógica de carregamento principal
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

    // Carrega os usuários
    try {
      const response = await fetch('http://localhost:3000/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao carregar usuários.');
      const usuarios = await response.json();
      renderizarTabela(usuarios);
    } catch (error) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${error.message}</td></tr>`;
    }
  }

  // --- EVENT LISTENERS ---

  // Botões do Modal
  document.getElementById('btn-fechar-modal').addEventListener('click', fecharModal);
  document.getElementById('btn-cancelar-modal').addEventListener('click', fecharModal);

  // Botão Sair
  document.getElementById('btn-sair').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = '../paginasAuth/login.html';
  });
  
  // Botão Excluir do Modal
  btnExcluirModal.addEventListener('click', () => {
    const id = hiddenInput.value;
    if (id) excluirUsuario(id);
  });

  // Evento de Submit do Formulário (SÓ ATUALIZAÇÃO)
  usuarioForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('access_token');
    const id = hiddenInput.value;
    
    const novoTipo = document.getElementById('tipo').value;

    try {
      const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tipo: novoTipo }) // Envia apenas o campo 'tipo'
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

  // Listener da Tabela (para abrir o modal de edição)
  tableBody.addEventListener('click', (event) => {
    const row = event.target.closest('.btn-editar');
    if (row) {
      const id = row.dataset.id;
      abrirModalParaEditar(id);
    }
  });

  // --- CARREGAMENTO INICIAL ---
  carregarPagina();
});