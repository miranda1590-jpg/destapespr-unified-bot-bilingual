// Respuestas en ES/EN + textos de recordatorios
export const REPLIES = {
  es: {
    saludo:
      '¡Hola! Soy el bot de DestapesPR 🚰. Puedo ayudarte a coordinar destapes y cotizaciones. Escribe "destape", "cotizar" o "emergencia".',
    cierre:
      '¿Te ayudo con algo más? Si quieres reservar, dime día y hora aproximada.',
    reminders: {
      confirm: ({ name, service, dateLabel, slotLabel, address }) =>
        `¡Gracias, ${name}! Tu ${service} está confirmado para ${dateLabel} a las ${slotLabel} en ${address}. Si necesitas cambiar la cita, responde a este mensaje.`,
      h24: ({ name, service, dateLabel, slotLabel }) =>
        `Recordatorio (24h): ${name}, tu ${service} es mañana ${dateLabel} a las ${slotLabel}.`,
      h2: ({ name, service, slotLabel }) =>
        `Recordatorio (2h): ${name}, te esperamos a las ${slotLabel} para tu ${service}.`,
      h0: ({ name }) => `¡Vamos en camino, ${name}!`
    }
  },
  en: {
    saludo:
      "Hi! I'm DestapesPR's bot 🚰. I can help schedule unclogging and quotes. Type “unclog”, “quote” or “emergency”.",
    cierre:
      'Anything else I can help with? If you want to book, tell me a day/time.',
    reminders: {
      confirm: ({ name, service, dateLabel, slotLabel, address }) =>
        `Thanks, ${name}! Your ${service} is confirmed for ${dateLabel} at ${slotLabel} at ${address}. If you need to reschedule, just reply to this message.`,
      h24: ({ name, service, dateLabel, slotLabel }) =>
        `Reminder (24h): ${name}, your ${service} is tomorrow ${dateLabel} at ${slotLabel}.`,
      h2: ({ name, service, slotLabel }) =>
        `Reminder (2h): ${name}, see you at ${slotLabel} for your ${service}.`,
      h0: ({ name }) => `We're on our way, ${name}!`
    }
  }
};

// Dado un keyword (de normalizer) y un idioma, arma la respuesta principal
export function replyFor(keyword = '', lang = 'es') {
  const L = REPLIES[lang] || REPLIES.es;
  const k = String(keyword || '').toLowerCase();

  // Ajusta estos “case” a los keywords reales que devuelve tu detectKeyword()
  switch (k) {
    case 'destape':
    case 'unclog':
      return lang === 'es'
        ? 'Perfecto. Para coordinar un destape necesito ubicación y una ventana de horario. ¿Dónde estás y qué hora te funciona?'
        : 'Great. To schedule an unclog I need your location and a time window. Where are you and what time works?';

    case 'cotizar':
    case 'quote':
      return lang === 'es'
        ? 'Con gusto te cotizo. Cuéntame el problema y envía fotos si puedes. ¿En qué municipio estás?'
        : 'Happy to send a quote. Tell me the issue and share photos if possible. What city are you in?';

    case 'emergencia':
    case 'emergency':
      return lang === 'es'
        ? 'Entendido. Para emergencia intentamos priorizar hoy mismo. Envíame dirección exacta y un teléfono por si necesitamos llamarte.'
        : 'Got it. For emergencies we try to prioritize same-day. Please send exact address and a phone number.';

    default:
      // Si no hay keyword reconocible, retorna saludo genérico
      return L.saludo;
  }
}
