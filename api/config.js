// Datos públicos del despacho que la página muestra (nombre y contacto).
// Se configuran con variables de entorno en Vercel; nunca incluya claves aquí.

export default function handler(req, res) {
  const config = {
    firmName: process.env.FIRM_NAME || 'Despacho de Inmigración',
    attorneyName: process.env.ATTORNEY_NAME || '',
    phone: process.env.FIRM_PHONE || '',
    whatsapp: (process.env.FIRM_WHATSAPP || '').replace(/\D/g, ''),
    email: process.env.FIRM_EMAIL || '',
  };
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.end(JSON.stringify(config));
}
