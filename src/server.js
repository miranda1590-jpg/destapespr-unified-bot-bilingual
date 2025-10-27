import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import dayjs from 'dayjs';

import { replyFor } from './replies.js';
import reminders from './reminders.js';
const { scheduleAllForBooking } = reminders;

// Logger opcional (si no existe, no rompe)
let makeLog = (x) => x, writeLog = () => {};
try {
  const logger = await import('./logger.js');
  makeLog = logger.makeLog ?? makeLog;
  writeLog = logger.writeLog ?? writeLog;
} catch {}

const app = express();
app.use(express.urlencoded({ extended: true })); // Twilio manda form-encoded
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => res.send('DestapesPR Bot OK'));
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.post('/webhook/whatsapp', (req, res) => {
  const from = req.body.From || req.body.from || req.body.WaId || '';
  const body = req.body.Body || req.body.body || '';

  const log = makeLog({ route: '/webhook/whatsapp', from, body });
  writeLog(log);

  const text = replyFor(body, { from });

  const looksLikeTwilio = typeof req.body.Body === 'string' || typeof req.body.WaId === 'string';
  if (looksLikeTwilio) {
    const safe = String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`;
    res.set('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  }
  return res.json({ ok: true, reply: text, debug: log });
});

// Endpoint simple para programar recordatorios desde tu front o prueba
app.post('/api/bookings', async (req, res) => {
  try {
    const { to, name, address, service, whenISO, lang = 'es', slotLabel, dateLabel } = req.body;
    if (!to || !service || !whenISO) {
      return res.status(400).json({ ok:false, error:'Missing to/service/whenISO' });
    }

    const start = dayjs(whenISO);
    const slot = slotLabel || start.format('h:mm A');
    const date = dateLabel || start.format('YYYY-MM-DD');

    scheduleAllForBooking({
      to,
      lang,
      whenISO,
      service,
      name: name || 'Cliente',
      address: address || 'por confirmar',
      slotLabel: slot,
      dateLabel: date,
      durationMin: 60,
    });

    return res.json({ ok:true, scheduled:true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok:false, error:'internal' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DestapesPR bot running on http://localhost:${PORT}`));
