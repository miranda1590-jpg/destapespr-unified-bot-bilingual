import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { normalizeText, detectLanguage, detectKeyword } from './normalizer.js';
import { replyFor, nextTurn } from './replies.js';
import { makeLog, writeLog } from './logger.js';

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
  const lang = detectLanguage(dbg_normalized);
  const dbg_keyword = detectKeyword(dbg_normalized, lang);

  const firstReply = replyFor(dbg_keyword, lang);
  const followUp = nextTurn(from, body, dbg_keyword, lang);
  const text = `${firstReply}\n\n${followUp}`;

  const log = makeLog({ from, body, normalized: dbg_normalized, keyword: dbg_keyword });
  writeLog({ route: '/webhook/whatsapp', ...log });

  const looksLikeTwilio = typeof req.body.Body === 'string' || typeof req.body.WaId === 'string';
  if (looksLikeTwilio) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${text
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')}</Message></Response>`;
    res.set('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  }

  return res.json({ ok: true, reply: text, debug: log });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DestapesPR bot running on http://localhost:${PORT}`));