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
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</Message></Response>`;
    res.set('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  }
  return res.json({ ok: true, reply: text, debug: log });
});