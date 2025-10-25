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