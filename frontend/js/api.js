// Shared API helper — all fetch calls go through here

const API_BASE = '/api';

// ── Token helpers ────────────────────────────────────────────
export const getToken  = ()         => localStorage.getItem('token');
export const setToken  = (token)    => localStorage.setItem('token', token);
export const getUser   = ()         => JSON.parse(localStorage.getItem('user') || 'null');
export const setUser   = (user)     => localStorage.setItem('user', JSON.stringify(user));
export const clearAuth = ()         => { localStorage.removeItem('token'); localStorage.removeItem('user'); };
export const isLoggedIn = ()        => !!getToken();
export const isAdmin    = ()        => getUser()?.role === 'admin';

// ── Redirect helpers ─────────────────────────────────────────
export const requireAuth = () => {
  if (!isLoggedIn()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
};

export const redirectIfLoggedIn = () => {
  if (isLoggedIn()) {
    window.location.href = '/pages/index.html';
  }
};

// ── Base fetch ───────────────────────────────────────────────
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ── Auth API ─────────────────────────────────────────────────
export const authAPI = {
  register: (body)   => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body)   => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  me:       ()       => apiFetch('/auth/me'),
};

// ── Songs API ────────────────────────────────────────────────
export const songsAPI = {
  getAll:  (params = {}) => apiFetch('/songs?' + new URLSearchParams(params)),
  getById: (id)          => apiFetch(`/songs/${id}`),
  create:  (body)        => apiFetch('/songs',     { method: 'POST',   body: JSON.stringify(body) }),
  update:  (id, body)    => apiFetch(`/songs/${id}`,{ method: 'PUT',   body: JSON.stringify(body) }),
  delete:  (id)          => apiFetch(`/songs/${id}`,{ method: 'DELETE' }),
};

// ── Users API ────────────────────────────────────────────────
export const usersAPI = {
  getAll:     (params = {}) => apiFetch('/users?' + new URLSearchParams(params)),
  getProfile: ()            => apiFetch('/users/profile'),
  updateRole: (id, role)    => apiFetch(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  delete:     (id)          => apiFetch(`/users/${id}`,      { method: 'DELETE' }),
};

// ── Chat API ─────────────────────────────────────────────────
export const chatAPI = {
  getConversations: ()          => apiFetch('/chat/conversations'),
  getOrCreateRoom:  (otherUserId) => apiFetch('/chat/room', { method: 'POST', body: JSON.stringify({ otherUserId }) }),
  getRoomMessages:  (roomId)    => apiFetch(`/chat/room/${roomId}`),
  markAsRead:       (roomId)    => apiFetch(`/chat/room/${roomId}/read`, { method: 'PUT' }),
};

// ── Navbar ───────────────────────────────────────────────────
export function renderNavbar(activePage = '') {
  const user = getUser();
  const nav = document.getElementById('navbar');
  if (!nav) return;

  nav.innerHTML = `
    <a href="/pages/index.html" class="logo">🎵 MusicHub</a>
    <div class="nav-links">
      <a href="/pages/index.html"     class="${activePage === 'songs' ? 'active' : ''}">Songs</a>
      ${user ? `<a href="/pages/chat.html" class="${activePage === 'chat' ? 'active' : ''}">Chat</a>` : ''}
      ${user?.role === 'admin' ? `<a href="/pages/admin.html" class="${activePage === 'admin' ? 'active' : ''}">Admin</a>` : ''}
      ${user
        ? `<a href="/pages/song-form.html" class="${activePage === 'add' ? 'active' : ''}">+ Add Song</a>
           <a href="#" id="logout-btn">Logout (${user.username})</a>`
        : `<a href="/pages/login.html" class="${activePage === 'login' ? 'active' : ''}">Login</a>
           <a href="/pages/register.html" class="${activePage === 'register' ? 'active' : ''}">Register</a>`
      }
    </div>
  `;

  document.getElementById('logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    clearAuth();
    window.location.href = '/pages/login.html';
  });
}

// ── Alert helper ─────────────────────────────────────────────
export function showAlert(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove('show'), 4000);
}