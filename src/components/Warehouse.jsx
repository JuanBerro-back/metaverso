import { useMemo } from 'react'
import { makeForestFloor } from '../game/textures.js'

const FULL = 26
const HALF = 13

function Conifer({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 3.0, 7]} />
        <meshStandardMaterial color="#5b4128" roughness={0.95} />
      </mesh>
      <mesh position={[0, 3.6, 0]} castShadow>
        <coneGeometry args={[1.5, 3.4, 8]} />
        <meshStandardMaterial color="#2c5d2f" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <coneGeometry args={[1.15, 2.4, 8]} />
        <meshStandardMaterial color="#33682f" roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

function Foliage({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.45, 8, 6]} />
        <meshStandardMaterial color="#2f5f2e" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0.32, 0.25, 0.1]} castShadow>
        <sphereGeometry args={[0.3, 7, 6]} />
        <meshStandardMaterial color="#3a6f33" roughness={0.95} flatShading />
      </mesh>
    </group>
  )
}

function Rock({ position, scale = 1 }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <icosahedronGeometry args={[0.32, 0]} />
      <meshStandardMaterial color="#6b6d63" roughness={0.95} flatShading />
    </mesh>
  )
}

function Mushroom({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.14, 7]} />
        <meshStandardMaterial color="#e8dfc8" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.14, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c94f3d" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function Warehouse() {
  const floorTexture = useMemo(() => {
    const t = makeForestFloor()
    t.repeat.set(4, 4)
    t.anisotropy = 4
    return t
  }, [])

  return (
    <group>
      {/* Suelo de prado con sendero de tierra */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[FULL + 1, FULL + 1]} />
        <meshStandardMaterial map={floorTexture} roughness={0.95} />
      </mesh>

      {/* Límite del bosque (muros oscuros frondosos) */}
      <mesh position={[0, 3, -HALF]} receiveShadow>
        <boxGeometry args={[FULL + 0.8, 6, 0.4]} />
        <meshStandardMaterial color="#132015" roughness={1} />
      </mesh>
      <mesh position={[0, 3, HALF]} receiveShadow>
        <boxGeometry args={[FULL + 0.8, 6, 0.4]} />
        <meshStandardMaterial color="#132015" roughness={1} />
      </mesh>
      <mesh position={[-HALF, 3, 0]} receiveShadow>
        <boxGeometry args={[0.4, 6, FULL + 0.8]} />
        <meshStandardMaterial color="#132015" roughness={1} />
      </mesh>
      <mesh position={[HALF, 3, 0]} receiveShadow>
        <boxGeometry args={[0.4, 6, FULL + 0.8]} />
        <meshStandardMaterial color="#132015" roughness={1} />
      </mesh>

      {/* Cúpula vegetal (techo) */}
      <mesh position={[0, 6, 0]} receiveShadow>
        <boxGeometry args={[FULL, 0.3, FULL]} />
        <meshStandardMaterial color="#0f1c12" roughness={1} />
      </mesh>

      {/* Coníferas en las esquinas (utilizan los colisionadores existentes) */}
      <Conifer position={[11.6, 0, 11.6]} scale={1.5} />
      <Conifer position={[-11.6, 0, 11.6]} scale={1.5} />
      <Conifer position={[11.6, 0, -11.6]} scale={1.5} />
      <Conifer position={[-11.6, 0, -11.6]} scale={1.5} />

      {/* Vegetación decorativa junto a los límites */}
      <Foliage position={[11.2, 0, 5.5]} />
      <Foliage position={[-11.2, 0, 5.5]} />
      <Foliage position={[11.2, 0, -5.5]} />
      <Foliage position={[-11.2, 0, -5.5]} />
      <Foliage position={[5.5, 0, 11.4]} />
      <Foliage position={[-5.5, 0, 11.4]} />

      <Rock position={[11.0, 0, 9.0]} scale={1.2} />
      <Rock position={[-11.0, 0, 9.0]} scale={0.9} />
      <Rock position={[11.4, 0, -9.2]} scale={1.0} />
      <Rock position={[-11.4, 0, -9.2]} scale={1.4} />

      <Mushroom position={[10.6, 0, 10.6]} />
      <Mushroom position={[-10.6, 0, 10.6]} />
      <Mushroom position={[10.8, 0, -10.6]} />
      <Mushroom position={[-10.8, 0, -10.6]} />

      {/* Cartel de madera */}
      <group position={[0, 2.4, -HALF + 0.05]}>
        <mesh position={[0, 0.02, -0.1]} castShadow>
          <boxGeometry args={[9, 1.6, 0.14]} />
          <meshStandardMaterial color="#4a3523" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[7.2, 1.0, 0.04]} />
          <meshStandardMaterial color="#5c4328" roughness={0.9} />
        </mesh>
      </group>

      {/* Iluminación de claro de bosque */}
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#a9ddae', '#1c2b1e', 0.65]} />
      <directionalLight
        position={[-10, 18, 8]}
        intensity={0.85}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0002}
      />
      {[
        [7, 4.6, 4],
        [-7, 4.6, 4],
        [7, 4.6, -4],
        [-7, 4.6, -4],
      ].map(([x, y, z], i) => (
        <pointLight key={i} position={[x, y, z]} intensity={18} distance={18} decay={2} color="#d9f2cf" />
      ))}
    </group>
  )
}