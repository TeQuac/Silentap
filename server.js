const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'users.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function readUsers() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1e6) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function normalizeName(name) {
  return String(name || '').trim();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  if (pathname === '/api/users/top' && req.method === 'GET') {
    const users = readUsers()
      .sort((a, b) => b.highscore - a.highscore)
      .slice(0, 10);
    sendJson(res, 200, { users });
    return;
  }

  if (pathname === '/api/users' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const name = normalizeName(body.name);
      if (name.length < 3) {
        sendJson(res, 400, { error: 'Username muss mindestens 3 Zeichen lang sein.' });
        return;
      }

      const users = readUsers();
      const exists = users.some((user) => user.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        sendJson(res, 409, { error: 'Username bereits vergeben.' });
        return;
      }

      const user = { name, highscore: 0 };
      users.push(user);
      writeUsers(users);
      sendJson(res, 201, { user });
      return;
    } catch {
      sendJson(res, 400, { error: 'Ungültige Anfrage.' });
      return;
    }
  }

  const userMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch && req.method === 'GET') {
    const name = decodeURIComponent(userMatch[1]);
    const user = readUsers().find((entry) => entry.name === name);
    if (!user) {
      sendJson(res, 404, { error: 'User nicht gefunden.' });
      return;
    }
    sendJson(res, 200, { user });
    return;
  }

  const scoreMatch = pathname.match(/^\/api\/users\/([^/]+)\/highscore$/);
  if (scoreMatch && req.method === 'PATCH') {
    try {
      const name = decodeURIComponent(scoreMatch[1]);
      const body = await parseBody(req);
      const highscore = Number(body.highscore);
      if (!Number.isFinite(highscore) || highscore < 0) {
        sendJson(res, 400, { error: 'Ungültiger Highscore.' });
        return;
      }

      const users = readUsers();
      const user = users.find((entry) => entry.name === name);
      if (!user) {
        sendJson(res, 404, { error: 'User nicht gefunden.' });
        return;
      }

      if (highscore > user.highscore) {
        user.highscore = highscore;
        writeUsers(users);
      }

      sendJson(res, 200, { user });
      return;
    } catch {
      sendJson(res, 400, { error: 'Ungültige Anfrage.' });
      return;
    }
  }

  let filePath = pathname === '/' ? path.join(ROOT, 'index.html') : path.join(ROOT, pathname);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  sendFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Silentap server running on http://localhost:${PORT}`);
});
