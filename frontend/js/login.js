const form = document.getElementById('login-form');
const mensagemDiv = document.getElementById('mensagem');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  mensagemDiv.innerHTML = '';

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  if (email.trim() === '' || senha.trim() === '') {
    mensagemDiv.innerHTML = `<div class="alert alert-danger">Por favor, preencha todos os campos.</div>`;
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (response.ok) {
      mensagemDiv.innerHTML = `<div class="alert alert-success">Login bem sucedido! Redirecionando...</div>`;
      
      const accessToken = data.access_token;
      localStorage.setItem('access_token', accessToken);
      
      setTimeout(() => {
        const payload = jwt_decode.default(accessToken);        
        const tipoUsuario = payload.tipo;

        if (tipoUsuario === 'admin') {
          window.location.href = '../paginasAdm/painel.html';
        } else {
          window.location.href = '../paginasUsuario/index.html';
        }
      }, 1500); 

    } else {
      const errorMessage = data.message || 'Credenciais inválidas.';
      mensagemDiv.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
    }
  } catch (error) {
    mensagemDiv.innerHTML = `<div class="alert alert-danger">Não foi possível conectar à API.</div>`;
    console.error('Erro de rede:', error);
  }
});