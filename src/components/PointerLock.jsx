import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useStore } from '../store.js'

/**
 * Estado de la mirada (yaw/pitch). Vive fuera de React porque cambia con cada
 * movimiento del ratón y no debe provocar re-renderizados.
 */
export const look = { yaw: 0, pitch: 0 }

const SENS = 0.0022

/** ¿El navegador permite capturar el puntero? */
export function pointerLockSupported() {
  try {
    return typeof document !== 'undefined' && 'requestPointerLock' in (document.body || {})
  } catch {
    return false
  }
}

/**
 * Pide capturar el puntero. Es tolerante: los navegadores pueden rechazarlo si
 * no hay gesto de usuario o si la pestaña acaba de cambiar de foco.
 */
export function lockPointer() {
  const canvas = document.querySelector('#scene canvas')
  const target = canvas || document.getElementById('scene') || document.body
  if (!target || typeof target.requestPointerLock !== 'function') return
  try {
    const p = target.requestPointerLock()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  } catch {
    /* se reintenta al volver a pulsar */
  }
}

export function unlockPointer() {
  try {
    if (document.pointerLockElement) document.exitPointerLock()
  } catch {
    /* noop */
  }
}

/**
 * Ratón: solo actualiza `look`. Quien aplica la rotación a la cámara es
 * `Player` (tercera persona) o el modo primera persona; así el ratón no pelea
 * con el seguimiento de cámara.
 */
export function PointerLock() {
  const { gl } = useThree()
  const setLocked = useStore((s) => s.setLocked)

  useEffect(() => {
    const onChange = () => setLocked(document.pointerLockElement != null)
    document.addEventListener('pointerlockchange', onChange)
    document.addEventListener('pointerlockerror', onChange)
    return () => {
      document.removeEventListener('pointerlockchange', onChange)
      document.removeEventListener('pointerlockerror', onChange)
    }
  }, [setLocked])

  useEffect(() => {
    const onMove = (e) => {
      if (!document.pointerLockElement) return
      look.yaw -= e.movementX * SENS
      look.pitch -= e.movementY * SENS
    }
    gl.domElement.addEventListener('mousemove', onMove)
    return () => gl.domElement.removeEventListener('mousemove', onMove)
  }, [gl])

  return null
}
