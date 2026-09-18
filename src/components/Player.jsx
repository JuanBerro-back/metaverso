import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboard } from '../hooks/useKeyboard.js'
import { WALK_BOUND, ALL_COLLIDERS } from '../museum/config.js'
import { useStore } from '../store.js'

const UP = new THREE.Vector3(0, 1, 0)
const EYE_HEIGHT = 1.65
const WALK_SPEED = 3.6
const RUN_SPEED = 6.2
const RADIUS = 0.4

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

function resolveColliders(x, z) {
  for (const c of ALL_COLLIDERS) {
    const dx = clamp(x - c.x, -c.hw, c.hw)
    const dz = clamp(z - c.z, -c.hd, c.hd)
    let vx = x - c.x - dx
    let vz = z - c.z - dz
    const l = Math.hypot(vx, vz)
    if (l < RADIUS) {
      const push = (RADIUS - l) / (l || 1)
      x += vx * push
      z += vz * push
    }
  }
  return [clamp(x, -WALK_BOUND, WALK_BOUND), clamp(z, -WALK_BOUND, WALK_BOUND)]
}

export function Player() {
  const { camera } = useThree()
  const keys = useKeyboard()
  const viewing = useStore((s) => s.viewing)

  useFrame((_, delta) => {
    if (viewing) return

    const running = keys.current.shift
    const speed = (running ? RUN_SPEED : WALK_SPEED) * delta

    const front = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation)
    front.y = 0
    front.normalize()

    const right = new THREE.Vector3().crossVectors(front, UP)

    const move = new THREE.Vector3()
    if (keys.current.forward) move.add(front)
    if (keys.current.backward) move.sub(front)
    if (keys.current.right) move.add(right)
    if (keys.current.left) move.sub(right)
    if (move.lengthSq() > 0) move.normalize().multiplyScalar(speed)

    let x = camera.position.x + move.x
    let z = camera.position.z + move.z
    ;[x, z] = resolveColliders(x, z)

    camera.position.x = x
    camera.position.y = EYE_HEIGHT
    camera.position.z = z
  })

  return null
}