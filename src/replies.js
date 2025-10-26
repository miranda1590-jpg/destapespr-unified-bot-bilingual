// src/replies.js
import { L } from './texts.js';

// Keywords esperados desde tu detectKeyword()
const KEY_MAP = {
  destape: 'destape',
  fuga: 'fuga',
  camara: 'camara',
  cita: 'cita',
  otros: 'otros',
  // Fallbacks comunes
  precio: 'destape',          // si piden precio, suele ser por destape
  disponibilidad: 'cita',     // disponibilidad -> agendar
  emergencia: 'destape',      // emergencia -> destape/servicio rápido
  direccion: 'cita',          // piden dirección -> agenda
  agendar: 'cita',
  saludo: 'otros',
  otro: 'otros'
};

// Export para compatibilidad (si en algún lado importabas REPLIES)
export const REPLIES = {
  es: {
    saludo: L.es.saludo,
    cierre: L.es.cierre,
    ...L.es.faq
  },
  en: {
    saludo: L.en.saludo,
    cierre: L.en.cierre,
    ...L.en.faq
  }
};

export function replyFor(keyword = '', lang = 'es') {
  const t = L[lang] || L.es;
  const key = KEY_MAP[keyword] || 'otros';

  // Si no hay keyword clara, manda saludo breve
  if (!keyword) return t.saludo;

  const main = t.faq[key] || t.faq.otros;
  return `${main}\n\n${t.cierre}`;
} 