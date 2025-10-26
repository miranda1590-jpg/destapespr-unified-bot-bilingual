// src/texts.js
export const L = {
  es: {
    saludo: "¡Hola! 👋 Soy el asistente de DestapesPR. ¿En qué podemos ayudarte hoy? (precio, disponibilidad, emergencia, dirección…)",
    cierre: "¿Te ayudo con algo más?",
    faq: {
      precio: "Nuestros precios varían según el trabajo. Para cotizar, dime el tipo de problema (fregadero, inodoro, tubería principal) y tu ubicación aproximada.",
      disponibilidad: "Tenemos disponibilidad el mismo día en la mayoría de áreas. ¿Para cuándo lo necesitas? Puedo agendarte rápido.",
      emergencia: "¡Entendido! Para emergencias priorizamos el servicio. ¿En qué zona estás y cuál es el problema? Te confirmo el tiempo estimado.",
      direccion: "Compárteme por favor la dirección (o referencia cercana). Así verifico cobertura y te confirmo la hora.",
      agendar: "Perfecto, agendamos. Dime: nombre, dirección y un horario aproximado (mañana/tarde). Te envío confirmación enseguida.",
      otro: "Puedo ayudarte con: precios, disponibilidad, emergencias y agenda. Cuéntame un poco más y lo resolvemos."
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
    saludo: "Hi! 👋 I’m DestapesPR assistant. How can I help today? (price, availability, emergency, address…)",
    cierre: "Anything else I can help with?",
    faq: {
      precio: "Pricing depends on the job. Tell me the issue (sink, toilet, main line) and your approximate location to quote.",
      disponibilidad: "We usually have same-day availability. When do you need it? I can book you quickly.",
      emergencia: "Got it! For emergencies we prioritize service. What’s the area and the issue? I’ll confirm ETA.",
      direccion: "Please share your address (or nearest reference). I’ll confirm coverage and time.",
      agendar: "Great, let’s book it. Please send name, address and a preferred time (morning/afternoon). I’ll confirm right away.",
      otro: "I can help with pricing, availability, emergencies and booking. Tell me a bit more."
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