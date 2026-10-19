import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { playerState } from '../player/state.js'
import { useStore } from '../store.js'

const FONT = 'system-ui, "Segoe UI", Arial, sans-serif'

/** Cartelito con el nombre del visitante (se dibuja en un canvas, sin assets). */
function makeNameplate(nickname) {
  const W = 512
  const H = 128
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(10,14,23,0.82)'
  ctx.beginPath()
  const r = 26
  ctx.moveTo(r, 8)
  ctx.arcTo(W - 8, 8, W - 8, H - 8, r)
  ctx.arcTo(W - 8, H - 8, 8, H - 8, r)
  ctx.arcTo(8, H - 8, 8, 8, r)
  ctx.arcTo(8, 8, W - 8, 8, r)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(90,169,255,0.75)'
  ctx.lineWidth = 5
  ctx.stroke()

  const nombre = String(nickname || 'Visitante').slice(0, 18)
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 56px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(nombre, W / 2, H / 2 + 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

/**
 * Avatar del jugador: cápsula low-poly con carita kawaii (para no romper la
 * estética de Xuppy), brazos y piernas animados al caminar y cartel con el
 * nombre elegido en la pantalla de inicio.
 */
export function Avatar() {
  const nickname = useStore((s) => s.nickname)
  const cameraMode = useStore((s) => s.cameraMode)
  const xrActive = useStore((s) => s.xrActive)

  const root = useRef(null)
  const body = useRef(null)
  const legL = useRef(null)
  const legR = useRef(null)
  const armL = useRef(null)
  const armR = useRef(null)
  const phase = useRef(0)

  const nombre = useMemo(
    () => (cameraMode === 'third' && !xrActive ? makeNameplate(nickname) : null),
    [nickname, cameraMode, xrActive]
  )
  useEffect(() => () => nombre?.dispose(), [nombre])

  // En primera persona (por defecto) y en VR no se dibuja el avatar del jugador.
  const visible = cameraMode === 'third' && !xrActive

  useFrame((_, delta) => {
    const g = root.current
    if (!g) return

    g.position.set(playerState.x, playerState.y, playerState.z)
    g.rotation.y = playerState.yaw
    if (g.visible !== visible) g.visible = visible

    // Animación de caminar: incremento del ciclo proporcional a la velocidad.
    const vel = playerState.speed
    phase.current += delta * (3.2 + vel * 1.5) * Math.min(1, vel / 2.4 + (playerState.moving ? 0.25 : 0))
    const amp = Math.min(0.85, vel * 0.24)
    const swing = Math.sin(phase.current * 3.4) * amp
    const bob = Math.abs(Math.sin(phase.current * 3.4)) * amp * 0.09

    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing
    if (armL.current) armL.current.rotation.x = -swing * 0.85
    if (armR.current) armR.current.rotation.x = swing * 0.85
    if (body.current) {
      body.current.position.y = bob
      body.current.rotation.z = Math.sin(phase.current * 3.4) * amp * 0.05
    }
  })

  // Sin avatar en primera persona: se ahorra geometría y el cartel del nombre.
  if (!visible) return null

  return (
    <group ref={root} position={[playerState.x, 0, playerState.z]} visible={visible}>
      {/* Piernas */}
      <group ref={legL} position={[-0.11, 0.62, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.34, 4, 10]} />
          <meshStandardMaterial color="#2b3550" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.6, 0.06]} castShadow>
          <boxGeometry args={[0.13, 0.09, 0.24]} />
          <meshStandardMaterial color="#1b2131" roughness={0.9} />
        </mesh>
      </group>
      <group ref={legR} position={[0.11, 0.62, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.34, 4, 10]} />
          <meshStandardMaterial color="#2b3550" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.6, 0.06]} castShadow>
          <boxGeometry args={[0.13, 0.09, 0.24]} />
          <meshStandardMaterial color="#1b2131" roughness={0.9} />
        </mesh>
      </group>

      {/* Torso y cabeza */}
      <group ref={body} position={[0, 0, 0]}>
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.2, 0.42, 6, 16]} />
          <meshStandardMaterial color="#3f7ddb" roughness={0.6} metalness={0.15} />
        </mesh>
        {/* Cinta/banda Xupply */}
        <mesh position={[0, 0.86, 0]}>
          <cylinderGeometry args={[0.211, 0.211, 0.07, 18]} />
          <meshStandardMaterial color="#3ee6a0" emissive="#3ee6a0" emissiveIntensity={0.35} roughness={0.5} />
        </mesh>
        {/* Mochila logística */}
        <mesh position={[0, 1.02, -0.19]} castShadow>
          <boxGeometry args={[0.26, 0.34, 0.14]} />
          <meshStandardMaterial color="#243043" roughness={0.8} />
        </mesh>

        {/* Cabeza */}
        <mesh position={[0, 1.52, 0]} castShadow>
          <sphereGeometry args={[0.2, 24, 18]} />
          <meshStandardMaterial color="#f3c9a5" roughness={0.75} />
        </mesh>
        {/* Gorra/antena kawaii, guiño al gato-ovni */}
        <mesh position={[0, 1.72, 0]} castShadow>
          <sphereGeometry args={[0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1f2a3d" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.99, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
          <meshStandardMaterial color="#2a2e38" roughness={0.5} metalness={0.6} />
        </mesh>
        <mesh position={[0, 2.08, 0]}>
          <sphereGeometry args={[0.035, 14, 14]} />
          <meshStandardMaterial color="#3ee6a0" emissive="#3ee6a0" emissiveIntensity={1.8} />
        </mesh>

        {/* Carita kawaii (mira hacia -Z, igual que la orientación del avatar) */}
        {[-0.07, 0.07].map((x) => (
          <mesh key={x} position={[x, 1.55, -0.19]}>
            <circleGeometry args={[0.032, 18]} />
            <meshBasicMaterial color="#1b2131" />
          </mesh>
        ))}
        {[-0.082, 0.058].map((x) => (
          <mesh key={x} position={[x, 1.562, -0.205]}>
            <circleGeometry args={[0.011, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
        <mesh position={[0, 1.47, -0.195]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.03, 0.009, 8, 16, Math.PI]} />
          <meshBasicMaterial color="#8a5230" />
        </mesh>
        {[-0.15, 0.15].map((x) => (
          <mesh key={`c${x}`} position={[x, 1.5, -0.17]}>
            <circleGeometry args={[0.028, 14]} />
            <meshBasicMaterial color="#ff9cb0" transparent opacity={0.7} />
          </mesh>
        ))}

        {/* Brazos */}
        <group ref={armL} position={[-0.25, 1.16, 0]} rotation={[0, 0, 0.12]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.3, 4, 10]} />
            <meshStandardMaterial color="#3f7ddb" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.37, 0]} castShadow>
            <sphereGeometry args={[0.072, 12, 12]} />
            <meshStandardMaterial color="#f3c9a5" roughness={0.8} />
          </mesh>
        </group>
        <group ref={armR} position={[0.25, 1.16, 0]} rotation={[0, 0, -0.12]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.3, 4, 10]} />
            <meshStandardMaterial color="#3f7ddb" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.37, 0]} castShadow>
            <sphereGeometry args={[0.072, 12, 12]} />
            <meshStandardMaterial color="#f3c9a5" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Cartel con el nombre del visitante */}
      <sprite position={[0, 2.48, 0]} scale={[1.1, 0.275, 1]}>
        <spriteMaterial map={nombre} transparent depthTest={false} toneMapped={false} />
      </sprite>
    </group>
  )
}
