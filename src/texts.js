// src/texts.js
export const L = {
  es: {
    saludo: "¡Hola! 👋 Soy el asistente de DestapesPR. ¿En qué podemos ayudarte hoy?",
    cierre: "¿Te ayudo con algo más?",
    faq: {
      destape:
        "✅ *Destape de tuberías*: Trabajamos fregaderos, inodoros, duchas y línea principal. Para cotizar rápido dime: zona (municipio/sector) y dónde está el tapón.",
      fuga:
        "💧 *Fuga de agua*: Localizamos y reparamos fugas visibles y ocultas. ¿Dónde notas la humedad o goteo y desde cuándo ocurre? Compárteme tu zona para estimar tiempo de llegada.",
      camara:
        "🎥 *Cámara de inspección*: Hacemos diagnóstico con video para tuberías y drenajes (ideal si el problema regresa). ¿En qué línea necesitas inspección y en qué área estás?",
      cita:
        "🗓️ *Agendar cita*: Dime *nombre*, *dirección* y horario preferido (*mañana* o *tarde*). Si ya tienes fecha en mente, mejor aún. Te envío confirmación enseguida.",
      otros:
        "Puedo ayudarte con *destapes, fugas, cámara de inspección* y *citas*. Cuéntame brevemente el problema y tu zona para orientarte y darte tiempo estimado."
    },
    reminders: {
      confirm: ({ name, service, date, slot, address }) =>
        `¡Gracias, ${name}! Tu ${service} quedó confirmado para ${date} a las ${slot} en ${address}. Si necesitas reprogramar, responde a este mensaje.`,
      r24: ({ service, date, slot }) =>
        `Recordatorio (24h): mañana ${date} a las ${slot} tenemos tu ${service}.`,
      r2: ({ date, slot }) =>
        `Recordatorio (2h): nos vemos hoy a las ${slot}.`,
      thanks: ({ name, service }) =>
        `¡Listo, ${name}! El servicio de ${service} fue completado. Gracias por elegirnos 🙌`,
      review: () =>
        `¿Podrías dejarnos una breve reseña? Tu comentario nos ayuda muchísimo. ¡Gracias!`
    }
  },

  en: {
    saludo: "Hi! 👋 I’m DestapesPR assistant. How can I help today?",
    cierre: "Anything else I can help with?",
    faq: {
      destape:
        "✅ *Drain unclogging*: We clear sinks, toilets, showers, and main lines. To quote quickly, tell me your area and which fixture is blocked.",
      fuga:
        "💧 *Leak repair*: We find and fix visible/hidden leaks. Where do you see moisture/dripping and since when? Share your area for an ETA.",
      camara:
        "🎥 *Camera inspection*: Video diagnostics for drains and sewer lines (great for recurring issues). Which line do you want inspected and what’s your area?",
      cita:
        "🗓️ *Book an appointment*: Please send *name*, *address*, and preferred time (*morning* or *afternoon*). If you already have a date, even better. I’ll confirm right away.",
      otros:
        "I can help with *unclogs, leaks, camera inspection,* and *appointments*. Tell me briefly the issue and your area for guidance and an ETA."
    },
    reminders: {
      confirm: ({ name, service, date, slot, address }) =>
        `Thanks, ${name}! Your ${service} is confirmed for ${date} at ${slot} at ${address}. If you need to reschedule, just reply to this message.`,
      r24: ({ service, date, slot }) =>
        `Reminder (24h): your ${service} is tomorrow ${date} at ${slot}.`,
      r2: ({ date, slot }) =>
        `Reminder (2h): see you today at ${slot}.`,
      thanks: ({ name, service }) =>
        `All set, ${name}! ${service} completed. Thanks for choosing us 🙌`,
      review: () =>
        `Could you leave us a short review? It really helps. Thanks!`
    }
  }
};