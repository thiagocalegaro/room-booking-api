const form = document.getElementById('cadastro-form');
const mensagemDiv = document.getElementById('mensagem');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmar-senha').value;

  if (senha !== confirmarSenha) {
    mensagemDiv.innerHTML = `<div class="alert alert-danger">As senhas não correspondem.</div>`;
    return;
  }

  const dadosUsuario = {
    nome,
    email,
    senha,
    confirmar_senha: confirmarSenha,
    tipo: 'user',
  };

  try {
    const response = await fetch('http://localhost:3000/usuarios', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(dadosUsuario), 
    });

    const data = await response.json();

    if (response.ok) {
      mensagemDiv.innerHTML = `<div class="alert alert-success">Cadastro realizado com sucesso! Redirecionando para o login...</div>`;
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      
      const errorMessage = Array.isArray(data.message) ? data.message.join('<br>') : data.message;
      mensagemDiv.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
    }
  } catch (error) {
    mensagemDiv.innerHTML = `<div class="alert alert-danger">Não foi possível conectar à API. Tente novamente mais tarde.</div>`;
    console.error('Erro ao cadastrar:', error);
  }
});