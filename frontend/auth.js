function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
  document.getElementById('loginForm').classList.toggle('active', tab === 'login');
  document.getElementById('registerForm').classList.toggle('active', tab === 'register');
}

/**
 * @param {string} id - message element id
 * @param {string} text - message to show
 * @param {string} type - 'error' or 'success'
 */
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'message ' + type;
}

// login
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.message === 'Login successful') {
      localStorage.setItem('username', username);
      window.location.href = 'books.html';
    } else {
      showMsg('loginMsg', data.message, 'error');
    }
  } catch (err) {
    showMsg('loginMsg', 'Could not connect to server', 'error');
  }
}

// register
async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.id) {
      showMsg('registerMsg', 'Account created! You can now sign in.', 'success');
      setTimeout(() => switchTab('login'), 1500);
    } else {
      showMsg('registerMsg', data.message, 'error');
    }
  } catch (err) {
    showMsg('registerMsg', 'Could not connect to server', 'error');
  }
}