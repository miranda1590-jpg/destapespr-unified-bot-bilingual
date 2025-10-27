cat > src/replies.js <<'EOF'
import { detectLanguage, detectIntent, normalizeText } from './keywords.js';

export function replyFor(body, { from } = {}) {
  const text = normalizeText(body || '');
  const lang = detectLanguage(text);        // 'es' o 'en' (pero responderemos en ES)
  const intent = detectIntent(text);        // 'destape' | 'fuga' | 'camara' | 'cita' | 'otros'

  // Solo ES por ahora (mensajes profesionales y con continuidad)
  if (intent === 'destape') {
    return [
      'Entendido 👍. Necesitas un **destape**.',
      '¿La tubería tapada es del **inodoro**, **fregadero**, **lavamanos**, **tubería principal** o es **pluvial**?',
      'Si puedes, envía una breve descripción (p. ej., “retroceso en el inodoro” o “fregadero tarda en bajar”).'
    ].join(' ');
  }

  if (intent === 'fuga') {
    return [
      'Gracias por avisar 💧. Parece una **fuga**.',
      '¿Notas **goteo constante**, **charco**, olor, o sube el contador de agua?',
      'Indica el área (baño, cocina, exterior) y si ya cerraste la llave principal.'
    ].join(' ');
  }

  if (intent === 'camara') {
    return [
      'Perfecto 👀. Podemos hacer **inspección con cámara** para localizar obstrucciones o roturas.',
      '¿En qué línea necesitas inspección (principal, baño, cocina, pluvial) y qué síntomas presentas?',
      'Así definimos el punto de acceso y el alcance.'
    ].join(' ');
  }

  if (intent === 'cita') {
    return [
      'Claro 📅. Podemos **agendar una visita técnica**.',
      'Reserva aquí: https://calendly.com/destapespr/visita-tecnica-destapespr',
      'Si prefieres, dime **día** y **franja** (mañana/tarde) y te la agendo manualmente.'
    ].join(' ');
  }

  // otros / saludo
  return [
    '¡Hola! 👋 Soy el asistente de DestapesPR. ¿En qué podemos ayudarte hoy?',
    'Puedo ayudarte con **destape**, **fuga**, **inspección con cámara** o **agendar una cita**.'
  ].join(' ');
}
EOF 