cat > src/reminders.js <<'EOF'
import cron from 'node-cron';
import dayjs from 'dayjs';
import { sendWhatsApp } from './messenger.js';

const JOBS = []; // { id, to, whenISO, body }

/** Programa un envío único de WhatsApp para whenISO */
export function scheduleJob({ to, whenISO, body }) {
  const id = `${to}:${whenISO}:${Math.random().toString(36).slice(2)}`;
  JOBS.push({ id, to, whenISO, body });
  return id;
}

/** Loop cada minuto: dispara los jobs vencidos y los elimina */
cron.schedule('* * * * *', async () => {
  const now = dayjs();
  const due = JOBS.filter(j => dayjs(j.whenISO).isBefore(now.add(5, 'second')));
  for (const j of due) {
    try {
      if (j.body) await sendWhatsApp(j.to, j.body);
    } catch (e) {
      console.error('[REMINDER ERROR]', j, e);
    }
  }
  // limpiar los ya ejecutados
  for (const j of due) {
    const i = JOBS.findIndex(x => x.id === j.id);
    if (i >= 0) JOBS.splice(i, 1);
  }
});

/**
 * Programa el follow-up de “cita” a los 20 minutos
 * (mensaje con el Calendly en español)
 */
export function scheduleAllForBooking({ to }) {
  const whenISO = dayjs().add(20, 'minute').toISOString();
  const body = '⏰ Seguimiento: ¿pudiste agendar tu cita? Aquí el enlace: https://calendly.com/destapespr/visita-tecnica-destapespr';
  scheduleJob({ to, whenISO, body });
}

export default { scheduleJob, scheduleAllForBooking };
EOF 