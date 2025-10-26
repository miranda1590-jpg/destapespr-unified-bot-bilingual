import dayjs from 'dayjs';
import { REPLIES } from './replies.js';
import { sendWhatsApp } from './messenger.js';

/**
 * Programa (con setTimeout) los mensajes de confirmación y recordatorios
 * para una cita. Si alguna hora ya pasó, ese recordatorio se omite.
 */
export function scheduleAllForBooking({
  to,
  lang = 'es',
  whenISO,
  service,
  name = 'Cliente',
  address = 'por confirmar',
  slotLabel,     // ej. "3:00 PM"
  dateLabel,     // ej. "2025-10-30"
  durationMin = 60,
}) {
  const T = (REPLIES[lang]?.reminders ?? REPLIES.es.reminders);

  const start = dayjs(whenISO);
  if (!start.isValid()) {
    console.error('[reminders] Fecha inválida:', whenISO);
    return false;
  }

  // Helpers
  const now = () => Date.now();
  const msUntil = (ts) => ts - now();
  const scheduleAt = (ts, fn, label) => {
    const delay = msUntil(ts);
    if (delay <= 0) return false; // ya pasó
    setTimeout(() => {
      try { fn(); } catch (e) { console.error(`[reminders] error en ${label}:`, e); }
    }, delay);
    return true;
  };

  // Mensajes
  const msgConfirm = T.confirm({ name, service, dateLabel, slotLabel, address });
  const msg24h     = T.h24({ name, service, dateLabel, slotLabel });
  const msg2h      = T.h2({ name, service, slotLabel });
  const msg0h      = T.h0({ name });

  // Timestamps
  const tStart   = start.valueOf();
  const tMinus24 = start.subtract(24, 'hour').valueOf();
  const tMinus2  = start.subtract(2, 'hour').valueOf();

  // Enviar confirmación inmediatamente
  try {
    sendWhatsApp(to, msgConfirm);
  } catch (e) {
    console.error('[reminders] error enviando confirmación:', e);
  }

  // Programar recordatorios
  scheduleAt(tMinus24, () => sendWhatsApp(to, msg24h),  'h-24');
  scheduleAt(tMinus2,  () => sendWhatsApp(to, msg2h),   'h-2');
  scheduleAt(tStart,   () => sendWhatsApp(to, msg0h),   'h-0');

  return true;
}

import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';
import { sendWhatsApp } from './messenger.js';
import { L } from './texts.js';

// Extensiones de Day.js para manejar UTC y zona horaria
dayjs.extend(utc);
dayjs.extend(tz);

// Lista temporal de trabajos programados
const JOBS = []; // { id, to, lang, kind, whenISO, payload }

/**
 * Registra un recordatorio o mensaje programado
 */
export function scheduleJob({ to, lang, kind, whenISO, payload }) {
  const id = `${kind}:${to}:${whenISO}`;
  JOBS.push({ id, to, lang, kind, whenISO, payload });
  return id;
}

/**
 * Verifica cada minuto si hay mensajes por enviar
 */
cron.schedule('* * * * *', async () => {
  const now = dayjs().utc();
  const due = JOBS.filter(j => dayjs(j.whenISO).isBefore(now.add(5, 'second')));

  for (const j of due) {
    try {
      const t = L[j.lang] || L.es;
      let body = '';

      if (j.kind === 'confirm') body = t.confirm(j.payload);
      if (j.kind === 'r24') body = t.r24(j.payload);
      if (j.kind === 'r2') body = t.r2(j.payload);
      if (j.kind === 'thanks') body = t.thanks(j.payload);
      if (j.kind === 'review') body = t.review(j.payload);

      if (body) await sendWhatsApp(j.to, body);
    } catch (e) {
      console.error('REMINDER ERROR', j, e);
    }
  }

  // Elimina los recordatorios ya enviados
  for (const j of due) {
    const i = JOBS.findIndex(x => x.id === j.id);
    if (i >= 0) JOBS.splice(i, 1);
  }
});

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
    payload: { name, service, address, date: dateLabel, slot: slotLabel }
  });

  const start = dayjs(whenISO);

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
    whenISO: start.subtract(2, 'hour').toISOString(),
    payload: { date: dateLabel, slot: slotLabel }
  });

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