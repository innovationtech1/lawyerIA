// Función del servidor (Vercel): recibe la conversación desde la página,
// agrega las instrucciones de system_prompt.txt y consulta a la IA.
//
// Proveedores disponibles (variable AI_PROVIDER):
//   groq      → gratis, modelo de código abierto (GROQ_API_KEY)   ← predeterminado
//   anthropic → Claude, de pago (ANTHROPIC_API_KEY)
// Las claves viven solo aquí, en variables de entorno; nunca llegan al navegador.

import fs from 'node:fs';
import path from 'node:path';

const MAX_MESSAGES = 40;      // mensajes por conversación
const MAX_CHARS = 4000;       // caracteres por mensaje
const RATE_LIMIT = 30;        // solicitudes por IP...
const RATE_WINDOW_MS = 10 * 60 * 1000; // ...cada 10 minutos

export function providerConfig() {
  const groqKey = process.env.GROQ_API_KEY || '';
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
  const provider = (process.env.AI_PROVIDER || (groqKey || !anthropicKey ? 'groq' : 'anthropic')).toLowerCase();
  if (provider === 'anthropic') {
    return { provider, key: anthropicKey, keyName: 'ANTHROPIC_API_KEY', model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5' };
  }
  return { provider: 'groq', key: groqKey, keyName: 'GROQ_API_KEY', model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b' };
}

const SUMMARY_REQUEST = {
  es: 'Con la información de esta conversación, prepara el informe de elegibilidad para el abogado con esta estructura: 1. Resumen del caso. 2. Datos clave del peticionario y del beneficiario. 3. Categoría probable y si hay espera de visa. 4. Ruta probable (ajuste de estatus o proceso consular) y la razón. 5. Formularios que aplican y orden. 6. Señales de alerta. 7. Documentos faltantes. 8. Preguntas abiertas para el abogado. 9. Aviso: "Evaluación preliminar; requiere revisión del abogado." Si falta información, indícalo en cada punto en lugar de suponer.',
  en: 'Using the information in this conversation, prepare the eligibility report for the attorney with this structure: 1. Case summary. 2. Key facts about the petitioner and beneficiary. 3. Likely category and whether there is a visa wait. 4. Likely path (adjustment of status or consular processing) and why. 5. Applicable forms and filing order. 6. Red flags. 7. Missing documents. 8. Open questions for the attorney. 9. Notice: "Preliminary evaluation; requires attorney review." Where information is missing, say so in each item instead of assuming.',
};

let cachedPrompt = null;
function systemPrompt() {
  if (cachedPrompt) return cachedPrompt;
  const raw = fs.readFileSync(path.join(process.cwd(), 'system_prompt.txt'), 'utf8');
  cachedPrompt = raw
    .replaceAll('[Nombre del despacho]', process.env.FIRM_NAME || 'el despacho')
    .replaceAll('[Lic. Nombre]', process.env.ATTORNEY_NAME || 'el abogado responsable');
  return cachedPrompt;
}

// Oculta números de Seguro Social y A-Number antes de enviarlos a la IA.
export function maskSensitive(text) {
  return text
    .replace(/\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g, '[número oculto]')
    .replace(/\bA[- ]?\d{2,3}[- ]?\d{3}[- ]?\d{3}\b/gi, '[A-Number oculto]');
}

// Límite simple por IP (por instancia del servidor; es una protección básica).
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE_LIMIT;
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function validate(body) {
  if (!body || !Array.isArray(body.messages)) return 'Solicitud inválida.';
  const { messages } = body;
  if (messages.length === 0 || messages.length > MAX_MESSAGES) {
    return 'La conversación es demasiado larga. Inicie una nueva conversación.';
  }
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const expected = i % 2 === 0 ? 'user' : 'assistant';
    if (!m || m.role !== expected || typeof m.content !== 'string') return 'Solicitud inválida.';
    if (!m.content.trim() || m.content.length > MAX_CHARS) return 'Mensaje vacío o demasiado largo.';
  }
  return null;
}

// ---------- Proveedores ----------

async function callGroq(cfg, system, messages, summary, signal) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify({
      model: cfg.model,
      messages: [{ role: 'system', content: system }, ...messages],
      max_completion_tokens: summary ? 4000 : 3000, // incluye el razonamiento interno
      temperature: 0.3,
      ...(cfg.model.startsWith('openai/gpt-oss')
        ? { reasoning_effort: process.env.GROQ_REASONING_EFFORT || 'medium', include_reasoning: false }
        : {}),
    }),
  });
  if (!r.ok) return { ok: false, status: r.status, detail: await r.text().catch(() => '') };
  const data = await r.json();
  const text = String(data.choices?.[0]?.message?.content || '')
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .trim();
  return { ok: true, text };
}

async function callAnthropic(cfg, system, messages, summary, signal) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': cfg.key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: cfg.model, max_tokens: summary ? 2500 : 1500, system, messages }),
  });
  if (!r.ok) return { ok: false, status: r.status, detail: await r.text().catch(() => '') };
  const data = await r.json();
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  return { ok: true, text };
}

function errorMessage(status, detail) {
  if (status === 429) {
    return /per day|daily|TPD|RPD/i.test(detail)
      ? 'El asistente gratuito alcanzó su límite de uso de hoy. Intente de nuevo mañana o llame al despacho.'
      : 'El asistente está ocupado. Espere un minuto e intente de nuevo.';
  }
  if (status === 529 || status === 503) return 'El asistente está ocupado. Intente de nuevo en un momento.';
  if (status === 401 || status === 403) return 'Configuración pendiente: la clave de la API no es válida (código 401). Avise al despacho.';
  if (status === 404) return 'Configuración pendiente: el modelo de IA no está disponible (código 404). Avise al despacho.';
  if (status === 400 && /credit balance/i.test(detail)) return 'Configuración pendiente: la cuenta de la IA no tiene saldo. Avise al despacho.';
  if (status === 413 || (status === 400 && /context|too large|too long/i.test(detail))) {
    return 'La conversación es demasiado larga. Genere el resumen o inicie una nueva conversación.';
  }
  return `No se pudo obtener respuesta del asistente (código ${status}). Intente de nuevo.`;
}

// ---------- Función principal ----------

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'Método no permitido.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress || 'anon';
  if (rateLimited(ip)) {
    return send(res, 429, { error: 'Demasiadas solicitudes. Espere unos minutos e intente de nuevo.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const problem = validate(body);
  if (problem) return send(res, 400, { error: problem });

  const lang = body.lang === 'en' ? 'en' : 'es';
  const summary = body.mode === 'summary';

  const messages = body.messages.map((m) => ({ role: m.role, content: maskSensitive(m.content) }));
  if (summary) {
    if (messages[messages.length - 1].role === 'user') {
      return send(res, 400, { error: 'Solicitud inválida.' });
    }
    messages.push({ role: 'user', content: SUMMARY_REQUEST[lang] });
  } else if (messages[messages.length - 1].role !== 'user') {
    return send(res, 400, { error: 'Solicitud inválida.' });
  }

  const cfg = providerConfig();
  if (!cfg.key) {
    console.error(`Falta la variable ${cfg.keyName}`);
    return send(res, 500, { error: 'El asistente no está configurado todavía. Contacte al despacho.' });
  }

  let system;
  try {
    system = systemPrompt() + `\n\nIDIOMA\nLa página está en ${lang === 'en' ? 'inglés' : 'español'}. Responde en el idioma en que escriba el usuario.\n\nFORMATO\nUsa párrafos cortos, listas y **negritas**. No uses tablas.`;
  } catch (err) {
    console.error('No se pudo leer system_prompt.txt', err);
    return send(res, 500, { error: 'Error de configuración del asistente.' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55_000);
  try {
    const call = cfg.provider === 'anthropic' ? callAnthropic : callGroq;
    const result = await call(cfg, system, messages, summary, controller.signal);
    if (!result.ok) {
      console.error(`Error de ${cfg.provider}`, result.status, result.detail);
      return send(res, 502, { error: errorMessage(result.status, result.detail) });
    }
    if (!result.text) return send(res, 502, { error: 'Respuesta vacía. Intente de nuevo.' });
    return send(res, 200, { reply: result.text });
  } catch (err) {
    console.error('Fallo al consultar la IA', err);
    const timeout = err?.name === 'AbortError';
    return send(res, 504, {
      error: timeout
        ? 'La respuesta tardó demasiado. Intente de nuevo.'
        : 'Error de conexión con el asistente. Intente de nuevo.',
    });
  } finally {
    clearTimeout(timer);
  }
}
