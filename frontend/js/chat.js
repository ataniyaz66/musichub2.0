import { chatAPI, getUser, getToken, requireAuth, renderNavbar } from './api.js';
import { io } from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';

renderNavbar('chat');
if (!requireAuth()) throw new Error('Not logged in');

const me = getUser();
let currentRoomId = null;
let socket = null;

// ── Connect socket ───────────────────────────────────────────
function connectSocket() {
  socket = io('/', {
    path: '/socket.io',
    auth: { token: getToken() },
  });

  socket.on('receive_message', (msg) => {
    if (msg.roomId === currentRoomId) appendMessage(msg);
  });
}

// ── Load conversations ────────────────────────────────────────
async function loadConversations() {
  const list = document.getElementById('conv-list');
  try {
    const convs = await chatAPI.getConversations();
    if (convs.length === 0) {
      list.innerHTML = '<div style="padding:1rem;color:var(--text-muted)">No conversations yet</div>';
      return;
    }
    list.innerHTML = convs.map(c => {
      const other = c.senderId === me.id ? c.receiverUsername : c.senderUsername;
      return `
        <div class="conversation-item" onclick="openRoom('${c._id}', '${other}')">
          <div class="conv-name">${other}</div>
          <div class="conv-preview">${c.lastMessage}</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    list.innerHTML = `<div style="padding:1rem;color:var(--text-muted)">${err.message}</div>`;
  }
}

// ── Open room ────────────────────────────────────────────────
window.openRoom = async (roomId, otherUsername) => {
  currentRoomId = roomId;
  document.getElementById('chat-with').textContent = otherUsername;

  if (socket) socket.emit('join_room', roomId);

  const { messages } = await chatAPI.getRoomMessages(roomId);
  const container = document.getElementById('messages');
  container.innerHTML = messages.map(m => buildMessage(m)).join('');
  container.scrollTop = container.scrollHeight;

  await chatAPI.markAsRead(roomId);
};

function buildMessage(msg) {
  const isMine = msg.senderId === me.id;
  return `
    <div class="message ${isMine ? 'sent' : 'received'}">
      ${!isMine ? `<div class="msg-sender">${msg.senderUsername}</div>` : ''}
      ${msg.content}
    </div>
  `;
}

function appendMessage(msg) {
  const container = document.getElementById('messages');
  container.insertAdjacentHTML('beforeend', buildMessage(msg));
  container.scrollTop = container.scrollHeight;
}

// ── Send message ─────────────────────────────────────────────
document.getElementById('send-btn')?.addEventListener('click', sendMessage);
document.getElementById('msg-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const input = document.getElementById('msg-input');
  const content = input.value.trim();
  if (!content || !currentRoomId || !socket) return;

  socket.emit('send_message', {
    roomId: currentRoomId,
    content,
    receiverId: '',
    receiverUsername: '',
  });

  input.value = '';
}

// ── New chat ─────────────────────────────────────────────────
document.getElementById('new-chat-btn')?.addEventListener('click', async () => {
  const username = prompt('Enter username to chat with:');
  if (!username) return;
  alert('Feature coming soon — use user IDs for now');
});

connectSocket();
loadConversations();