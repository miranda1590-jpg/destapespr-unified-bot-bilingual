// =====================
// DestapesPR — server.js
// =====================

import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// ---------------------
// App base
// ---------------------
const app = express();
app.use(express.urlencoded({ extended: true })); // Twilio usa x-www-form-urlencoded
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 3000;

// Sello visible en todas las respuestas
const TAG = '[[FORCE-20251030-DEPLOY]]';

// ---------------------
// Textos / Menú
// ---------------------
const LINK_CITA = 'https://wa.me/17879220068?text=Quiero%20agendar%20una%20cita';
const CIERRE = `
✅ Próximamente nos estaremos comunicando.
Gracias por su patrocinio.
— DestapesPR`;

const MAIN_MENU =
`${TAG} Bienvenido a DestapesPR

Escribe el número o la palabra del servicio que necesitas:

1 - Destape (drenajes o tuberías tapadas)
2 - Fuga (fugas de agua)
3 - Cámara (inspección con cámara)
4 - Calentador (gas o eléctrico)
5 - Otro (otro tipo de servicio)

📅 Agendar cita: ${LINK_CITA}

Comandos: "inicio", "menu", "volver" para regresar al menú.`;

const RESPUESTAS = {
  destape: `${TAG} Perfecto. ¿En qué área estás (municipio o sector)?
Luego cuéntame qué línea está tapada (fregadero, inodoro, principal, etc.).
📅 Cita: ${LINK_CITA}${CIERRE}`,
  fuga: `${TAG} Entendido. ¿Dónde notas la fuga o humedad? ¿Es dentro o fuera de la propiedad?
📅 Cita: ${LINK_CITA}${CIERRE}`,
  camara: `${TAG} Realizamos inspección con cámara. ¿En qué área la necesitas (baño, cocina, línea principal)?
📅 Cita: ${LINK_CITA}${CIERRE}`,
  calentador: `${TAG} Revisamos calentadores eléctricos o de gas. ¿Qué tipo tienes y qué problema notas?
📅 Cita: ${LINK_CITA}${CIERRE}`,
  otro: `${TAG} Cuéntame brevemente qué servicio necesitas y en qué área estás.
📅 Cita: ${LINK_CITA}${CIERRE}`
};

const OPCIONES = { '1': 'destape', '2': 'fuga', '3': 'camara', '4': 'calentador', '5': 'otro' };

// ---------------------
// Normalización / Matching
// ---------------------
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

const KEYWORDS = {
  destape: [
    'destape','destapar','tapon','tapones','tapada','trancada','obstruccion','obstrucciones','drenaje','desague','desagüe',
    'fregadero','lavaplatos','inodoro','sanitario','toilet','ducha','lavamanos','banera','bañera','principal',
    'linea principal','alcantarillado','pluvial','cloaca','trampa','sifon','sifón'
  ],
  fuga: ['fuga','salidero','goteo','goteando','humedad','filtracion','filtración','escapes','escape','charco'],
  camara: ['camara','cámara','inspeccion','inspección','video inspeccion','video','endoscopia','ver tuberia','ver tubería','localizar','localizacion','localización'],
  calentador: ['calentador','boiler','heater','agua caliente','termo','termotanque','gas','electrico','eléctrico','resistencia','piloto','ignicion','ignición'],
  otro: ['otro','otros','servicio','ayuda','consulta','cotizacion','cotización','presupuesto','visita']
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

// ---------------------
// SQLite (sesiones)
// ---------------------
let db;
const SESSION_TTL_MS = 48 * 60 * 60 * 1000;

async function ensureColumns() {
  const info = await db.all(`PRAGMA table_info('sessions')`);
  const have = new Set(info.map(r => r.name));
  const needed = [
    { name: 'from_number', type: 'TEXT' },
    { name: 'last_choice', type: 'TEXT' },
    { name: 'awaiting_details', type: 'INTEGER', def: '0' },
    { name: 'details', type: 'TEXT' },
    { name: 'last_active', type: 'INTEGER' }
  ];
  for (const col of needed) {
    if (!have.has(col.name)) {
      const def = col.def !== undefined ? ` DEFAULT ${col.def}` : '';
      await db.exec(`ALTER TABLE sessions ADD COLUMN ${col.name} ${col.type}${def};`).catch(() => {});
    }
  }
}

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
  await ensureColumns();
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

// ---------------------
// Helpers
// ---------------------
function sendTwilioXML(res, text) {
  // prefijo TAG siempre visible
  const withTag = `${TAG} ${String(text || '')}`;
  const safe = withTag.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`;
  res.set('Content-Type', 'application/xml');
  return res.send(xml);
}

function extractPhone(text) {
  const t = String(text || '');
  // Detecta US + PR (787, 939 y cualquier área válida de EEUU)
  const rx = /(?:\+?1[\s\-.]?)?(?:\(?([2-9]\d{2})\)?[\s\-.]?)(\d{3})[\s\-.]?(\d{4})/;
  const m = t.match(rx);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

// ---------------------
// Endpoints utilitarios
// ---------------------
app.get('/__version', (_req, res) => res.json({ ok: true, tag: TAG }));

app.get('/__detect', (req, res) => {
  const q = String(req.query.q || '');
  const n = norm(q);
  const detected = matchChoice(q);
  res.json({ ok: true, tag: TAG, q, norm: n, detected });
});

app.get('/__diag', (_req, res) => {
  const counts = {};
  counts.destape = KEYWORDS?.destape?.length ?? -1;
  counts.fuga = KEYWORDS?.fuga?.length ?? -1;
  counts.camara = KEYWORDS?.camara?.length ?? -1;
  counts.calentador = KEYWORDS?.calentador?.length ?? -1;
  counts.otro = KEYWORDS?.otro?.length ?? -1;
  res.json({ ok: true, tag: TAG, counts });
});

// ---------------------
// Webhook WhatsApp
// ---------------------
app.post('/webhook/whatsapp', async (req, res) => {
  await initDB();

  const from = (req.body.From || req.body.from || req.body.WaId || '').toString();
  const bodyRaw = (req.body.Body || req.body.body || '').toString();
  const body = norm(bodyRaw);

  // 1) Comandos básicos
  if (!body || ['inicio','menu','volver','start','comenzar','hola','buenas'].includes(body)) {
    await clearSession(from);
    return sendTwilioXML(res, MAIN_MENU);
  }

  // 2) Si la sesión espera detalles -> capturamos primero
  const s0 = await getSession(from);
  if (s0?.last_choice && s0?.awaiting_details) {
    const phone = extractPhone(bodyRaw);
    await upsertSession(from, { details: bodyRaw, awaiting_details: 0 });
    const resumen =
`${TAG} Gracias. Guardé tus detalles para *${s0.last_choice}*:

📝 Detalle recibido:
"${bodyRaw}"

${phone ? `📞 Teléfono detectado: ${phone}\n` : ''}✅ Hemos recibido tu solicitud. Un representante de **DestapesPR** te contactará pronto.

${CIERRE}`;
    return sendTwilioXML(res, resumen);
  }

  // 3) Detección de opción (número o palabra)
  const detected = matchChoice(bodyRaw);
  if (detected) {
    await upsertSession(from, { last_choice: detected, awaiting_details: 1, details: null });
    const out = `${RESPUESTAS[detected]}

Por favor incluye:
👤 Tu nombre completo  
📞 Tu número de contacto (787 / 939 o EE.UU.)  
⏰ Horario disponible

(Escribe "volver" para regresar al menú)`;
    return sendTwilioXML(res, out);
  }

  // 4) Si ya hubo elección previa pero no estaba esperando detalles, tratamos este mensaje como detalle adicional
  const s = await getSession(from);
  if (s?.last_choice && !s?.awaiting_details) {
    const phone = extractPhone(bodyRaw);
    await upsertSession(from, { details: bodyRaw });
    const resumen =
`${TAG} Gracias. Actualicé los detalles para *${s.last_choice}*:

📝 Detalle adicional:
"${bodyRaw}"

${phone ? `📞 Teléfono detectado: ${phone}\n` : ''}✅ Nos comunicaremos en breve. Si deseas cambiar de servicio escribe "volver".${CIERRE}`;
    return sendTwilioXML(res, resumen);
  }

  // 5) Fallback
  const fallback = `No entendí tu mensaje. Intenta nuevamente.\n\n${MAIN_MENU}`;
  return sendTwilioXML(res, fallback);
});

// ---------------------
// Root & listen
// ---------------------
app.get('/', (_req, res) => res.send(`${TAG} DestapesPR Bot activo ✅`));

app.listen(PORT, () => {
  console.log(`💬 DestapesPR bot corriendo en http://localhost:${PORT}`);
});