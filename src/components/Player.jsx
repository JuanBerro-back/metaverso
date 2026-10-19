import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboard } from '../hooks/useKeyboard.js'
import { WALK_BOUND, GAME_COLLIDERS, MUSEUM_COLLIDERS } from '../museum/config.js'
import { useStore } from '../store.js'
import { playerState } from '../player/state.js'
import { resolveColliders } from '../player/collide.js'
import { look } from './PointerLock.jsx'
import { touchInput } from '../player/input.js'

const RADIUS = 0.42
const WALK_SPEED = 3.6
const RUN_SPEED = 6.2
const GRAVITY = -20
const JUMP_SPEED = 7.2
const EYE_HEIGHT = 1.62

// Cámara en tercera persona
const CAM_DIST = 4.4
const CAM_TARGET_H = 1.4
const CAM_MIN_Y = 0.75
const PITCH_MIN = -1.15
const PITCH_MAX = 0.98

const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _move = new THREE.Vector3()
const _target = new THREE.Vector3()

/** Vector unitario hacia donde mira la cámara (según yaw/pitch). */
function viewForward(yaw, pitch, out) {
  const cp = Math.cos(pitch)
  return out.set(-Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp)
}

/** Interpola ángulos por el camino corto. */
function dampAngle(current, target, lambda, delta) {
  let diff = target - current
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return current + diff * (1 - Math.exp(-lambda * delta))
}

export function Player() {
  const { camera } = useThree()
  const keys = useKeyboard()
  const vy = useRef(0)

  const init = useRef(false)
  useEffect(() => {
    if (init.current) return
    init.current = true
    camera.rotation.order = 'YXZ'
  }, [camera])

  useFrame((_, delta) => {
    const st = useStore.getState()

    // En VR la cámara la gobierna WebXR; el controlador de escritorio se apaga.
    if (st.xrActive) return

    const clamped = Math.min(delta, 0.05)
    const inWorld = st.view === 'world'
    const overlayOpen = Boolean(st.viewing || st.station)
    const canMove = inWorld && !overlayOpen && (st.locked || st.touch)

    const colliders = st.mode === 'game' ? GAME_COLLIDERS : MUSEUM_COLLIDERS

    /* ---------------- Movimiento ---------------- */
    _move.set(0, 0, 0)
    if (canMove) {
      const yaw = look.yaw
      _forward.set(-Math.sin(yaw), 0, -Math.cos(yaw))
      _right.set(Math.cos(yaw), 0, -Math.sin(yaw))

      const fwd = (keys.current.forward ? 1 : 0) - (keys.current.backward ? 1 : 0) + touchInput.moveY
      const side = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0) + touchInput.moveX

      if (fwd !== 0) _move.addScaledVector(_forward, fwd)
      if (side !== 0) _move.addScaledVector(_right, side)
    }

    const running = canMove && (keys.current.shift || touchInput.running)
    const maxSpeed = running ? RUN_SPEED : WALK_SPEED
    // Si el vector viene del joystick puede superar 1; lo normalizamos.
    if (_move.lengthSq() > 1) _move.normalize()

    const speed = _move.length() * maxSpeed
    playerState.speed = speed
    playerState.moving = speed > 0.05
    playerState.running = running

    if (speed > 0) {
      const dx = _move.x * maxSpeed * clamped
      const dz = _move.z * maxSpeed * clamped
      const [nx, nz] = resolveColliders(playerState.x + dx, playerState.z + dz, RADIUS, colliders, WALK_BOUND)
      playerState.x = nx
      playerState.z = nz
      // El avatar gira hacia la dirección de avance.
      const objetivo = Math.atan2(-_move.x, -_move.z)
      playerState.yaw = dampAngle(playerState.yaw, objetivo, running ? 14 : 9, clamped)
    }

    /* ---------------- Salto y gravedad ---------------- */
    const grounded = playerState.y <= 0.0001
    if (canMove && (keys.current.jump || touchInput.jump)) {
      keys.current.jump = false
      touchInput.jump = false
      if (grounded) vy.current = JUMP_SPEED
    }

    if (!grounded || vy.current !== 0) {
      vy.current += GRAVITY * clamped
      playerState.y += vy.current * clamped
      if (playerState.y <= 0) {
        playerState.y = 0
        vy.current = 0
      }
    } else {
      playerState.y = 0
      vy.current = 0
    }
    playerState.grounded = playerState.y <= 0.0001

    /* ---------------- Cámara ---------------- */
    look.pitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, look.pitch))

    _target.set(playerState.x, playerState.y + CAM_TARGET_H, playerState.z)

    if (st.cameraMode === 'first') {
      camera.position.set(playerState.x, playerState.y + EYE_HEIGHT, playerState.z)
      camera.rotation.set(look.pitch, look.yaw, 0, 'YXZ')
    } else {
      viewForward(look.yaw, look.pitch, _forward)
      camera.position.set(
        _target.x - _forward.x * CAM_DIST,
        _target.y - _forward.y * CAM_DIST,
        _target.z - _forward.z * CAM_DIST
      )

      // La cámara no debe atravesar muros ni mobiliario.
      const [cx, cz] = resolveColliders(
        camera.position.x,
        camera.position.z,
        0.3,
        colliders,
        WALK_BOUND + 0.6
      )
      camera.position.x = cx
      camera.position.z = cz
      if (camera.position.y < CAM_MIN_Y) camera.position.y = CAM_MIN_Y

      camera.lookAt(_target)
    }
  })

  return null
}
