import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 3000;

// === ENLACE DE CITA ===
// Usa solo UNO de los dos enlaces:
const LINK_CITA = 'https://calendly.com/destapespr/cita';
// const LINK_CITA = 'https://wa.me/17879220068?text=Quiero%20agendar%20una%20cita';

// === MENÚ PRINCIPAL ===
const MAIN_MENU = `
👋 ¡Bienvenido a *DestapesPR*!

Escribe el número o la palabra del servicio que necesitas:

1️⃣ *Destape* – drenajes o tuberías tapadas
2️⃣ *Fuga* – fugas de agua 💧
3️⃣ *Cámara* – inspección con cámara 📹
4️⃣ *Calentador* – gas o eléctrico 🔥
5️⃣ *Otro* – otro tipo de servicio
`;

// === RESPUESTAS POR OPCIÓN ===
const RESPUESTAS = {
  destape: `🌀 Perfecto, ¿en qué área estás (municipio/sector)? Luego cuéntame qué línea está tapada (fregadero, inodoro, principal, etc.).

📅 *Agendar cita ahora:*  
👉 ${LINK_CITA}`,

  fuga: `💧 Entendido. ¿Dónde notas la fuga o humedad? ¿Es dentro o fuera de la propiedad?

📅 *Agendar cita ahora:*  
👉 ${LINK_CITA}`,

  camara: `📹 Realizamos inspecciones con cámara. ¿En qué área necesitas la inspección (baño, cocina, línea principal)?

📅 *Agendar cita ahora:*  
👉 ${LINK_CITA}`,

  calentador: `🔥 Revisamos calentadores eléctricos o de gas. ¿Qué tipo de calentador tienes y qué problema notas?

📅 *Agendar cita ahora:*  
👉 ${LINK_CITA}`,

  otro: `🧰 Cuéntame brevemente qué servicio necesitas y en qué área estás ubicado.

📅 *Agendar cita ahora:*  
👉 ${LINK_CITA}`
};

// === MAPEOS NUMÉRICOS ===
const OPCIONES = {
  '1': 'destape',
  '2': 'fuga',
  '3': 'camara',
  '4': 'calentador',
  '5': 'otro'
};

// === WEBHOOK WHATSAPP ===
app.post('/webhook/whatsapp', (req, res) => {
  const body = (req.body.Body || req.body.body || '').toLowerCase().trim();
  let reply;

  if (['hola', 'buenas', 'hi', 'menu', 'start', 'comenzar', 'servicio'].includes(body) || !body) {
    reply = MAIN_MENU;
  } else if (OPCIONES[body]) {
    const palabra = OPCIONES[body];
    reply = RESPUESTAS[palabra];
  } else if (RESPUESTAS[body]) {
    reply = RESPUESTAS[body];
  } else {
    reply = "No entendí tu mensaje 🤔\n\nPor favor escribe el número o la palabra de una opción:\n\n" + MAIN_MENU;
  }

  const safe = reply.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`;
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/', (_req, res) => res.send('DestapesPR Bot con menú y citas ✅'));
app.listen(PORT, () => console.log(`DestapesPR bot (menú + cita) corriendo en http://localhost:${PORT}`));