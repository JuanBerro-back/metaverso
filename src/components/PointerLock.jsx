import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

export const look = { yaw: 0, pitch: 0 }

const SENS = 0.0022
const PITCH_LIMIT = 1.5

export function lockPointer() {
  const canvas = document.querySelector('#scene canvas')
  const target = canvas || document.getElementById('scene') || document.body
  if (!target) return
  try {
    const p = target.requestPointerLock()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  } catch {
    /* el navegador puede rechazar el bloqueo; se reintenta al pulsar de nuevo */
  }
}

export function PointerLock() {
  const { camera, gl } = useThree()

  useEffect(() => {
    const locked = () => document.pointerLockElement != null
    const onMove = (e) => {
      if (!locked()) return
      look.yaw -= e.movementX * SENS
      look.pitch -= e.movementY * SENS
      look.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, look.pitch))
    }
    gl.domElement.addEventListener('mousemove', onMove)
    return () => gl.domElement.removeEventListener('mousemove', onMove)
  }, [gl])

  useFrame(() => {
    if (!document.pointerLockElement) return
    camera.rotation.set(look.pitch, look.yaw, 0, 'YXZ')
  })

  return null
}