import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store.js'
import { makePortalTexture, makePortalLabel } from '../game/textures.js'

export function Portal({ position, to, label, hex = '#3ee6a0', radius = 1.4 }) {
  const swirlRef = useRef(null)
  const ringRef = useRef(null)
  const labelTex = useMemo(() => makePortalLabel(label || to, hex), [label, to, hex])
  const swirlTex = useMemo(() => makePortalTexture(hex), [hex])
  const cooldown = useRef(0)
  const here = to === 'game' ? 'museum' : 'game'

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (swirlRef.current) {
      swirlRef.current.rotation.z += delta * 0.9
      swirlRef.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.03)
      swirlRef.current.material.rotation -= delta * 0.7
    }
    if (ringRef.current) {
      const m = ringRef.current.material
      const target = 2.4 + Math.sin(t * 2.2) * 0.5
      m.emissiveIntensity = target
    }

    const st = useStore.getState()
    if (!document.pointerLockElement || st.gameOver) return
    if (st.mode !== here) return

    const cam = state.camera.position
    const dx = cam.x - position[0]
    const dz = cam.z - position[2]
    if (dx * dx + dz * dz < radius * radius && t - cooldown.current > 1.2) {
      cooldown.current = t
      if (to === 'game') {
        st.startGame()
      } else {
        st.setMode('museum')
      }
    }
  })

  return (
    <group position={position}>
      {/* Halo en el suelo */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.85, 32]} />
        <meshBasicMaterial color={hex} transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Remolino */}
      <mesh ref={swirlRef} position={[0, 1.25, 0]}>
        <planeGeometry args={[1.95, 1.95]} />
        <meshBasicMaterial
          map={swirlTex}
          transparent
          toneMapped={false}
          depthWrite={false}
          side={2}
        />
      </mesh>

      {/* Anillo exterior */}
      <mesh ref={ringRef} position={[0, 1.25, 0]}>
        <torusGeometry args={[1.05, 0.085, 12, 48]} />
        <meshStandardMaterial color={hex} emissive={hex} emissiveIntensity={2.2} roughness={0.3} />
      </mesh>

      {/* Rótulo */}
      <mesh position={[0, 2.55, 0]}>
        <planeGeometry args={[1.5, 0.375]} />
        <meshBasicMaterial map={labelTex} toneMapped={false} transparent side={2} />
      </mesh>

      <pointLight position={[0, 1.4, 0]} intensity={7} distance={5} decay={2} color={hex} />
    </group>
  )
}