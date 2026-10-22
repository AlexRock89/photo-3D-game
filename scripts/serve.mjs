import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const requestedPort = Number(process.env.PORT || 8000);
if (!Number.isInteger(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};
const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let filename = path.resolve(root, '.' + pathname);
    if (filename !== path.resolve(root) && !filename.startsWith(path.resolve(root) + path.sep)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    if ((await stat(filename)).isDirectory()) filename = path.join(filename, 'index.html');
    const content = await readFile(filename);
    res.writeHead(200, {
      'Content-Type': mime[path.extname(filename)] || 'application/octet-stream',
      'Content-Length': content.length,
      'Cache-Control': 'no-store'
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (err) {
    const status = err instanceof URIError ? 400 : err.code === 'ENOENT' || err.code === 'ENOTDIR' ? 404 : 500;
    res.writeHead(status); res.end(status === 404 ? 'Not found' : 'Request failed');
  }
});
server.on('error', err => { console.error(err.message); process.exitCode = 1; });
server.listen(requestedPort, '127.0.0.1', () => {
  console.log(`Обычный день фотографа: http://127.0.0.1:${requestedPort}`);
  console.log('Для остановки нажмите Ctrl+C.');
});
