// Servidor local para probar la página sin Vercel.
//
//   npm run dev     → usa la IA real si hay clave en .env; si no hay clave, arranca en modo demostración
//   npm run demo    → siempre en modo demostración (respuestas de ejemplo, sin clave ni costo)
//   npm run live    → exige la IA real; si falta la clave, se detiene y explica qué hacer
//
// Luego abra la dirección que aparece en la terminal (por defecto http://localhost:3000).

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

// ---------- Variables de entorno (.env) ----------
const envFile = path.join(root, '.env');
const hasEnvFile = fs.existsSync(envFile);
if (hasEnvFile) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    let value = m[2];
    if (/^["'].*["']$/.test(value)) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, ''); // comentario al final de la línea
    process.env[m[1]] = value;
  }
}

const args = process.argv.slice(2);
const forceDemo = args.includes('--demo');
const forceLive = args.includes('--live');

// ¿Qué proveedor y clave usaría la página? (misma regla que api/chat.js)
const groqKey = process.env.GROQ_API_KEY || '';
const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
const provider = (process.env.AI_PROVIDER || (groqKey || !anthropicKey ? 'groq' : 'anthropic')).toLowerCase() === 'anthropic'
  ? 'anthropic' : 'groq';
const key = provider === 'anthropic' ? anthropicKey : groqKey;
const keyName = provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'GROQ_API_KEY';
const keyPrefix = provider === 'anthropic' ? 'sk-ant-api' : 'gsk_';

if (forceLive && !key) {
  console.error(`\n✖ Falta ${keyName}.`);
  console.error(hasEnvFile
    ? `  Agréguela a su archivo .env (vea .env.example) y vuelva a ejecutar: npm run live`
    : `  Copie .env.example como .env, ponga su clave y vuelva a ejecutar: npm run live`);
  console.error('  Para probar sin clave use: npm run demo\n');
  process.exit(1);
}

const demo = forceDemo || !key;
const demoReason = forceDemo ? 'pedido con --demo' : `no se encontró ${keyName}`;

// ---------- Modo demostración: simula la IA sin conexión ni costo ----------
if (demo) {
  process.env.LAWYERIA_DEMO = '1';
  delete process.env.AI_PROVIDER;
  delete process.env.ANTHROPIC_API_KEY;
  process.env.GROQ_API_KEY = 'gsk_demo';

  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts = {}) => {
    const target = String(url);
    if (!target.includes('api.groq.com') && !target.includes('api.anthropic.com')) return realFetch(url, opts);
    const body = JSON.parse(opts.body || '{}');
    const msgs = body.messages || [];
    const last = String(msgs[msgs.length - 1]?.content || '');
    const isSummary = /informe de elegibilidad|eligibility report/i.test(last);
    const text = isSummary
      ? '**1. Resumen del caso**\nModo demostración: aquí aparecerá el informe real que prepara la IA.\n\n**9. Aviso**\nEvaluación preliminar; requiere revisión del abogado.'
      : `**Modo demostración** (sin IA real). Recibí su mensaje:\n\n> ${last.slice(0, 200)}\n\nPara orientarle necesito saber:\n1. ¿Quién presentaría la petición: un **ciudadano** o un **residente permanente**?\n2. ¿Cuál es su relación con esa persona?\n\nMás información en https://www.uscis.gov`;
    await new Promise((r) => setTimeout(r, 600));
    const payload = target.includes('api.groq.com')
      ? { choices: [{ message: { role: 'assistant', content: text } }] }
      : { content: [{ type: 'text', text }] };
    return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } });
  };
}

const { default: chat } = await import('../api/chat.js');
const { default: config } = await import('../api/config.js');
const { default: health } = await import('../api/health.js');

// ---------- Servidor ----------
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
};
const publicDir = path.join(root, 'public');

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/health') return health(req, res);
    if (url.pathname === '/api/chat' || url.pathname === '/api/config') {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      try { req.body = raw ? JSON.parse(raw) : undefined; } catch { req.body = raw; }
      return await (url.pathname === '/api/chat' ? chat : config)(req, res);
    }
    const file = path.normalize(path.join(publicDir, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname)));
    if (!file.startsWith(publicDir + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.statusCode = 404;
      return res.end('No encontrado');
    }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  } catch (err) {
    console.error('Error en el servidor local:', err);
    if (!res.headersSent) { res.statusCode = 500; res.end('Error interno'); }
  }
});

const port = Number(process.env.PORT) || 3000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n✖ El puerto ${port} ya está en uso (¿otra copia del servidor sigue abierta?).`);
    console.error(`  Ciérrela, o use otro puerto:  PORT=${port + 1} npm run dev\n`);
  } else {
    console.error('\n✖ No se pudo iniciar el servidor:', err.message, '\n');
  }
  process.exit(1);
});

server.listen(port, () => {
  const model = provider === 'anthropic'
    ? (process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5')
    : (process.env.GROQ_MODEL || 'openai/gpt-oss-120b');
  const lines = [
    '',
    '  Lawyer IA — servidor local',
    `  Página:        http://localhost:${port}`,
    `  Diagnóstico:   http://localhost:${port}/api/health`,
  ];
  if (demo) {
    lines.push(
      `  Modo:          DEMOSTRACIÓN (${demoReason})`,
      '                 Las respuestas son de ejemplo; no se usa ninguna IA ni se gasta cupo.',
      '  IA real:       copie .env.example como .env, ponga su GROQ_API_KEY (gratis en console.groq.com)',
      '                 y ejecute: npm run live',
    );
  } else {
    lines.push(`  Modo:          IA REAL — ${provider === 'groq' ? 'Groq (gratis)' : 'Claude'} · ${model}`);
    if (!key.startsWith(keyPrefix)) {
      lines.push(`  ⚠ Aviso:       ${keyName} no tiene el formato esperado (${keyPrefix}…). Revise la clave si el chat falla.`);
    }
    lines.push('  Sin IA:        npm run demo');
  }
  if (!process.env.FIRM_NAME) lines.push('  Nota:          FIRM_NAME no está definido; la página mostrará "Despacho de Inmigración".');
  lines.push('  Detener:       Ctrl + C', '');
  console.log(lines.join('\n'));
});
