// Local-only design review dashboard. Serves the studio page on :4100 and
// spawns the Expo web dev server on :8081. Never deployed.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { formatNote, safeScreenName } = require('./lib');

const PORT = 4100;
const EXPO_PORT = 8081;
const ROOT = path.join(__dirname, '..', '..');
const STUDIO = __dirname;
const REFS = path.join(STUDIO, 'refs');
const NOTES = path.join(STUDIO, 'design-notes.md');
const MAX_UPLOAD = 10 * 1024 * 1024;

fs.mkdirSync(REFS, { recursive: true });

function send(res, status, body, type) {
  res.writeHead(status, type ? { 'Content-Type': type } : undefined);
  res.end(body);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      return send(res, 200, fs.readFileSync(path.join(STUDIO, 'index.html')), 'text/html');
    }
    if (url.pathname.startsWith('/refs/')) {
      const screen = url.pathname.slice('/refs/'.length).replace(/\.png$/, '');
      if (!safeScreenName(screen)) return send(res, 400, 'bad screen name');
      const file = path.join(REFS, `${screen}.png`);
      if (req.method === 'GET') {
        if (!fs.existsSync(file)) return send(res, 404, 'no reference');
        return send(res, 200, fs.readFileSync(file), 'image/png');
      }
      if (req.method === 'POST') {
        const body = await readBody(req, MAX_UPLOAD);
        fs.writeFileSync(file, body);
        return send(res, 204, '');
      }
    }
    if (req.method === 'POST' && url.pathname === '/notes') {
      const body = JSON.parse((await readBody(req, 64 * 1024)).toString());
      if (!safeScreenName(body.screen) || !String(body.note || '').trim()) {
        return send(res, 400, 'need screen and note');
      }
      fs.appendFileSync(NOTES, formatNote({ screen: body.screen, note: body.note, timestamp: stamp() }));
      return send(res, 204, '');
    }
    return send(res, 404, 'not found');
  } catch (err) {
    return send(res, 500, String(err.message || err));
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use; close the other design studio first.`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`Design studio: http://localhost:${PORT}`);
  const expo = spawn('npx', ['expo', 'start', '--web', '--port', String(EXPO_PORT)], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, BROWSER: 'none', EXPO_NO_TELEMETRY: '1' },
  });
  expo.on('exit', (code) => {
    console.error(`Expo dev server exited (code ${code}); shutting down studio.`);
    process.exit(code || 0);
  });
  process.on('SIGINT', () => { expo.kill('SIGINT'); process.exit(0); });
  if (process.platform === 'darwin' && !process.env.STUDIO_NO_OPEN) {
    spawn('open', [`http://localhost:${PORT}`]);
  }
});
