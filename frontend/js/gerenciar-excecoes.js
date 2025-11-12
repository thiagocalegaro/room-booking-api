document.addEventListener('DOMContentLoaded', () => {
  flatpickr(".datetime-picker", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true,
  });

  const tableBody = document.getElementById('excecoes-table-body');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const excecaoForm = document.getElementById('excecao-form');
  const mensagemModal = document.getElementById('modal-mensagem');
  
  const escopoSelect = document.getElementById('escopo');
  const campoCodigoSala = document.getElementById('campo-codigo-sala');
  const campoBloco = document.getElementById('campo-bloco');

  const abrirModal = () => modalBackdrop.classList.add('show');
  const fecharModal = () => {
    modalBackdrop.classList.remove('show');
    excecaoForm.reset();
    mensagemModal.innerHTML = '';
    campoCodigoSala.style.display = 'block';
    campoBloco.style.display = 'none';
  };

  function renderizarTabela(excecoes) {
    tableBody.innerHTML = '';
    if (excecoes.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma exceção cadastrada.</td></tr>';
      return;
    }
    
    excecoes.forEach(excecao => {
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
      carregarPagina(); 
    } catch (error) {
      alert(error.message);
    }
  }

  async function carregarPagina() {
    const token = localStorage.getItem('access_token');
    
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
      console.error('ERRO AO VERIFICAR TOKEN:', error);
      localStorage.removeItem('access_token');
      window.location.href = '../paginasAuth/login.html';
      return;
    }

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


  document.getElementById('btn-adicionar-excecao').addEventListener('click', abrirModal);
  document.getElementById('btn-fechar-modal').addEventListener('click', fecharModal);
  document.getElementById('btn-cancelar-modal').addEventListener('click', fecharModal);

  document.getElementById('btn-sair').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = '../paginasAuth/login.html';
  });

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

  excecaoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('access_token');
    
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

  tableBody.addEventListener('click', (event) => {
    const btnExcluir = event.target.closest('.btn-excluir');
    if (btnExcluir) {
      const id = btnExcluir.dataset.id;
      excluirExcecao(id);
    }
  });

  carregarPagina();
});