// js/cadastro.js

// 1. Pega uma referência ao formulário no HTML
const form = document.getElementById('cadastro-form');
const mensagemDiv = document.getElementById('mensagem');

// 2. Adiciona um "ouvinte" para o evento de 'submit' (envio) do formulário
form.addEventListener('submit', async (event) => {
  // 3. Impede o comportamento padrão do formulário, que é recarregar a página
  event.preventDefault();

  // 4. Pega os valores dos campos de input
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmar-senha').value;

  // 5. Validação rápida no frontend (boa prática de UX)
  if (senha !== confirmarSenha) {
    mensagemDiv.innerHTML = `<div class="alert alert-danger">As senhas não correspondem.</div>`;
    return;
  }

  // 6. Monta o objeto de dados que a API espera (deve bater com o seu CreateUsuarioDto)
  const dadosUsuario = {
    nome,
    email,
    senha,
    confirmar_senha: confirmarSenha,
    tipo: 'user', // Define 'user' como padrão para auto-cadastro
  };

  // 7. Envia os dados para a API usando fetch
  try {
    const response = await fetch('http://localhost:3000/usuarios', {
      method: 'POST', // Método da requisição
      headers: {
        'Content-Type': 'application/json', // Informa que estamos enviando JSON
      },
      body: JSON.stringify(dadosUsuario), // Converte o objeto JavaScript em uma string JSON
    });

    const data = await response.json();

    // 8. Trata a resposta da API
    if (response.ok) {
      // Se a resposta for sucesso (status 2xx)
      mensagemDiv.innerHTML = `<div class="alert alert-success">Cadastro realizado com sucesso! Redirecionando para o login...</div>`;
      // Redireciona para a página de login após 2 segundos
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      // Se a resposta for erro (status 4xx, 5xx)
      // A mensagem de erro vem do 'message' que o NestJS envia
      const errorMessage = Array.isArray(data.message) ? data.message.join('<br>') : data.message;
      mensagemDiv.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
    }
  } catch (error) {
    // Trata erros de rede (API fora do ar, etc)
    mensagemDiv.innerHTML = `<div class="alert alert-danger">Não foi possível conectar à API. Tente novamente mais tarde.</div>`;
    console.error('Erro ao cadastrar:', error);
  }
});