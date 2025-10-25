import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Variables de entorno esperadas:
// TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Envía un mensaje de WhatsApp usando Twilio.
 * @param {string} to - Número del destinatario (ej: +1787XXXXXXX)
 * @param {string} body - Contenido del mensaje
 */
export async function sendWhatsApp(to, body) {
  try {
    if (!to || !body) {
      console.error('❌ sendWhatsApp: Parámetros inválidos', { to, body });
      return;
    }

    const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
    const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    const msg = await client.messages.create({
      from,
      to: toFormatted,
      body,
    });

    console.log(`✅ WhatsApp enviado a ${to}: SID ${msg.sid}`);
    return msg.sid;
  } catch (err) {
    console.error('❌ Error enviando WhatsApp:', err.message);
  }
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