import { useMemo } from 'react'
import * as THREE from 'three'
import { makeFloorTexture, makeBanner } from '../museum/poster.js'
import { HALL_HALF, WALL_H } from '../museum/config.js'

const FULL = HALL_HALF * 2

function Wall({ position, rotation, size }) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#232839" roughness={0.95} />
    </mesh>
  )
}

function Column({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, WALL_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, WALL_H, 1.1]} />
        <meshStandardMaterial color="#2e3446" roughness={0.8} />
      </mesh>
      <mesh position={[0, WALL_H - 0.15, 0]} castShadow>
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <meshStandardMaterial color="#3a4157" roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  )
}

function Bench({ position, rotation }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} castShadow>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.08, 0.55]} />
        <meshStandardMaterial color="#3d2f22" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.7, -0.22]} castShadow>
        <boxGeometry args={[2.1, 0.5, 0.08]} />
        <meshStandardMaterial color="#3d2f22" roughness={0.8} />
      </mesh>
      <mesh position={[-0.9, 0.2, -0.2]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.5]} />
        <meshStandardMaterial color="#2a2118" roughness={0.8} />
      </mesh>
      <mesh position={[0.9, 0.2, -0.2]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.5]} />
        <meshStandardMaterial color="#2a2118" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Banner() {
  const texture = useMemo(() => makeBanner(), [])
  return (
    <group>
      <mesh position={[0, 3, -HALL_HALF + 0.15]} castShadow>
        <boxGeometry args={[15, 6.6, 0.2]} />
        <meshStandardMaterial color="#0d1220" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3, -HALL_HALF + 0.3]}>
        <planeGeometry args={[14.4, 6]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function Museum() {
  const floorTexture = useMemo(() => {
    const t = makeFloorTexture()
    t.repeat.set(6, 6)
    t.anisotropy = 4
    return t
  }, [])

  return (
    <group>
      {/* Suelo */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[FULL + 1, FULL + 1]} />
        <meshStandardMaterial map={floorTexture} roughness={0.9} roughnessMap={null} />
      </mesh>

      {/* Paredes */}
      <Wall position={[0, WALL_H / 2, -HALL_HALF]} rotation={[0, 0, 0]} size={[FULL + 0.6, WALL_H, 0.4]} />
      <Wall position={[0, WALL_H / 2, HALL_HALF]} rotation={[0, 0, 0]} size={[FULL + 0.6, WALL_H, 0.4]} />
      <Wall position={[-HALL_HALF, WALL_H / 2, 0]} rotation={[0, Math.PI / 2, 0]} size={[FULL + 0.6, WALL_H, 0.4]} />
      <Wall position={[HALL_HALF, WALL_H / 2, 0]} rotation={[0, Math.PI / 2, 0]} size={[FULL + 0.6, WALL_H, 0.4]} />

      {/* Cornisas muy bajas para dar escala */}
      {[[0, -HALL_HALF + 0.02], [0, HALL_HALF - 0.02], [-HALL_HALF + 0.02, 0], [HALL_HALF - 0.02, 0]].map(
        ([x, z], i) => (
          <mesh key={i} position={[x, 0.32, z]} receiveShadow>
            <boxGeometry args={i < 2 ? [FULL + 0.4, 0.55, 0.18] : [0.18, 0.55, FULL + 0.4]} />
            <meshStandardMaterial color="#3a4157" roughness={0.6} />
          </mesh>
        )
      )}

      {/* Columnas en las esquinas */}
      <Column position={[11.8, 0, 11.8]} />
      <Column position={[-11.8, 0, 11.8]} />
      <Column position={[11.8, 0, -11.8]} />
      <Column position={[-11.8, 0, -11.8]} />

      {/* Bancos para leer las obras */}
      <Bench position={[4.2, 0, -1.4]} rotation={0} />
      <Bench position={[-4.2, 0, 1.0]} rotation={Math.PI / 2} />

      {/* Techo con lucernarios */}
      <mesh position={[0, WALL_H, 0]} receiveShadow>
        <boxGeometry args={[FULL + 0.6, 0.35, FULL + 0.6]} />
        <meshStandardMaterial color="#1a1f2e" roughness={1} />
      </mesh>
      {[-6, -2, 2, 6].map((x) => (
        <mesh key={x} position={[x, WALL_H - 0.1, 0]}>
          <planeGeometry args={[1.1, 9.5]} />
          <meshBasicMaterial color="#ffe9c4" />
        </mesh>
      ))}

      {/* Banner de bienvenida */}
      <Banner />

      {/* Puerta de entrada */}
      <group position={[0, 0, HALL_HALF - 0.01]}>
        <mesh position={[0, 2.2, -0.08]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 4.4, 0.18]} />
          <meshStandardMaterial color="#151a28" roughness={0.8} />
        </mesh>
        <mesh position={[0, 4.6, 0]}>
          <boxGeometry args={[4, 0.5, 0.3]} />
          <meshStandardMaterial color="#3a4157" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[-1.3, 2.2, 0.05]}>
          <planeGeometry args={[1.2, 3.4]} />
          <meshBasicMaterial color="#0f2438" toneMapped={false} />
        </mesh>
        <mesh position={[1.3, 2.2, 0.05]}>
          <planeGeometry args={[1.2, 3.4]} />
          <meshBasicMaterial color="#0f2438" toneMapped={false} />
        </mesh>
      </group>

      {/* Luces */}
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#9db8ff', '#1c1a24', 0.35]} />
      <directionalLight
        position={[-9, 18, 12]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0002}
      />
      <pointLight position={[0, 5.4, 0]} intensity={55} distance={26} decay={2} color="#fff1d6" />
      {[
        [8, 5.2, 6],
        [-8, 5.2, 6],
        [8, 5.2, -6],
        [-8, 5.2, -6],
      ].map(([x, y, z], i) => (
        <pointLight key={i} position={[x, y, z]} intensity={26} distance={22} decay={2} color="#ffffff" />
      ))}
    </group>
  )
}