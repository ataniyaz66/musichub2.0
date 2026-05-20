import { usersAPI, isAdmin, requireAuth, showAlert, renderNavbar } from './api.js';

renderNavbar('admin');

if (!requireAuth() || !isAdmin()) {
  window.location.href = '/pages/index.html';
}

async function loadUsers() {
  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading users...</td></tr>';

  try {
    const data = await usersAPI.getAll();
    tbody.innerHTML = data.users.map(user => `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td><span class="badge badge-${user.role}">${user.role}</span></td>
        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-outline btn-sm"
            onclick="toggleRole('${user._id}', '${user.role}')">
            Make ${user.role === 'admin' ? 'User' : 'Admin'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteUser('${user._id}')">
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">${err.message}</td></tr>`;
  }
}

window.toggleRole = async (id, currentRole) => {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';
  try {
    await usersAPI.updateRole(id, newRole);
    loadUsers();
  } catch (err) {
    alert(err.message);
  }
};

window.deleteUser = async (id) => {
  if (!confirm('Delete this user?')) return;
  try {
    await usersAPI.delete(id);
    loadUsers();
  } catch (err) {
    alert(err.message);
  }
};

loadUsers();