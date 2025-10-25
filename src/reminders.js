import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import tz from 'dayjs/plugin/timezone.js';
import { sendWhatsApp } from './messenger.js';
import { L } from './texts.js';

dayjs.extend(utc); dayjs.extend(tz);

const JOBS = []; // { id, to, lang, kind, whenISO, payload }

export function scheduleJob({ to, lang, kind, whenISO, payload }) {
  const id = `${kind}:${to}:${whenISO}`;
  JOBS.push({ id, to, lang, kind, whenISO, payload });
  return id;
}

cron.schedule('* * * * *', async () => {
  const now = dayjs().utc();
  const due = JOBS.filter(j => dayjs(j.whenISO).isBefore(now.add(5,'second')));
  for (const j of due) {
    try {
      const t = L[j.lang] || L.es;
      let body = '';
      if (j.kind === 'confirm') body = t.confirm(j.payload);
      if (j.kind === 'r24')     body = t.r24(j.payload);
      if (j.kind === 'r2')      body = t.r2(j.payload);
      if (j.kind === 'thanks')  body = t.thanks(j.payload);
      if (j.kind === 'review')  body = t.review(j.payload);
      if (body) await sendWhatsApp(j.to, body);
    } catch (e) {
      console.error('REMINDER ERROR', j, e);
    }
  }
  for (const j of due) {
    const i = JOBS.findIndex(x => x.id === j.id);
    if (i >= 0) JOBS.splice(i, 1);
  }
});

export function scheduleAllForBooking({
  to, lang, whenISO, durationMin = 60, service, name, address, slotLabel, dateLabel
}) {
  scheduleJob({
    to, lang, kind: 'confirm',
    whenISO: dayjs().utc().add(5,'second').toISOString(),
    payload: { name, service, address, date: dateLabel, slot: slotLabel }
  });

  const start = dayjs(whenISO);
  scheduleJob({
    to, lang, kind: 'r24',
    whenISO: start.subtract(24, 'hour').toISOString(),
    payload: { service, date: dateLabel, slot: slotLabel }
  });
  scheduleJob({
    to, lang, kind: 'r2',
    whenISO: start.subtract(2, 'hour').toISOString(),
    payload: { date: dateLabel, slot: slotLabel }
  });

  const end = start.add(durationMin, 'minute').add(1,'hour');
  scheduleJob({ to, lang, kind: 'thanks', whenISO: end.toISOString(), payload: { name, service } });
  scheduleJob({ to, lang, kind: 'review', whenISO: end.add(5,'minute').toISOString(), payload: {} });
}
