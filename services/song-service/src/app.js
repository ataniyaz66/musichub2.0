require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const client = require('prom-client');
const songRoutes = require('./routes/songRoutes');

const app = express();
const PORT = process.env.PORT || 4002;

// ── Prometheus metrics ──────────────────────────────────────
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'song_http_requests_total',
  help: 'Total HTTP requests to song-service',
  labelNames: ['method', 'route', 'status'],
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

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/songs', songRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'song-service' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ── MongoDB connection ───────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[song-service] MongoDB connected');
    app.listen(PORT, () =>
      console.log(`[song-service] Running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('[song-service] MongoDB error:', err.message);
    process.exit(1);
  });