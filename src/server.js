import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { normalizeText, detectKeyword } from './normalizer.js';
import { replyFor } from './replies.js';
import { makeLog, writeLog } from './logger.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => res.send('DestapesPR Bot OK'));

app.post('/webhook/whatsapp', (req, res) => {
  const from = req.body.From || req.body.from || req.body.WaId || '';
  const body = req.body.Body || req.body.body || '';
  const { dbg_normalized } = normalizeText(body);
  const dbg_keyword = detectKeyword(dbg_normalized);
  const log = makeLog({ from, body, normalized: dbg_normalized, keyword: dbg_keyword });
  writeLog({ route: '/webhook/whatsapp', ...log });
  const text = replyFor(dbg_keyword);

  const looksLikeTwilio = typeof req.body.Body === 'string' || typeof req.body.WaId === 'string';
  if (looksLikeTwilio) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${text}</Message></Response>`;
    res.set('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  }
  return res.json({ ok: true, reply: text, debug: log });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DestapesPR bot running on http://localhost:${PORT}`));