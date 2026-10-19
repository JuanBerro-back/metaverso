/**
 * Estado del jugador (fuera de React).
 *
 * Lo comparten el controlador, el avatar, la cámara y el recorrido guiado.
 * Se mantiene fuera del store de Zustand a propósito: cambia en cada fotograma
 * y no debe provocar re-renderizados de React.
 */
export const playerState = {
  /** Posición del avatar, con y = 0 apoyado en el suelo. */
  x: 0,
  y: 0,
  z: 4.5,
  /** Orientación del avatar en radianes (hacia dónde mira). */
  yaw: 0,
  /** Velocidad horizontal resultante (m/s), para animar el caminar. */
  speed: 0,
  moving: false,
  grounded: true,
  /** true mientras el jugador corre (Shift). */
  running: false,
}

/** Punto de aparición en el museo: junto a la entrada (z positivo). */
export const SPAWN_MUSEUM = { x: 0, z: 4.5, yaw: 0 }
/** Punto de aparición en el minijuego: frente a la banda. */
export const SPAWN_GAME = { x: 0, z: 3.9, yaw: 0 }

/**
 * Coloca al jugador en una posición concreta y detiene su inercia.
 * Lo usa el recorrido guiado para saltar de estación en estación.
 */
export function teleportPlayer({ x, z, yaw }, keepYaw = false) {
  playerState.x = x
  playerState.z = z
  playerState.y = 0
  playerState.speed = 0
  playerState.moving = false
  playerState.grounded = true
  if (!keepYaw && typeof yaw === 'number') playerState.yaw = yaw
}

/** Ángulo (radianes) que mira desde un punto hacia otro. */
export function yawTowards(fromX, fromZ, toX, toZ) {
  // yaw 0 mira hacia -Z, igual que la cámara por defecto de Three.js.
  return Math.atan2(-(toX - fromX), -(toZ - fromZ))
}
