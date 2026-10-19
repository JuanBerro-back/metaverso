/**
 * Visitantes simulados ("bots") — multijugador de demostración.
 *
 * HONESTIDAD: no hay backend multijugador. Estos personajes son NPC locales
 * que pasean por el museo para mostrar cómo se vería el espacio compartido.
 * La interfaz lo indica siempre como "Modo demostración local".
 *
 * Para un multijugador real haría falta un servidor aparte (Socket.io +
 * Node/Express) y definir VITE_WS_URL. Ver README → "Modo online".
 */

export const DEMO_VISITORS = [
  {
    id: 'bot-ali',
    nombre: 'Ali',
    color: '#8f7bff',
    velocidad: 1.15,
    line: 'Soy un visitante simulado. En esta demo no hay multijugador real.',
  },
  {
    id: 'bot-mora',
    nombre: 'Mora',
    color: '#ff8fb1',
    velocidad: 0.95,
    line: 'Yo también soy un bot local: sirvo para enseñar cómo se vería el museo con más gente.',
  },
  {
    id: 'bot-tavo',
    nombre: 'Tavo',
    color: '#6ee7b7',
    velocidad: 1.3,
    line: 'Aquí no hay servidor: todo lo que ves ocurre en tu navegador.',
  },
]

/** Texto oficial del modo actual, para reutilizar en toda la interfaz. */
export const MODO_LOCAL = {
  etiqueta: 'Modo demostración local',
  detalle:
    'Los demás visitantes son bots simulados en tu navegador. No hay backend multijugador ni datos compartidos.',
}
