import { authAPI, setToken, setUser, redirectIfLoggedIn, showAlert } from './api.js';

redirectIfLoggedIn();

// ── Login ────────────────────────────────────────────────────
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Logging in...';

    try {
      const data = await authAPI.login({
        email:    document.getElementById('email').value,
        password: document.getElementById('password').value,
      });
      setToken(data.token);
      setUser(data.user);
      window.location.href = '/pages/index.html';
    } catch (err) {
      showAlert('alert', err.message);
      btn.disabled = false;
      btn.textContent = 'Login';
    }
  });
}

// ── Register ─────────────────────────────────────────────────
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Creating account...';

    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirm').value;

    if (password !== confirm) {
      showAlert('alert', 'Passwords do not match');
      btn.disabled = false;
      btn.textContent = 'Register';
      return;
    }

    try {
      const data = await authAPI.register({
        username: document.getElementById('username').value,
        email:    document.getElementById('email').value,
        password,
      });
      setToken(data.token);
      setUser(data.user);
      window.location.href = '/pages/index.html';
    } catch (err) {
      showAlert('alert', err.message);
      btn.disabled = false;
      btn.textContent = 'Register';
    }
  });
}