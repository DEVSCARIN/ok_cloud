const form = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Redirecionar para a nova rota ao logar com sucesso
      window.location.href = '/teste_ok/index.html';
    } else {
      messageDiv.textContent = data.detail || 'Erro no login';
      messageDiv.style.color = 'red';
    }
  } catch (error) {
    messageDiv.textContent = 'Erro ao conectar com o servidor.';
    messageDiv.style.color = 'red';
  }
});
