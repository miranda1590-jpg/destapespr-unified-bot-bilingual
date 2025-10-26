fix/render-package
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

import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Envía mensajes de WhatsApp con Twilio.
// Ejemplo: sendWhatsApp('+1787XXXXXXX', 'Hola desde DestapesPR')
export async function sendWhatsApp(to, body) {
  const toWhats = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const fromWhats = process.env.TWILIO_WHATSAPP_FROM; // ej: 'whatsapp:+14155238886'
  if (!fromWhats) throw new Error('Falta TWILIO_WHATSAPP_FROM en las variables de entorno');
  return client.messages.create({ to: toWhats, from: fromWhats, body });
}
feat/initial-setup
