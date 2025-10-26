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