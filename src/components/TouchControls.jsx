import { useCallback, useEffect, useRef } from 'react'
import { useStore } from '../store.js'
import { touchInput, resetTouchInput } from '../player/input.js'
import { look } from './PointerLock.jsx'

const JOY_RADIUS = 58
const LOOK_SENS = 0.0042

/**
 * Controles táctiles / sin captura de ratón.
 *
 * Se activan en móviles y tablets, y también se pueden activar a mano desde la
 * pausa ("Controles sin capturar el ratón") en equipos de presentación donde el
 * bloqueo del puntero no está disponible.
 *
 * - Joystick a la izquierda: mover al avatar.
 * - Arrastrar en la zona derecha: girar la cámara.
 * - Botones: saltar, correr e interactuar (equivale a la tecla E).
 */
export function TouchControls() {
  const touch = useStore((s) => s.touch)
  const view = useStore((s) => s.view)
  const locked = useStore((s) => s.locked)
  const station = useStore((s) => s.station)
  const viewing = useStore((s) => s.viewing)
  const xrActive = useStore((s) => s.xrActive)

  const knobRef = useRef(null)
  const joyPointer = useRef(null)
  const lookPointer = useRef(null)
  const lastLook = useRef({ x: 0, y: 0 })

  const visible = touch && !locked && view === 'world' && !station && !viewing && !xrActive

  // Al ocultarse, suelta cualquier eje activo para que el avatar no se mueva solo.
  useEffect(() => {
    if (!visible) resetTouchInput()
  }, [visible])

  const aplicarJoystick = useCallback((clientX, clientY, rect) => {
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = (clientX - cx) / JOY_RADIUS
    let dy = (clientY - cy) / JOY_RADIUS
    const len = Math.hypot(dx, dy)
    if (len > 1) {
      dx /= len
      dy /= len
    }
    touchInput.moveX = dx
    // Arriba = avanzar (el eje de pantalla va al revés que el de juego).
    touchInput.moveY = -dy
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx * JOY_RADIUS}px, ${dy * JOY_RADIUS}px)`
  }, [])

  const onJoyDown = (e) => {
    e.preventDefault()
    joyPointer.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    aplicarJoystick(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())
  }
  const onJoyMove = (e) => {
    if (joyPointer.current !== e.pointerId) return
    aplicarJoystick(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())
  }
  const onJoyUp = (e) => {
    if (joyPointer.current !== e.pointerId) return
    joyPointer.current = null
    touchInput.moveX = 0
    touchInput.moveY = 0
    if (knobRef.current) knobRef.current.style.transform = 'translate(0, 0)'
  }

  const onLookDown = (e) => {
    if (e.target !== e.currentTarget) return
    e.preventDefault()
    lookPointer.current = e.pointerId
    lastLook.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onLookMove = (e) => {
    if (lookPointer.current !== e.pointerId) return
    const dx = e.clientX - lastLook.current.x
    const dy = e.clientY - lastLook.current.y
    lastLook.current = { x: e.clientX, y: e.clientY }
    look.yaw -= dx * LOOK_SENS
    look.pitch -= dy * LOOK_SENS
    look.pitch = Math.max(-1.15, Math.min(0.98, look.pitch))
  }
  const onLookUp = (e) => {
    if (lookPointer.current === e.pointerId) lookPointer.current = null
  }

  if (!visible) {
    return <div className="touch-layer" aria-hidden="true" />
  }

  return (
    <div className="touch-layer">
      <div
        className="touch-look"
        onPointerDown={onLookDown}
        onPointerMove={onLookMove}
        onPointerUp={onLookUp}
        onPointerCancel={onLookUp}
        aria-hidden="true"
      />

      <div
        className="touch-joy"
        role="group"
        aria-label="Joystick de movimiento"
        onPointerDown={onJoyDown}
        onPointerMove={onJoyMove}
        onPointerUp={onJoyUp}
        onPointerCancel={onJoyUp}
      >
        <span className="touch-joy-knob" ref={knobRef} />
      </div>

      <div className="touch-actions">
        <button
          type="button"
          className="touch-btn"
          aria-label="Saltar"
          onPointerDown={(e) => {
            e.preventDefault()
            touchInput.jump = true
          }}
        >
          ⤒
        </button>
        <button
          type="button"
          className="touch-btn"
          aria-label="Correr (mantener)"
          onPointerDown={(e) => {
            e.preventDefault()
            touchInput.running = true
          }}
          onPointerUp={() => {
            touchInput.running = false
          }}
          onPointerLeave={() => {
            touchInput.running = false
          }}
        >
          ⚡
        </button>
        <button
          type="button"
          className="touch-btn primary"
          aria-label="Interactuar"
          onPointerDown={(e) => {
            e.preventDefault()
            touchInput.interact = true
          }}
        >
          E
        </button>
      </div>
    </div>
  )
}
