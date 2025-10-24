const TEMPLATES_ES = {
  fuga: 'Entiendo, tienes una fuga 💧. ¿Es bajo el fregadero, baño o exterior?',
  obstruccion: 'Parece una obstrucción 🚫🌀. ¿Drena lento o está totalmente tapado?',
  drenaje: 'Sobre el drenaje 🧰: ¿es cocina, baño o pluvial?',
  camara: 'Hacemos inspecciones con cámara 📹. ¿En qué área está el asunto?',
  calentador: '¿Es calentador de tanque o instantáneo? ¿Gas o eléctrico?',
  default: '¡Gracias por escribir a DestapesPR! ¿Puedes contarme el problema (baño, cocina, exterior)?'
};

const TEMPLATES_EN = {
  fuga: 'Got it, you have a leak 💧. Is it under the sink, in the bathroom, or outside?',
  obstruccion: 'Sounds like a blockage 🚫🌀. Is it draining slowly or completely clogged?',
  drenaje: 'About the drain 🧰: kitchen, bathroom, or storm drain?',
  camara: 'We do camera inspections 📹 to locate issues. Which area is it in?',
  calentador: 'Is it a tank or tankless water heater? Gas or electric?',
  default: 'Thanks for contacting DestapesPR! Can you tell me the issue (bathroom, kitchen, outside)?'
};

const FOLLOWUP_ES = {
  area: '¿En qué área está el problema (baño, cocina, exterior)?',
  urgencia: '¿Qué tan urgente es? (inmediato, hoy, 24–48h)',
  disponibilidad: '¿Qué horarios te funcionan para atenderte?'
};

const FOLLOWUP_EN = {
  area: 'Which area is the issue in (bathroom, kitchen, outside)?',
  urgencia: 'How urgent is it? (immediate, today, 24–48h)',
  disponibilidad: 'What time windows work for you?'
};

export function replyFor(keyword, lang) {
  const T = lang === 'en' ? TEMPLATES_EN : TEMPLATES_ES;
  return T[keyword] ?? T.default;
}

// Memoria simple por número (en producción: Redis/DB)
const MEMORY = new Map();

export function nextTurn(from, body, keyword, lang) {
  const key = String(from || 'unknown');
  const S = MEMORY.get(key) || { step: 0, data: {}, lang: lang || 'es' };
  if (!S.lang) S.lang = lang || 'es';
  const F = S.lang === 'en' ? FOLLOWUP_EN : FOLLOWUP_ES;

  if (S.step === 0) {
    S.data.keyword = keyword || 'general';
    S.step = 1;
    MEMORY.set(key, S);
    return F.area;
  }

  if (S.step === 1) {
    S.data.area = body;
    S.step = 2;
    MEMORY.set(key, S);
    return F.urgencia;
  }

  if (S.step === 2) {
    S.data.urgencia = body;
    S.step = 3;
    MEMORY.set(key, S);
    return F.disponibilidad;
  }

  if (S.step === 3) {
    S.data.disponibilidad = body;
    S.step = 4;
    MEMORY.set(key, S);
    return S.lang === 'en'
      ? `Thanks. Summary: issue=${S.data.keyword}, area=${S.data.area}, urgency=${S.data.urgencia}, availability=${S.data.disponibilidad}. Shall I confirm a visit?`
      : `Gracias. Resumen: problema=${S.data.keyword}, área=${S.data.area}, urgencia=${S.data.urgencia}, disponibilidad=${S.data.disponibilidad}. ¿Te confirmo una visita?`;
  }

  return S.lang === 'en'
    ? 'Would you like to schedule a visit or need more details?'
    : '¿Deseas agendar visita o necesitas más detalles?';
}