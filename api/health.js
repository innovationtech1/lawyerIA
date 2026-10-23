// Diagnóstico: indica si la configuración está activa, sin revelar ningún valor secreto.
// Abra /api/health en el navegador para revisarlo.

import { providerConfig } from './chat.js';

export default function handler(req, res) {
  const cfg = providerConfig();
  const keyPrefix = cfg.provider === 'groq' ? 'gsk_' : 'sk-ant-api';
  const status = {
    ok: Boolean(cfg.key) && cfg.key.startsWith(keyPrefix),
    ...(process.env.LAWYERIA_DEMO ? { demo: true } : {}),
    provider: cfg.provider,
    model: cfg.model,
    fallbackModel: cfg.fallbackModel || null,
    reasoningEffort: cfg.provider === 'groq' ? (process.env.GROQ_REASONING_EFFORT || 'low') : null,
    historyWindow: Number(process.env.HISTORY_WINDOW) || 12,
    keyVariable: cfg.keyName,
    keyConfigured: Boolean(cfg.key),
    keyFormatOk: cfg.key.startsWith(keyPrefix),
    firmNameSet: Boolean(process.env.FIRM_NAME),
    environment: process.env.VERCEL_ENV || 'local',
    commit: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7),
    checkedAt: new Date().toISOString(),
  };
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(status));
}
