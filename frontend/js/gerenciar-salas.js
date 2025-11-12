// js/gerenciar-salas.js

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o flatpickr
  flatpickr(".time-picker", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true
  });

  const searchBar = document.getElementById('search-bar');
  
  // ... (suas funções: abrirModal, fecharModal, renderizarCards, etc.) ...

  // 👇 ADICIONE ESTE NOVO "OUVINTE" DE EVENTO 👇
  searchBar.addEventListener('input', (event) => {
    // 1. Pega o que o usuário digitou e converte para minúsculo
    const searchTerm = event.target.value.toLowerCase();
    
    // 2. Pega todos os cards que estão na tela
    const allCards = gridContainer.querySelectorAll('.card-admin');

    // 3. Itera sobre cada card
    allCards.forEach(card => {
      // 4. Pega todo o texto de dentro do card e converte para minúsculo
      const cardText = card.textContent.toLowerCase();
      
      // 5. Verifica se o texto do card inclui o termo da pesquisa
      if (cardText.includes(searchTerm)) {
        card.style.display = 'block'; // Mostra o card
      } else {
        card.style.display = 'none'; // Esconde o card
      }
    });
  });
  // Referências aos elementos principais
  const gridContainer = document.getElementById('salas-grid-container');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const salaForm = document.getElementById('sala-form');
  const modalTitle = document.getElementById('modal-title');
  const hiddenInput = document.getElementById('sala-codigo-hidden');
  const codigoInput = document.getElementById('codigo');
  const mensagemModal = document.getElementById('modal-mensagem');
  const btnSalvar = document.getElementById('btn-salvar-sala');
  const btnExcluirModal = document.getElementById('btn-excluir-modal');

  // --- NOVO: Referências para Recursos ---
  const recursosContainer = document.getElementById('recursos-selecionados-container');
  let todosRecursos = []; // Array para guardar os recursos da API

  // --- FUNÇÕES DO MODAL ---
  const abrirModal = () => modalBackdrop.classList.add('show');
  const fecharModal = () => {
    modalBackdrop.classList.remove('show');
    salaForm.reset();
    mensagemModal.innerHTML = '';
    hiddenInput.value = '';
    codigoInput.disabled = false;
    modalTitle.textContent = 'Adicionar Nova Sala';
    btnSalvar.textContent = 'Salvar';
    btnExcluirModal.classList.remove('show');
    
    // --- NOVO: Reseta os campos de recursos para 0 ---
    const inputs = recursosContainer.querySelectorAll('.recurso-item input');
    inputs.forEach(input => input.value = 0);
  };

function gerarListaRecursos(recursos) {
  // Se não houver recursos, retorna uma mensagem simples
  if (!recursos || recursos.length === 0) {
    return '<p class="card-recursos-compacto">Sem recursos adicionados.</p>';
  }

  // Mapeia o array de recursos para strings no formato "Nome | Qtd: X"
  const listaFormatada = recursos.map(rec => {
    return `${rec.nome} | Qtd: ${rec.quantidade}`;
  });

  // Junta todas as strings com vírgula e espaço, e coloca dentro de um parágrafo
  return `
    <p class="card-recursos-titulo">Recursos:</p>
    <p class="card-recursos-compacto">${listaFormatada.join(', ')}</p>
  `;
}

function renderizarCards(salas) {
  gridContainer.innerHTML = '';
  if (salas.length === 0) {
    gridContainer.innerHTML = '<p class="text-center">Nenhuma sala cadastrada.</p>';
    return;
  }
  
  salas.forEach(sala => {
    const statusBadge = sala.isAtiva 
      ? '<span class="badge badge-success">Ativa</span>' 
      : '<span class="badge badge-danger">Inativa</span>';
    
    // Chama a função auxiliar para gerar o HTML dos recursos
    const recursosHtml = gerarListaRecursos(sala.recursos);
    
    const card = `
      <div class="card-admin btn-editar" data-codigo="${sala.codigo}" title="Clique para editar">
        <h3>${sala.codigo} - ${sala.tipo || 'N/A'}</h3>
        
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
            ${statusBadge}
          </div>

          <div class="card-col-recursos">
            ${recursosHtml}
          </div>

        </div> </div>
    `;
    gridContainer.insertAdjacentHTML('beforeend', card);
  });
}

  async function carregarRecursosDisponiveis() {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://localhost:3000/recursos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao carregar lista de recursos.');
      
      todosRecursos = await response.json();
      
      // Ordena os recursos por nome
      todosRecursos.sort((a, b) => a.nome.localeCompare(b.nome));

      // Constrói a lista permanente de inputs de recursos
      recursosContainer.innerHTML = ''; // Limpa
      todosRecursos.forEach(recurso => {
        const novoCampo = `
          <div class="form-row recurso-item" data-recurso-id="${recurso.id}">
            <label class="form-label">${recurso.nome}</label>
            <input type="number" class="form-control" value="0" min="0">
          </div>
        `;
        recursosContainer.insertAdjacentHTML('beforeend', novoCampo);
      });

    } catch (error) {
      console.error(error);
      recursosContainer.innerHTML = '<p class="text-danger">Erro ao carregar recursos.</p>';
    }
  }

  // --- LÓGICA DE EDIÇÃO (MODIFICADA para incluir recursos) ---
  async function abrirModalParaEditar(codigo) {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:3000/salas/${codigo}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Não foi possível carregar os dados da sala.');
      
      const sala = await response.json();

      // Preenche os dados da sala
      modalTitle.textContent = 'Editar Sala';
      btnSalvar.textContent = 'Atualizar';
      hiddenInput.value = sala.codigo;
      codigoInput.value = sala.codigo;
      codigoInput.disabled = true;
      document.getElementById('tipo').value = sala.tipo || '';
      document.getElementById('bloco').value = sala.bloco || '';
      document.getElementById('capacidade').value = sala.capacidade;
      document.getElementById('hora_inicio').value = sala.hora_inicio.substring(0, 5);
      document.getElementById('hora_fim').value = sala.hora_fim.substring(0, 5);
      document.getElementById('disponivel_sabado').checked = sala.disponivel_sabado;
      document.getElementById('disponivel_domingo').checked = sala.disponivel_domingo;
      document.getElementById('ativa').checked = sala.isAtiva;

      // --- NOVO: Preenche as quantidades de recursos existentes ---
      // Reseta todos os campos de quantidade para 0
      const allInputs = recursosContainer.querySelectorAll('.recurso-item input');
      allInputs.forEach(input => input.value = 0);

      // Preenche as quantidades dos recursos que a sala já possui
      // (Supondo que a API retorne 'sala.recursos' no 'findOne')
      if (sala.recursos && sala.recursos.length > 0) {
        sala.recursos.forEach(rec => {
          const input = recursosContainer.querySelector(`[data-recurso-id="${rec.recurso.id}"] input`);
          if (input) {
            input.value = rec.quantidade;
          }
        });
      }
      
      btnExcluirModal.classList.add('show');
      abrirModal();
    } catch (error) { alert(error.message); }
  }

  // --- LÓGICA DE EXCLUSÃO (Sua função original) ---
  async function excluirSala(codigo) {
    const token = localStorage.getItem('access_token');
    if (!confirm(`Tem certeza que deseja excluir a sala ${codigo}?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/salas/${codigo}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao excluir a sala.');
      fecharModal();
      carregarSalas();
    } catch (error) { alert(error.message); }
  }

  // --- NOVO: Função de carregamento de página unificada ---
  async function carregarPagina() {
    // 1. Verifica o token e o tipo de usuário
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '../paginasAuth/login.html';
      return;
    }
    try {
      const payload = jwt_decode.default(token); // Sua chamada correta
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

    // 2. Carrega tudo em paralelo (salas e recursos)
    try {
      // Promise.all executa ambas as funções ao mesmo tempo
      await Promise.all([
        carregarSalas(),
        carregarRecursosDisponiveis()
      ]);
    } catch (error) {
      gridContainer.innerHTML = `<p class="text-center text-danger">${error.message}</p>`;
    }
  }

  // (MODIFICADO) 'carregarSalas' agora só busca e renderiza as salas
  async function carregarSalas() {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://localhost:3000/salas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao carregar salas.');
      const salas = await response.json();
      renderizarCards(salas);
    } catch (error) {
      gridContainer.innerHTML = `<p class="text-center text-danger">${error.message}</p>`;
    }
  }

  // --- EVENT LISTENERS ---
  document.getElementById('btn-adicionar-sala').addEventListener('click', abrirModal);
  document.getElementById('btn-fechar-modal').addEventListener('click', fecharModal);
  document.getElementById('btn-cancelar-modal').addEventListener('click', fecharModal);

  document.getElementById('btn-sair').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = '../paginasAuth/login.html';
  });
  
  btnExcluirModal.addEventListener('click', () => {
    const codigo = hiddenInput.value;
    if (codigo) {
      excluirSala(codigo);
    }
  });

  // --- SUBMIT DO FORMULÁRIO (MODIFICADO para incluir recursos) ---
  salaForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('access_token');
    const id = hiddenInput.value;
    const isEditMode = !!id;

    // 1. Dados da Sala (Sua lógica original)
    const salaData = {
      codigo: document.getElementById('codigo').value,
      tipo: document.getElementById('tipo').value,
      bloco: document.getElementById('bloco').value,
      capacidade: parseInt(document.getElementById('capacidade').value),
      hora_inicio: document.getElementById('hora_inicio').value,
      hora_fim: document.getElementById('hora_fim').value,
      disponivel_sabado: document.getElementById('disponivel_sabado').checked,
      disponivel_domingo: document.getElementById('disponivel_domingo').checked,
      isAtiva: document.getElementById('ativa').checked,
    };

    // 2. --- NOVO: Coleta os dados dos Recursos ---
    const recursosInput = recursosContainer.querySelectorAll('.recurso-item');
    const recursos = [];
    recursosInput.forEach(item => {
      const id = item.dataset.recursoId;
      const quantidade = parseInt(item.querySelector('input').value);
      
      // Só envia para a API se a quantidade for maior que 0
      if (quantidade > 0) { 
        recursos.push({
          id: parseInt(id), // API espera 'id'
          quantidade: quantidade
        });
      }
    });
    
    // 3. --- NOVO: Combina tudo no payload final ---
    const payloadCompleto = {
      ...salaData,
      recursos: recursos
    };

    if (isEditMode) delete payloadCompleto.codigo;

    const url = isEditMode ? `http://localhost:3000/salas/${id}` : 'http://localhost:3000/salas';
    const method = isEditMode ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payloadCompleto) // Envia o payload com os recursos
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message.join ? errorData.message.join(', ') : errorData.message);
      }
      fecharModal();
      carregarSalas();
    } catch (error) {
      mensagemModal.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
  });

  // Listener do Grid (Sua lógica original)
  gridContainer.addEventListener('click', (event) => {
    const btnEditar = event.target.closest('.btn-editar');
    if (btnEditar) {
      const codigo = btnEditar.dataset.codigo;
      abrirModalParaEditar(codigo);
    }
  });

  // --- CARREGAMENTO INICIAL ---
  carregarPagina(); // Chama a nova função que carrega tudo
});