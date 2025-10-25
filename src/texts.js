export const L = {
  es: {
    reminders: {
      confirm: ({ name, service, dateLabel, slotLabel, address }) =>
        `¡Gracias, ${name}! Confirmamos tu cita de ${service} para ${dateLabel} a las ${slotLabel} en ${address}. Si necesitas reprogramar, responde a este mensaje.`,
      h24: ({ name, service, dateLabel, slotLabel }) =>
        `Recordatorio (24h): ${name}, tu servicio de ${service} es mañana ${dateLabel} a las ${slotLabel}.`,
      h2: ({ name, service, slotLabel }) =>
        `Recordatorio (2h): ${name}, nos vemos a las ${slotLabel} para tu ${service}.`,
      h0: ({ name }) =>
        `¡Estamos en camino, ${name}!`
    }
  },
  en: {
    reminders: {
      confirm: ({ name, service, dateLabel, slotLabel, address }) =>
        `Thanks, ${name}! Your ${service} is confirmed for ${dateLabel} at ${slotLabel} at ${address}. If you need to reschedule, just reply to this message.`,
      h24: ({ name, service, dateLabel, slotLabel }) =>
        `Reminder (24h): ${name}, your ${service} is tomorrow ${dateLabel} at ${slotLabel}.`,
      h2: ({ name, service, slotLabel }) =>
        `Reminder (2h): ${name}, see you at ${slotLabel} for your ${service}.`,
      h0: ({ name }) =>
        `We're on our way, ${name}!`
    }
  }
};
