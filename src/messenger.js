import Twilio from 'twilio';

const ENABLE_TWILIO = String(process.env.ENABLE_TWILIO || '').toLowerCase() === 'true';
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN  || '';
const WA_FROM     = process.env.TWILIO_WHATSAPP_NUMBER || ''; // ej: +14155238886

const normalizeWa = (n) => (String(n).startsWith('whatsapp:') ? n : `whatsapp:${n}`);

let client = null;
if (ENABLE_TWILIO && ACCOUNT_SID && AUTH_TOKEN) {
  client = Twilio(ACCOUNT_SID, AUTH_TOKEN);
}

export async function sendWhatsApp(to, text) {
  const ts = new Date().toISOString();
  if (!ENABLE_TWILIO || !client || !WA_FROM) {
    console.log(`[WA-DRYRUN ${ts}] to=${to} :: ${text}`);
    return { ok: true, dryRun: true };
  }
  const msg = await client.messages.create({
    from: normalizeWa(WA_FROM),
    to: normalizeWa(to),
    body: text
  });
  return { ok: true, sid: msg.sid };
}

export function canSend() {
  return ENABLE_TWILIO && !!client && !!WA_FROM;
}
