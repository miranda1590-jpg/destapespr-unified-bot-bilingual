import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import dayjs from 'dayjs';

import { normalizeText, detectLanguage, detectKeyword } from './normalizer.js';
import { REPLIES, replyFor } from './replies.js';
import { scheduleAllForBooking } from './reminders.js';

// (Opcional) logger si existe
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

  const { dbg_normalized } = normalizeText(body);
  const lang = detectLanguage(dbg_normalized) || 'es';
  const keyword = detectKeyword(dbg_normalized, lang) || '';

  const log = makeLog({ from, body, normalized: dbg_normalized, keyword, lang });
  writeLog({ route: '/webhook/whatsapp', ...log });

  let text = '';
  if (!keyword) {
    text = REPLIES[lang]?.saludo ?? REPLIES.es.saludo;
  } else {
    const main = replyFor(keyword, lang);
    const cierre = REPLIES[lang]?.cierre ?? REPLIES.es.cierre;
    text = `${main}\n\n${cierre}`;
  }

  const looksLikeTwilio = typeof req.body.Body === 'string' || typeof req.body.WaId === 'string';
  if (looksLikeTwilio) {
    const safe = String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`;
    res.set('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  }
  return res.json({ ok: true, reply: text, debug: log });
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { to, name, address, service, whenISO, lang, previewText } = req.body;
    if (!to || !service || !whenISO) {
      return res.status(400).json({ ok:false, error:'Missing to/service/whenISO' });
    }

    let langFinal = lang;
    if (!langFinal && previewText) {
      const { dbg_normalized } = normalizeText(previewText);
      langFinal = detectLanguage(dbg_normalized);
    }
    if (!langFinal) langFinal = 'es';

    const start = dayjs(whenISO);
    const slotLabel = start.format('h:mm A');
    const dateLabel = start.format('YYYY-MM-DD');

    scheduleAllForBooking({
      to,
      lang: langFinal,
      whenISO,
      service,
      name: name || 'Cliente',
      address: address || 'por confirmar',
      slotLabel,
      dateLabel,
      durationMin: 60
    });

    return res.json({ ok:true, scheduled:true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok:false, error:'internal' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DestapesPR bot running on http://localhost:${PORT}`));
