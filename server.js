const express = require('express');
const http = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const adminUser = process.env.KABEB_ADMIN_USER || 'kabeb-admin';
const adminPass = process.env.KABEB_ADMIN_PASS || 'radar123';
const clients = new Set();
const officialWarnings = [
  {
    id: 'off-1',
    type: 'severe_thunderstorm',
    issuedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 40 * 60 * 1000).toISOString(),
    description: 'Quarter-size hail and 60 mph wind gusts are possible.',
    color: '#f59e0b',
    geometry: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[[-97.8, 35.4], [-97.2, 35.4], [-97.1, 35.8], [-97.7, 35.9], [-97.8, 35.4]]]
      }
    }
  },
  {
    id: 'off-2',
    type: 'flash_flood',
    issuedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 80 * 60 * 1000).toISOString(),
    description: 'Flooding caused by excessive rainfall is expected in low-lying areas.',
    color: '#22c55e',
    geometry: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[[-96.95, 32.6], [-96.4, 32.6], [-96.35, 33.0], [-96.85, 33.1], [-96.95, 32.6]]]
      }
    }
  }
];
let kabebWarnings = [];

app.prepare().then(() => {
  const expressApp = express();
  expressApp.use(express.json());

  expressApp.get('/api/bootstrap', (_, res) => {
    res.json({
      officialWarnings,
      kabebWarnings,
      socketPath: '/ws',
      adminHint: adminUser
    });
  });

  expressApp.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body || {};
    if (username === adminUser && password === adminPass) {
      return res.json({ ok: true, username });
    }

    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  });

  expressApp.all('*', (req, res) => handle(req, res));

  const server = http.createServer(expressApp);
  const io = new Server(server, {
    path: '/ws',
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    clients.add(socket.id);
    socket.emit('kabeb:init', kabebWarnings);

    socket.on('kabeb:create', (warning) => {
      kabebWarnings = [warning, ...kabebWarnings];
      io.emit('kabeb:new', warning);
    });

    socket.on('disconnect', () => {
      clients.delete(socket.id);
    });
  });

  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`> Radar-PP ready on http://localhost:${port} (${clients.size} clients)`);
  });
});
