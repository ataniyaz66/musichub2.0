import { songsAPI, isLoggedIn, isAdmin, getUser, requireAuth, showAlert, renderNavbar } from './api.js';

renderNavbar('songs');

let currentPage = 1;
let currentSearch = '';
let currentSort = 'newest';

async function loadSongs() {
  const grid = document.getElementById('songs-grid');
  grid.innerHTML = '<div class="loading">Loading songs...</div>';

  try {
    const data = await songsAPI.getAll({
      search: currentSearch,
      sort:   currentSort,
      page:   currentPage,
      limit:  12,
    });

    if (data.songs.length === 0) {
      grid.innerHTML = '<div class="empty-state"><h3>No songs found</h3><p>Try a different search</p></div>';
      return;
    }

    const user    = getUser();
    const admin   = isAdmin();
    const loggedIn = isLoggedIn();

    grid.innerHTML = data.songs.map(song => `
      <div class="song-card">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}</div>
        <div class="song-meta">
          <span>${song.genre || 'Unknown'}</span>
          <span>${song.year || '—'}</span>
          <span>${formatDuration(song.duration)}</span>
        </div>
        <div class="song-meta">By: ${song.createdByUsername}</div>
        <div class="song-actions" style="margin-top:0.8rem">
          ${(loggedIn && (song.createdBy === user?.id || admin))
            ? `<a href="/pages/song-form.html?id=${song._id}" class="btn btn-outline btn-sm">Edit</a>`
            : ''}
          ${admin
            ? `<button class="btn btn-danger btn-sm" onclick="deleteSong('${song._id}')">Delete</button>`
            : ''}
        </div>
      </div>
    `).join('');

    renderPagination(data.pagination);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><h3>Error loading songs</h3><p>${err.message}</p></div>`;
  }
}

function formatDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function renderPagination(pagination) {
  const el = document.getElementById('pagination');
  if (!el || pagination.pages <= 1) { if(el) el.innerHTML = ''; return; }

  let html = '';
  for (let i = 1; i <= pagination.pages; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  el.innerHTML = html;
}

window.goToPage = (page) => { currentPage = page; loadSongs(); };

window.deleteSong = async (id) => {
  if (!confirm('Delete this song?')) return;
  try {
    await songsAPI.delete(id);
    loadSongs();
  } catch (err) {
    alert(err.message);
  }
};

// ── Search & sort ────────────────────────────────────────────
document.getElementById('search-input')?.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  currentPage = 1;
  loadSongs();
});

document.getElementById('sort-select')?.addEventListener('change', (e) => {
  currentSort = e.target.value;
  currentPage = 1;
  loadSongs();
});

document.getElementById('my-songs-btn')?.addEventListener('click', () => {
  if (!requireAuth()) return;
  // toggle mine filter — simple approach
  window.location.href = '/pages/index.html?mine=true';
});

loadSongs();