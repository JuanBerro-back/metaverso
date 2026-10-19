/**
 * Modo de red de la demo.
 *
 * HONESTIDAD: no hay backend multijugador. La experiencia es individual: no hay
 * otros visitantes, ni NPC con los que hablar, ni datos compartidos (ver README
 * → "Por qué no hay otros visitantes"). Todo ocurre en tu navegador.
 *
 * Para un multijugador real haría falta un servidor aparte (Socket.io +
 * Node/Express) y definir VITE_WS_URL. Ver README → "Modo online".
 */

/** Texto oficial del modo actual, para reutilizar en toda la interfaz. */
export const MODO_LOCAL = {
  etiqueta: 'Modo demostración local',
  detalle:
    'Experiencia individual sin conexión: no hay otros usuarios ni backend multijugador. Todo ocurre en tu navegador.',
}
