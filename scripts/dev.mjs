// Servidor local para probar la página sin Vercel.
//   node scripts/dev.mjs          → usa ANTHROPIC_API_KEY del archivo .env
//   node scripts/dev.mjs --demo   → respuestas de ejemplo, sin clave ni costo
// Luego abra http://localhost:3000

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
process.chdir(root);

// Carga .env si existe
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const demo = process.argv.includes('--demo');
if (demo) {
  process.env.AI_PROVIDER = 'anthropic'; // el modo demo simula esta API
  process.env.ANTHROPIC_API_KEY = 'demo';
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    if (!String(url).includes('api.anthropic.com')) return realFetch(url, opts);
    const body = JSON.parse(opts.body);
    const last = body.messages[body.messages.length - 1].content;
    const isSummary = /informe de elegibilidad|eligibility report/i.test(last);
    const text = isSummary
      ? '**1. Resumen del caso**\nModo demostración: aquí aparecerá el informe real.\n\n**9. Aviso**\nEvaluación preliminar; requiere revisión del abogado.'
      : `**Modo demostración.** Recibí su mensaje:\n\n> ${last.slice(0, 200)}\n\nPara orientarle necesito saber:\n1. ¿Quién presentaría la petición: un **ciudadano** o un **residente permanente**?\n2. ¿Cuál es su relación con esa persona?\n\nMás información en https://www.uscis.gov`;
    await new Promise((r) => setTimeout(r, 700));
    return new Response(JSON.stringify({ content: [{ type: 'text', text }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
}

const { default: chat } = await import('../api/chat.js');
const { default: config } = await import('../api/config.js');
const { default: health } = await import('../api/health.js');

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png',
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/health') return health(req, res);
  if (url.pathname === '/api/chat' || url.pathname === '/api/config') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try { req.body = raw ? JSON.parse(raw) : undefined; } catch { req.body = raw; }
    return (url.pathname === '/api/chat' ? chat : config)(req, res);
  }
  const file = path.join(root, 'public', url.pathname === '/' ? 'index.html' : url.pathname);
  if (!file.startsWith(path.join(root, 'public')) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.statusCode = 404;
    return res.end('No encontrado');
  }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}).listen(process.env.PORT || 3000, () => {
  console.log(`Lawyer IA en http://localhost:${process.env.PORT || 3000}${demo ? '  (modo demostración)' : ''}`);
});
