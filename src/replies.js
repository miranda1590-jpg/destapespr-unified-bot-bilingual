// src/replies.js
import { L } from './texts.js';

// Mapa de keywords -> clave de mensaje en L.faq
// Asegúrate de que detectKeyword devuelva alguno de estos keys (o "" si no encontró).
const KEY_MAP = {
  precio: 'precio',
  disponibilidad: 'disponibilidad',
  emergencia: 'emergencia',
  direccion: 'direccion',
  agendar: 'agendar',
  gracias: 'otro',
  saludo: 'otro',
  otro: 'otro'
};

// Export opcional (por compatibilidad con imports existentes)
export const REPLIES = {
  es: {
    ...L.es.faq,
    saludo: L.es.saludo,
    cierre: L.es.cierre
  },
  en: {
    ...L.en.faq,
    saludo: L.en.saludo,
    cierre: L.en.cierre
  }
};

export function replyFor(keyword = '', lang = 'es') {
  const t = L[lang] || L.es;
  const key = KEY_MAP[keyword] || 'otro';

  if (!keyword || key === 'otro') {
    // Si no hubo keyword clara, manda saludo “inteligente”
    return `${t.saludo}`;
  }

  // Mensaje principal + cierre corto
  const main = t.faq[key] || t.faq.otro;
  return `${main}\n\n${t.cierre}`;
} 