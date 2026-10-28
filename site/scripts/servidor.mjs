// Servidor local para testar o site (sem dependências):  node scripts/servidor.mjs  → http://localhost:5173
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = Number(process.argv[2]) || 5173;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  let caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let arquivo = join(SITE, caminho);
  if (!arquivo.startsWith(SITE)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(arquivo)).isDirectory()) {
      if (!caminho.endsWith('/')) { res.writeHead(301, { Location: caminho + '/' }).end(); return; }
      arquivo = join(arquivo, 'index.html');
    }
    let corpo = await readFile(arquivo);
    const tipo = TIPOS[extname(arquivo).toLowerCase()] || 'application/octet-stream';
    const cab = { 'Content-Type': tipo, 'Cache-Control': caminho.startsWith('/assets/') ? 'public, max-age=31536000' : 'no-cache' };
    // compressão gzip para texto (as hospedagens fazem isso sozinhas)
    if (/text|javascript|json|svg|xml/.test(tipo) && /gzip/.test(req.headers['accept-encoding'] || '')) { corpo = gzipSync(corpo); cab['Content-Encoding'] = 'gzip'; }
    res.writeHead(200, cab).end(corpo);
  } catch {
    const p404 = await readFile(join(SITE, '404.html')).catch(() => 'Não encontrado');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(p404);
  }
}).listen(PORTA, () => console.log(`NK Fotografia rodando em http://localhost:${PORTA}  (Ctrl+C para parar)`));
