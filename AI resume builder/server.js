const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

function ensureDb() {
  if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const seed = {
      clients: [
        {
          id: 1,
          name: 'Rohan Mehta',
          email: 'rohan.mehta@email.com',
          phone: '+91-9876543210',
          segment: 'HNI',
          riskProfile: 'Moderate',
          preferredSectors: ['Technology', 'Banking'],
          watchlist: ['INFY', 'HDFCBANK', 'TCS'],
          holdings: [
            { symbol: 'INFY', qty: 30, avgPrice: 1480 },
            { symbol: 'HDFCBANK', qty: 20, avgPrice: 1535 }
          ],
          notes: 'Prefers large-cap exposure and quarterly review calls.',
          createdAt: new Date().toISOString()
        }
      ],
      interactions: [
        {
          id: 1,
          clientId: 1,
          type: 'Call',
          summary: 'Discussed SIP increase and earnings season strategy.',
          date: new Date().toISOString()
        }
      ],
      tasks: [
        {
          id: 1,
          clientId: 1,
          title: 'Share Q4 portfolio rebalance proposal',
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
          priority: 'High',
          status: 'Open'
        }
      ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf8');
  }
}

function readDb() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendText(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

function nextId(items) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function dashboardStats(db) {
  const openTasks = db.tasks.filter((t) => t.status !== 'Done').length;
  const highRiskClients = db.clients.filter((c) => c.riskProfile === 'Aggressive').length;
  const dueToday = db.tasks.filter((t) => t.dueDate === new Date().toISOString().slice(0, 10)).length;
  return {
    totalClients: db.clients.length,
    openTasks,
    highRiskClients,
    interactionsLogged: db.interactions.length,
    dueToday
  };
}

function serveStatic(req, res, pathname) {
  const filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);
  const normalized = path.normalize(filePath);

  if (!normalized.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(normalized, (err, data) => {
    if (err) {
      sendText(res, 404, 'Not found');
      return;
    }

    const ext = path.extname(normalized).toLowerCase();
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8'
    };

    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

async function handleApi(req, res, pathname) {
  const db = readDb();

  if (req.method === 'GET' && pathname === '/api/clients') {
    return sendJson(res, 200, db.clients);
  }

  if (req.method === 'POST' && pathname === '/api/clients') {
    const payload = await parseBody(req);
    if (!payload.name) return sendJson(res, 400, { error: 'name is required' });

    const client = {
      id: nextId(db.clients),
      name: payload.name,
      email: payload.email || '',
      phone: payload.phone || '',
      segment: payload.segment || 'Retail',
      riskProfile: payload.riskProfile || 'Conservative',
      preferredSectors: payload.preferredSectors || [],
      watchlist: payload.watchlist || [],
      holdings: payload.holdings || [],
      notes: payload.notes || '',
      createdAt: new Date().toISOString()
    };

    db.clients.push(client);
    writeDb(db);
    return sendJson(res, 201, client);
  }

  if (req.method === 'PUT' && pathname.startsWith('/api/clients/')) {
    const id = Number(pathname.split('/').pop());
    const idx = db.clients.findIndex((c) => c.id === id);
    if (idx === -1) return sendJson(res, 404, { error: 'client not found' });

    const payload = await parseBody(req);
    db.clients[idx] = { ...db.clients[idx], ...payload, id };
    writeDb(db);
    return sendJson(res, 200, db.clients[idx]);
  }

  if (req.method === 'DELETE' && pathname.startsWith('/api/clients/')) {
    const id = Number(pathname.split('/').pop());
    const exists = db.clients.some((c) => c.id === id);
    if (!exists) return sendJson(res, 404, { error: 'client not found' });

    db.clients = db.clients.filter((c) => c.id !== id);
    db.interactions = db.interactions.filter((i) => i.clientId !== id);
    db.tasks = db.tasks.filter((t) => t.clientId !== id);
    writeDb(db);
    return sendJson(res, 200, { success: true });
  }

  if (req.method === 'GET' && pathname === '/api/interactions') {
    return sendJson(res, 200, db.interactions);
  }

  if (req.method === 'POST' && pathname === '/api/interactions') {
    const payload = await parseBody(req);
    if (!payload.clientId || !payload.summary) return sendJson(res, 400, { error: 'clientId and summary are required' });

    const interaction = {
      id: nextId(db.interactions),
      clientId: Number(payload.clientId),
      type: payload.type || 'Note',
      summary: payload.summary,
      date: payload.date || new Date().toISOString()
    };

    db.interactions.push(interaction);
    writeDb(db);
    return sendJson(res, 201, interaction);
  }

  if (req.method === 'GET' && pathname === '/api/tasks') {
    return sendJson(res, 200, db.tasks);
  }

  if (req.method === 'POST' && pathname === '/api/tasks') {
    const payload = await parseBody(req);
    if (!payload.clientId || !payload.title) return sendJson(res, 400, { error: 'clientId and title are required' });

    const task = {
      id: nextId(db.tasks),
      clientId: Number(payload.clientId),
      title: payload.title,
      dueDate: payload.dueDate || new Date().toISOString().slice(0, 10),
      priority: payload.priority || 'Medium',
      status: payload.status || 'Open'
    };

    db.tasks.push(task);
    writeDb(db);
    return sendJson(res, 201, task);
  }

  if (req.method === 'PATCH' && pathname.startsWith('/api/tasks/')) {
    const id = Number(pathname.split('/').pop());
    const idx = db.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return sendJson(res, 404, { error: 'task not found' });

    const payload = await parseBody(req);
    db.tasks[idx] = { ...db.tasks[idx], ...payload, id };
    writeDb(db);
    return sendJson(res, 200, db.tasks[idx]);
  }

  if (req.method === 'GET' && pathname === '/api/dashboard') {
    return sendJson(res, 200, dashboardStats(db));
  }

  sendJson(res, 404, { error: 'api endpoint not found' });
}

ensureDb();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url.pathname);
      return;
    }

    serveStatic(req, res, url.pathname);
  } catch (error) {
    const status = error.message === 'Invalid JSON payload' ? 400 : 500;
    sendJson(res, status, { error: error.message || 'Internal server error' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Stock CRM running on http://127.0.0.1:${PORT}`);
});
