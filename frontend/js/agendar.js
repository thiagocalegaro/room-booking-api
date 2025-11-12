document.addEventListener('DOMContentLoaded', () => {
  flatpickr("#agendamento-data", {
    dateFormat: "Y-m-d",
    minDate: "today"
  });

  const tituloSala = document.getElementById('sala-nome-titulo');
  const agendamentoForm = document.getElementById('agendamento-form');
  const mensagemModal = document.getElementById('modal-mensagem');
  
  const checkRecorrente = document.getElementById('agendamento-recorrente');
  const campoSemanas = document.getElementById('campo-semanas');
  
  let codigoSala = null;
  let token = null;

  async function carregarPagina() {
    const auth = verificarAcesso();
    if (!auth) return;
    token = auth.token; 

    const params = new URLSearchParams(window.location.search);
    codigoSala = params.get('sala');
    if (!codigoSala) {
      alert('Nenhuma sala selecionada.');
      window.location.href = 'index.html';
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/salas/${codigoSala}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Sala não encontrada.');
      const sala = await response.json();
      tituloSala.textContent = `Agendar Sala: ${sala.codigo} - ${sala.tipo}`;
    } catch (error) {
      tituloSala.textContent = 'Erro ao carregar sala.';
      console.error(error);
    }
  }

  // --- VERIFICAÇÃO DE ACESSO ---
  function verificarAcesso() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '../paginasAuth/login.html';
      return null;
    }
    try {
      const payload = jwt_decode.default(token); 
      return { token, payload };
    } catch (error) { 
      localStorage.removeItem('access_token');
      window.location.href = '../paginasAuth/login.html';
      return null;
    }
  }

  async function confirmarAgendamento(event) {
    event.preventDefault();
    const payload = jwt_decode.default(token);
    
    // Pega os dados dos inputs
    const data = document.getElementById('agendamento-data').value;
    const turno = document.getElementById('agendamento-turno').value;
    const isRecorrente = checkRecorrente.checked; 

    if (!data || !turno) {
      mensagemModal.innerHTML = `<div class="alert alert-danger">Por favor, selecione uma data e um turno.</div>`;
      return;
    }

    let url;
    let body;

    if (isRecorrente) {
      url = 'http://localhost:3000/agendamentos/recorrente';
      const numero_de_semanas = parseInt(document.getElementById('numero-semanas').value);
      
      body = JSON.stringify({
        id_usuario: payload.sub,
        codigo_sala: codigoSala,
        data: data,
        turno: turno,
        numero_de_semanas: numero_de_semanas
      });

    } else {
      // Se for único, chama o endpoint normal
      url = 'http://localhost:3000/agendamentos';
      
      body = JSON.stringify({
        id_usuario: payload.sub,
        codigo_sala: codigoSala,
        data: data,
        turno: turno
      });
    }

    try {
      const response = await fetch(url, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: body 
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Conflito de horário.');
      }
      
      alert('Agendamento realizado com sucesso! Redirecionando...');
      window.location.href = 'index.html'; 
      
    } catch (error) {
      mensagemModal.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
  }

  document.getElementById('btn-sair').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = '../paginasAuth/login.html';
  });
  
  agendamentoForm.addEventListener('submit', confirmarAgendamento);

  checkRecorrente.addEventListener('change', () => {
    if (checkRecorrente.checked) {
      campoSemanas.style.display = 'block'; // Mostra o campo
    } else {
      campoSemanas.style.display = 'none'; // Esconde o campo
    }
  });

  // --- CARREGAMENTO INICIAL ---
  carregarPagina();
});