require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const client = require('prom-client');
const jwt = require('jsonwebtoken');
const chatRoutes = require('./routes/chatRoutes');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4004;

// ── Prometheus metrics ──────────────────────────────────────
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'chat_http_requests_total',
  help: 'Total HTTP requests to chat-service',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const messageCounter = new client.Counter({
  name: 'chat_messages_total',
  help: 'Total messages sent via chat-service',
  registers: [register],
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode,
    });
  });
  next();
});

// ── Socket.io setup ─────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Authenticate socket connections with JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));

  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`[chat-service] User connected: ${socket.user.username}`);

  // Join a private room between two users
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`[chat-service] ${socket.user.username} joined room ${roomId}`);
  });

  // Handle new message
  socket.on('send_message', async (data) => {
    try {
      const { roomId, receiverId, receiverUsername, content } = data;

      const message = await Message.create({
        roomId,
        senderId:         socket.user.id,
        senderUsername:   socket.user.username,
        receiverId,
        receiverUsername,
        content,
      });

      messageCounter.inc();

      // Emit to everyone in the room
      io.to(roomId).emit('receive_message', message);
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[chat-service] User disconnected: ${socket.user.username}`);
  });
});

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/chat', chatRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chat-service' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ── MongoDB connection ───────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[chat-service] MongoDB connected');
    server.listen(PORT, () =>
      console.log(`[chat-service] Running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('[chat-service] MongoDB error:', err.message);
    process.exit(1);
  });