// js/login.js

const form = document.getElementById('login-form');
const mensagemDiv = document.getElementById('mensagem');

// Função auxiliar para decodificar o token JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]; // Pega o payload do token
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null; // Retorna nulo se o token for inválido
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const dadosLogin = { email, senha };

  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosLogin),
    });

    const data = await response.json();

    if (response.ok) {
      mensagemDiv.innerHTML = `<div class="alert alert-success">Login bem-sucedido! Redirecionando...</div>`;

      // 1. Armazena o token
      localStorage.setItem('access_token', data.access_token);

      // 2. Decodifica o token para ler as informações do usuário
      const usuario = parseJwt(data.access_token);

      // 3. Lógica de redirecionamento com base no tipo de usuário
      setTimeout(() => {
        if (usuario && usuario.tipo === 'admin') {
          // Se for admin, redireciona para a página de admin
          window.location.href = '../paginasAdm/painel.html'; // Exemplo de página de admin
        } else {
          // Se for usuário comum, redireciona para a página padrão
          window.location.href = '../paginasUsuario/index.html'; // Exemplo de página de usuário
        }
      }, 1500);

    } else {
      const errorMessage = Array.isArray(data.message) ? data.message.join('<br>') : data.message;
      mensagemDiv.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
    }
  } catch (error) {
    mensagemDiv.innerHTML = `<div class="alert alert-danger">Erro ao conectar ao servidor. Verifique se a API está rodando.</div>`;
    console.error('Erro de fetch:', error);
  }
});