import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';

const app = express();
app.use(express.urlencoded({ extended: true })); // Twilio usa x-www-form-urlencoded
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 3000;

// ===== MARCA / VERSIÓN =====
const TAG = '[[MENU-V2]]';
app.get('/__version', (_req, res) => res.json({ ok: true, tag: TAG }));

// ===== ENLACE DE CITA (elige uno) =====
const LINK_CITA = 'https://wa.me/17879220068?text=Quiero%20agendar%20una%20cita';
// const LINK_CITA = 'https://calendly.com/destapespr/cita';

// ===== MENÚ PRINCIPAL (compatible con WhatsApp) =====
const MAIN_MENU =
`${TAG} Bienvenido a DestapesPR

Escribe el número o la palabra del servicio que necesitas:

1 - Destape (drenajes o tuberías tapadas)
2 - Fuga (fugas de agua)
3 - Cámara (inspección con cámara)
4 - Calentador (gas o eléctrico)
5 - Otro (otro tipo de servicio)

📅 Agendar cita: ${LINK_CITA}`;

// ===== RESPUESTAS POR OPCIÓN =====
const RESPUESTAS = {
  destape:
`${TAG} Perfecto. ¿En qué área estás (municipio o sector)?
Luego cuéntame qué línea está tapada (fregadero, inodoro, principal, etc.).
📅 Cita: ${LINK_CITA}`,

  fuga:
`${TAG} Entendido. ¿Dónde notas la fuga o humedad? ¿Es dentro o fuera de la propiedad?
📅 Cita: ${LINK_CITA}`,

  camara:
`${TAG} Hacemos inspección con cámara. ¿En qué área la necesitas (baño, cocina, línea principal)?
📅 Cita: ${LINK_CITA}`,

  calentador:
`${TAG} Revisamos calentadores eléctricos o de gas. ¿Qué tipo tienes y qué problema notas?
📅 Cita: ${LINK_CITA}`,

  otro:
`${TAG} Cuéntame brevemente qué servicio necesitas y en qué área estás.
📅 Cita: ${LINK_CITA}`
};

// ===== MAPEOS NUMÉRICOS =====
const OPCIONES = { '1': 'destape', '2': 'fuga', '3': 'camara', '4': 'calentador', '5': 'otro' };

// ===== ROOT =====
app.get('/', (_req, res) => res.send(`${TAG} DestapesPR Bot activo ✅`));

// ===== WEBHOOK WHATSAPP =====
app.post('/webhook/whatsapp', (req, res) => {
  // Log para verificar qué está llegando desde Twilio en Render
  console.log('[INCOMING]', {
    ct: req.headers['content-type'],
    url: req.originalUrl,
    body: req.body
  });

  const body = (req.body.Body || req.body.body || '').toLowerCase().trim();
  let reply;

  if (['hola', 'buenas', 'hi', 'menu', 'start', 'servicio'].includes(body) || !body) {
    reply = MAIN_MENU;
  } else if (OPCIONES[body]) {
    reply = RESPUESTAS[OPCIONES[body]];
  } else if (RESPUESTAS[body]) {
    reply = RESPUESTAS[body];
  } else {
    reply = `${TAG} No entendí tu mensaje. Escribe el número o la palabra de una opción:\n\n${MAIN_MENU}`;
  }

  // Respuesta Twilio XML
  const safe = String(reply).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`;
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// ===== START =====
app.listen(PORT, () => console.log(`💬 DestapesPR bot corriendo en http://localhost:${PORT}`));