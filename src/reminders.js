import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';
import { sendWhatsApp } from './messenger.js';
import { L } from './texts.js';

fix/render-package
// Extensiones de Day.js para manejar UTC y zona horaria
dayjs.extend(utc);
dayjs.extend(tz);

// Lista temporal de trabajos programados
const JOBS = []; // { id, to, lang, kind, whenISO, payload }

/**
 * Registra un recordatorio o mensaje programado
 */

dayjs.extend(utc); dayjs.extend(tz);

const JOBS = []; // { id, to, lang, kind, whenISO, payload }

feat/initial-setup
export function scheduleJob({ to, lang, kind, whenISO, payload }) {
  const id = `${kind}:${to}:${whenISO}`;
  JOBS.push({ id, to, lang, kind, whenISO, payload });
  return id;
}

fix/render-package
/**
 * Verifica cada minuto si hay mensajes por enviar
 */
cron.schedule('* * * * *', async () => {
  const now = dayjs().utc();
  const due = JOBS.filter(j => dayjs(j.whenISO).isBefore(now.add(5, 'second')));


cron.schedule('* * * * *', async () => {
  const now = dayjs().utc();
  const due = JOBS.filter(j => dayjs(j.whenISO).isBefore(now.add(5,'second')));
feat/initial-setup
  for (const j of due) {
    try {
      const t = L[j.lang] || L.es;
      let body = '';
fix/render-package

      if (j.kind === 'confirm') body = t.confirm(j.payload);
      if (j.kind === 'r24') body = t.r24(j.payload);
      if (j.kind === 'r2') body = t.r2(j.payload);
      if (j.kind === 'thanks') body = t.thanks(j.payload);
      if (j.kind === 'review') body = t.review(j.payload);


      if (j.kind === 'confirm') body = t.confirm(j.payload);
      if (j.kind === 'r24')     body = t.r24(j.payload);
      if (j.kind === 'r2')      body = t.r2(j.payload);
      if (j.kind === 'thanks')  body = t.thanks(j.payload);
      if (j.kind === 'review')  body = t.review(j.payload);
feat/initial-setup
      if (body) await sendWhatsApp(j.to, body);
    } catch (e) {
      console.error('REMINDER ERROR', j, e);
    }
  }
fix/render-package

  // Elimina los recordatorios ya enviados

feat/initial-setup
  for (const j of due) {
    const i = JOBS.findIndex(x => x.id === j.id);
    if (i >= 0) JOBS.splice(i, 1);
  }
});

fix/render-package
/**
 * Programa todos los mensajes relacionados con una reserva de servicio:
 * confirmación inmediata, recordatorios, agradecimientos y solicitud de reseña.
 */
export function scheduleAllForBooking({
  to,
  lang,
  whenISO,
  durationMin = 60,
  service,
  name,
  address,
  slotLabel,
  dateLabel
}) {
  // Confirmación inmediata
  scheduleJob({
    to,
    lang,
    kind: 'confirm',
    whenISO: dayjs().utc().add(5, 'second').toISOString(),

export function scheduleAllForBooking({
  to, lang, whenISO, durationMin = 60, service, name, address, slotLabel, dateLabel
}) {
  scheduleJob({
    to, lang, kind: 'confirm',
    whenISO: dayjs().utc().add(5,'second').toISOString(),
feat/initial-setup
    payload: { name, service, address, date: dateLabel, slot: slotLabel }
  });

  const start = dayjs(whenISO);
ix/render-package

  // Recordatorio 24h antes
  scheduleJob({
    to,
    lang,
    kind: 'r24',
    whenISO: start.subtract(24, 'hour').toISOString(),
    payload: { service, date: dateLabel, slot: slotLabel }
  });

  // Recordatorio 2h antes
  scheduleJob({
    to,
    lang,
    kind: 'r2',

  scheduleJob({
    to, lang, kind: 'r24',
    whenISO: start.subtract(24, 'hour').toISOString(),
    payload: { service, date: dateLabel, slot: slotLabel }
  });
  scheduleJob({
    to, lang, kind: 'r2',
feat/initial-setup
    whenISO: start.subtract(2, 'hour').toISOString(),
    payload: { date: dateLabel, slot: slotLabel }
  });

fix/render-package
  // Agradecimiento una hora después
  const end = start.add(durationMin, 'minute').add(1, 'hour');
  scheduleJob({
    to,
    lang,
    kind: 'thanks',
    whenISO: end.toISOString(),
    payload: { name, service }
  });

  // Solicitud de reseña 5 minutos después
  scheduleJob({
    to,
    lang,
    kind: 'review',
    whenISO: end.add(5, 'minute').toISOString(),
    payload: {}
  });
}

  const end = start.add(durationMin, 'minute').add(1,'hour');
  scheduleJob({ to, lang, kind: 'thanks', whenISO: end.toISOString(), payload: { name, service } });
  scheduleJob({ to, lang, kind: 'review', whenISO: end.add(5,'minute').toISOString(), payload: {} });
}
feat/initial-setup
