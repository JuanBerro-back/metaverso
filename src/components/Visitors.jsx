import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DEMO_VISITORS } from '../net/visitors.js'
import { MUSEUM_COLLIDERS, WALK_BOUND } from '../museum/config.js'
import { NPC_REGISTRY } from '../museum/registry.js'
import { resolveColliders } from '../player/collide.js'
import { useStore } from '../store.js'

const FONT = 'system-ui, "Segoe UI", Arial, sans-serif'
const RADIUS = 0.4

/** Cartelito del bot: nombre + aviso explícito de que es una simulación. */
function makeBotPlate(nombre, color) {
  const W = 512
  const H = 160
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(10,14,23,0.84)'
  ctx.fillRect(6, 6, W - 12, H - 12)
  ctx.strokeStyle = color
  ctx.lineWidth = 6
  ctx.strokeRect(6, 6, W - 12, H - 12)

  ctx.fillStyle = '#ffffff'
  ctx.font = `700 54px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(nombre).slice(0, 14), W / 2, 62)

  ctx.font = `600 26px ${FONT}`
  ctx.fillStyle = '#ffd98a'
  ctx.fillText('bot · demo local', W / 2, 116)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/** Visita el museo dando vueltas de forma autónoma, sin salirse del recinto. */
function Visitor({ data, index }) {
  const root = useRef(null)
  const head = useRef(null)
  const legL = useRef(null)
  const legR = useRef(null)

  const plate = useMemo(() => makeBotPlate(data.nombre, data.color), [data.nombre, data.color])
  useEffect(() => () => plate.dispose(), [plate])

  // Estado propio del bot (fuera de React).
  const bot = useRef({
    x: Math.sin(index * 2.1 + 0.7) * 5.5,
    z: Math.cos(index * 2.1 + 0.7) * 5.5,
    yaw: index,
    tx: 0,
    tz: 0,
    timer: 0,
    phase: index * 1.7,
  })

  useEffect(() => {
    const b = bot.current
    b.tx = b.x + (Math.random() - 0.5) * 6
    b.tz = b.z + (Math.random() - 0.5) * 6
    b.timer = 3 + Math.random() * 3
  }, [])

  // Registro para que el rayo de interacción pueda hablar con ellos.
  useEffect(() => {
    const mesh = head.current
    if (!mesh) return
    mesh.userData.interact = {
      id: data.id,
      kind: 'npc',
      title: `${data.nombre} (bot demo)`,
      line: data.line,
    }
    NPC_REGISTRY.set(data.id, mesh)
    return () => {
      NPC_REGISTRY.delete(data.id)
    }
  }, [data.id, data.nombre, data.line])

  useFrame((_, delta) => {
    const g = root.current
    if (!g) return
    const b = bot.current
    const d = Math.min(delta, 0.05)

    b.timer -= d
    const dist = Math.hypot(b.tx - b.x, b.tz - b.z)
    if (b.timer <= 0 || dist < 0.6) {
      b.timer = 3.5 + Math.random() * 4
      const a = Math.random() * Math.PI * 2
      const r = 3 + Math.random() * 5
      b.tx = Math.max(-9, Math.min(9, b.x + Math.cos(a) * r))
      b.tz = Math.max(-9, Math.min(9, b.z + Math.sin(a) * r))
    }

    let vx = 0
    let vz = 0
    if (dist > 0.05) {
      vx = ((b.tx - b.x) / dist) * data.velocidad
      vz = ((b.tz - b.z) / dist) * data.velocidad
    }

    const [nx, nz] = resolveColliders(b.x + vx * d, b.z + vz * d, RADIUS, MUSEUM_COLLIDERS, WALK_BOUND)
    b.x = nx
    b.z = nz

    if (vx || vz) {
      const objetivo = Math.atan2(-vx, -vz)
      let diff = objetivo - b.yaw
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      b.yaw += diff * (1 - Math.exp(-6 * d))
    }

    const andando = Math.hypot(vx, vz) > 0.05 ? 1 : 0
    b.phase += d * (3 + andando * 3)
    const swing = Math.sin(b.phase) * 0.5 * andando

    g.position.set(b.x, 0, b.z)
    g.rotation.y = b.yaw
    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing
  })

  return (
    <group ref={root}>
      {/* Piernas */}
      <group ref={legL} position={[-0.1, 0.6, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.32, 4, 8]} />
          <meshStandardMaterial color="#2b3550" roughness={0.9} />
        </mesh>
      </group>
      <group ref={legR} position={[0.1, 0.6, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.32, 4, 8]} />
          <meshStandardMaterial color="#2b3550" roughness={0.9} />
        </mesh>
      </group>

      {/* Torso */}
      <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.19, 0.4, 6, 14]} />
        <meshStandardMaterial color={data.color} roughness={0.65} />
      </mesh>
      {/* Cabeza (nodo interactivo) */}
      <mesh ref={head} position={[0, 1.52, 0]} castShadow>
        <sphereGeometry args={[0.19, 20, 16]} />
        <meshStandardMaterial color="#e9c6a4" roughness={0.8} />
      </mesh>
      {[-0.065, 0.065].map((x) => (
        <mesh key={x} position={[x, 1.55, -0.18]}>
          <circleGeometry args={[0.028, 14]} />
          <meshBasicMaterial color="#1b2131" />
        </mesh>
      ))}
      <sprite position={[0, 2.2, 0]} scale={[1.3, 0.4, 1]}>
        <spriteMaterial map={plate} transparent depthTest={false} toneMapped={false} />
      </sprite>
    </group>
  )
}

/**
 * Conjunto de visitantes simulados. Publica el número en el store para que el
 * HUD pueda mostrar "Modo demostración local · N bots".
 */
export function Visitors() {
  const mode = useStore((s) => s.mode)
  const setVisitorCount = useStore((s) => s.setVisitorCount)

  useEffect(() => {
    setVisitorCount(DEMO_VISITORS.length)
    return () => setVisitorCount(0)
  }, [setVisitorCount])

  if (mode !== 'museum') return null

  return (
    <>
      {DEMO_VISITORS.map((v, i) => (
        <Visitor key={v.id} data={v} index={i} />
      ))}
    </>
  )
}
