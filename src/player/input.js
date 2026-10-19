/**
 * Entrada táctil / alternativa (móvil y portátiles de presentación).
 *
 * `TouchControls` escribe aquí y `Player` lo lee cada fotograma. Mantenerlo
 * fuera de React evita re-renderizados mientras se arrastra el dedo.
 */
export const touchInput = {
  /** Eje X del joystick virtual (-1 izquierda … 1 derecha). */
  moveX: 0,
  /** Eje Y del joystick virtual (-1 adelante … 1 atrás). */
  moveY: 0,
  /** Botón de correr pulsado. */
  running: false,
  /** Salto momentáneo (se consume y se limpia). */
  jump: false,
  /** Botón de interactuar momentáneo (se consume y se limpia). */
  interact: false,
}

export function resetTouchInput() {
  touchInput.moveX = 0
  touchInput.moveY = 0
  touchInput.running = false
  touchInput.jump = false
  touchInput.interact = false
}
