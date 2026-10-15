// Diagnóstico: indica si la configuración está activa, sin revelar ningún valor secreto.
// Abra /api/health en el navegador para revisarlo.

export default function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY || '';
  const status = {
    ok: Boolean(key) && key.startsWith('sk-ant-api'),
    keyConfigured: Boolean(key),
    keyLooksLikeApiKey: key.startsWith('sk-ant-api'),
    firmNameSet: Boolean(process.env.FIRM_NAME),
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
    environment: process.env.VERCEL_ENV || 'local',
    commit: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7),
    checkedAt: new Date().toISOString(),
  };
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(status));
}
