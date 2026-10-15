// Función del servidor (Vercel): recibe la conversación desde la página,
// agrega las instrucciones de system_prompt.txt y consulta a Claude.
// La clave de la API vive solo aquí, en la variable ANTHROPIC_API_KEY.

import fs from 'node:fs';
import path from 'node:path';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const MAX_MESSAGES = 40;      // mensajes por conversación
const MAX_CHARS = 4000;       // caracteres por mensaje
const RATE_LIMIT = 30;        // solicitudes por IP...
const RATE_WINDOW_MS = 10 * 60 * 1000; // ...cada 10 minutos

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

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Falta la variable ANTHROPIC_API_KEY');
    return send(res, 500, { error: 'El asistente no está configurado todavía. Contacte al despacho.' });
  }

  let system;
  try {
    system = systemPrompt() + `\n\nIDIOMA\nLa página está en ${lang === 'en' ? 'inglés' : 'español'}. Responde en el idioma en que escriba el usuario.`;
  } catch (err) {
    console.error('No se pudo leer system_prompt.txt', err);
    return send(res, 500, { error: 'Error de configuración del asistente.' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55_000);
  try {
    const r = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: summary ? 2500 : 1500,
        system,
        messages,
      }),
    });

    if (!r.ok) {
      console.error('Error de la API', r.status, await r.text().catch(() => ''));
      const busy = r.status === 429 || r.status === 529;
      return send(res, 502, {
        error: busy
          ? 'El asistente está ocupado. Intente de nuevo en un momento.'
          : 'No se pudo obtener respuesta del asistente. Intente de nuevo.',
      });
    }

    const data = await r.json();
    const reply = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    if (!reply) return send(res, 502, { error: 'Respuesta vacía. Intente de nuevo.' });
    return send(res, 200, { reply });
  } catch (err) {
    console.error('Fallo al consultar la API', err);
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
