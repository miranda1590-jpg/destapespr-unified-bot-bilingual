import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 3000;

// === SELLO ÚNICO PARA VER EN WHATSAPP ===
const TAG = '[[V3.2-2025-10-30-07:15]]';

const LINK_CITA = 'https://wa.me/17879220068?text=Quiero%20agendar%20una%20cita';

const WELCOME = `¡Hola! 👋 Soy el asistente de **DestapesPR**.
Te ayudo a coordinar *destapes, fugas, cámara de inspección y calentadores* en el área metro, centro-este y parte del sur (incluye Ponce).`;

const CIERRE = `
✅ Próximamente nos estaremos comunicando.
Gracias por su patrocinio.
— DestapesPR`;

const MAIN_MENU = `${WELCOME}

${TAG} **Menú principal**

Escribe el número o la palabra del servicio que necesitas:

1 - Destape (drenajes o tuberías tapadas)
2 - Fuga (fugas de agua)
3 - Cámara (inspección con cámara)
4 - Calentador (gas o eléctrico)
5 - Otro (otro tipo de servicio)

📅 Agendar cita: ${LINK_CITA}

Comandos: "inicio", "menu", "volver" para regresar al menú.`;

// Cada respuesta ya pide nombre, número y horario
const RESPUESTAS = {
  destape: `${WELCOME}

${TAG} Perfecto. ¿En qué área estás (municipio o sector)?
Luego cuéntame qué línea está tapada (fregadero, inodoro, principal, etc.).
Por favor incluye:
- Tu *nombre completo*
- *Número* de contacto (787, 939 o EE. UU.)
- *Horario* preferido para comunicarnos
📅 Cita: ${LINK_CITA}${CIERRE}`,

  fuga: `${WELCOME}

${TAG} Entendido. ¿Dónde notas la fuga o humedad? ¿Es dentro o fuera de la propiedad?
Incluye tu *nombre*, *número* y *horario preferido*.
📅 Cita: ${LINK_CITA}${CIERRE}`,

  camara: `${WELCOME}

${TAG} Realizamos inspección con cámara. ¿En qué área la necesitas (baño, cocina, línea principal)?
Incluye tu *nombre*, *número* y *horario preferido*.
📅 Cita: ${LINK_CITA}${CIERRE}`,

  calentador: `${WELCOME}

${TAG} Revisamos calentadores eléctricos o de gas. ¿Qué tipo tienes y qué problema notas?
Incluye tu *nombre*, *número* y *horario preferido*.
📅 Cita: ${LINK_CITA}${CIERRE}`,

  otro: `${WELCOME}

${TAG} Cuéntame brevemente qué servicio necesitas y en qué área estás.
Incluye tu *nombre*, *número* y *horario preferido*.
📅 Cita: ${LINK_CITA}${CIERRE}`
};

// === Opciones rápidas ===
const OPCIONES = { '1': 'destape', '2': 'fuga', '3': 'camara', '4': 'calentador', '5': 'otro' };

// === Normalización ===
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

// === Palabras clave ===
const KEYWORDS = {
  destape: ['destape','tapon','tapada','obstruccion','drenaje','fregadero','inodoro','ducha','banera','bañera','principal','cloaca'],
  fuga: ['fuga','salidero','goteo','humedad','filtracion','filtración','escape','charco'],
  camara: ['camara','cámara','inspeccion','inspección','video','endoscopia','tuberia','tubería','ver tuberia','ver tubería'],
  calentador: ['calentador','boiler','heater','agua caliente','gas','electrico','eléctrico'],
  otro: ['otro','otros','servicio','ayuda','cotizacion','cotización','presupuesto']
};

function matchChoice(bodyRaw) {
  const b = norm(bodyRaw);
  if (OPCIONES[b]) return OPCIONES[b];
  if (['destape','fuga','camara','calentador','otro'].includes(b)) return b;
  for (const [choice, arr] of Object.entries(KEYWORDS)) {
    if (arr.some(k => b.includes(k))) return choice;
  }
  return null;
}

// === SQLite (sesiones) ===
let db;
const SESSION_TTL_MS = 48 * 60 * 60 * 1000;

async function initDB() {
  if (db) return db;
  db = await open({ filename: './sessions.db', driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      from_number TEXT PRIMARY KEY,
      last_choice TEXT,
      awaiting_details INTEGER DEFAULT 0,
      details TEXT,
      last_active INTEGER
    );
  `);
  await db.run('DELETE FROM sessions WHERE last_active < ?', Date.now() - SESSION_TTL_MS);
  return db;
}

async function getSession(from) {
  return await db.get('SELECT * FROM sessions WHERE from_number = ?', from);
}

async function upsertSession(from, patch) {
  const prev = (await getSession(from)) || {};
  const now = Date.now();
  const next = {
    last_choice: patch.last_choice ?? prev.last_choice ?? null,
    awaiting_details: patch.awaiting_details ?? prev.awaiting_details ?? 0,
    details: patch.details ?? prev.details ?? null,
    last_active: now
  };
  await db.run(`
    INSERT INTO sessions (from_number, last_choice, awaiting_details, details, last_active)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(from_number) DO UPDATE SET
      last_choice=excluded.last_choice,
      awaiting_details=excluded.awaiting_details,
      details=excluded.details,
      last_active=excluded.last_active
  `, [from, next.last_choice, next.awaiting_details, next.details, next.last_active]);
  return next;
}

async function clearSession(from) {
  await db.run('DELETE FROM sessions WHERE from_number = ?', from);
}

// === Helper para responder Twilio ===
function sendTwilioXML(res, text) {
  const safe = String(text)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`;
  res.set('Content-Type', 'application/xml');
  return res.send(xml);
}

// === Webhook (flujo principal) ===
app.post('/webhook/whatsapp', async (req, res) => {
  await initDB();

  const from = (req.body.From || req.body.from || req.body.WaId || '').toString();
  const bodyRaw = (req.body.Body || req.body.body || '').toString();
  const body = norm(bodyRaw);

  // Menu / bienvenida
  if (!body || ['inicio','menu','volver','start','comenzar','hola','buenas'].includes(body)) {
    await clearSession(from);
    return sendTwilioXML(res, MAIN_MENU);
  }

  // Selección de servicio
  const detected = matchChoice(bodyRaw);
  if (detected) {
    await upsertSession(from, { last_choice: detected, awaiting_details: 1, details: null });
    const out = `${RESPUESTAS[detected]}\n\n(Escribe "volver" para regresar al menú)`;
    return sendTwilioXML(res, out);
  }

  // Captura de detalles (respuesta libre después de elegir opción)
  const s = await getSession(from);
  if (s?.last_choice && s?.awaiting_details) {
    await upsertSession(from, { details: bodyRaw, awaiting_details: 0 });
    const out =
`${TAG} Gracias. Guardé tus detalles para *${s.last_choice}*:
"${bodyRaw}"

✅ Hemos recibido tu solicitud. Un representante de **DestapesPR** te contactará pronto.

${CIERRE}`;
    return sendTwilioXML(res, out);
  }

  // Fallback
  const fallback = `No entendí tu mensaje. Intenta nuevamente.\n\n${MAIN_MENU}`;
  return sendTwilioXML(res, fallback);
});

// Health/Version
app.get('/__version', (_req, res) => res.json({ ok: true, tag: TAG }));
app.get('/', (_req, res) => res.send(`${TAG} DestapesPR Bot activo ✅`));

app.listen(PORT, () => console.log(`💬 DestapesPR bot corriendo en http://localhost:${PORT}`));