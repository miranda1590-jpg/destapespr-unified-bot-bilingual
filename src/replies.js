// src/replies.js

// Mensajes de saludo/cierre por idioma
export const REPLIES = {
  es: {
    saludo:
      "¡Hola! 👋 Soy el asistente de DestapesPR. ¿En qué podemos ayudarte hoy?",
    cierre:
      "Puedo ayudarte con destapes, fugas, cámara de inspección y citas. Cuéntame brevemente el problema y tu zona para orientarte y darte tiempo estimado."
  },
  en: {
    saludo:
      "Hi! 👋 I'm DestapesPR’s assistant. How can I help you today?",
    cierre:
      "I can help with drain cleaning, leaks, camera inspections and scheduling. Tell me briefly the issue and your area for an ETA."
  }
};

// Respuestas por intención (plantillas)
const TEMPLATES = {
  es: {
    fuga:
      "💧 Fuga de agua: Localizamos y reparamos fugas visibles y ocultas. ¿Dónde notas la humedad o goteo y desde cuándo ocurre? Compárteme tu zona para estimar tiempo de llegada.",
    obstruccion:
      "🌀 Destape de tuberías: Trabajamos fregaderos, inodoros, duchas y línea principal. Para cotizar rápido dime: zona (municipio/sector) y dónde está el tapón.",
    drenaje:
      "🧰 Drenaje: ¿es cocina, baño o pluvial? Podemos evaluar con equipo profesional y, si hace falta, inspección con cámara.",
    camara:
      "📹 Cámara de inspección: Diagnóstico con video para tuberías y drenajes. ¿En qué línea necesitas inspección y en qué área estás?",
    calentador:
      "🔥 Calentador: Revisamos seguridad, mezcla y fugas. ¿Es tanque o instantáneo? ¿Gas o eléctrico? ¿Dónde está instalado?",
    default: "¡Gracias por escribir a DestapesPR!"
  },
  // Si detectas 'en', puedes personalizar más tarde. Por ahora usa defaults en inglés.
  en: {
    leak:
      "💧 Water leak: we locate and repair visible/hidden leaks. Where do you see moisture or dripping, and since when? Share your area for ETA.",
    clog:
      "🌀 Drain cleaning: kitchen/bath/toilet/main line. Tell me your area (city/sector) and where the clog is.",
    camera:
      "📹 Camera inspection: video diagnostics for pipes and drains. Which line and what area?",
    heater:
      "🔥 Water heater: safety, mixing and leaks. Tank or tankless? Gas or electric?",
    default: "Thanks for contacting DestapesPR!"
  }
};

// Devuelve la plantilla según keyword e idioma (fallbacks a ES)
export function replyFor(keyword, lang = 'es') {
  const pack = TEMPLATES[lang] ?? TEMPLATES.es;
  return pack[keyword] ?? pack.default;
}