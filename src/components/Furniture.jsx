function Leg({ position }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.09, 0.74, 0.09]} />
      <meshStandardMaterial color="#5d4129" roughness={0.7} />
    </mesh>
  )
}

function Chair({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.37, 0]} castShadow>
        <boxGeometry args={[0.48, 0.07, 0.48]} />
        <meshStandardMaterial color="#3f5b3f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.72, -0.22]} castShadow>
        <boxGeometry args={[0.48, 0.66, 0.06]} />
        <meshStandardMaterial color="#3f5b3f" roughness={0.8} />
      </mesh>
      <Leg position={[-0.2, 0.18, 0.2]} />
      <Leg position={[0.2, 0.18, 0.2]} />
      <Leg position={[-0.2, 0.18, -0.2]} />
      <Leg position={[0.2, 0.18, -0.2]} />
    </group>
  )
}

function Book({ position, size, color }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  )
}

function Bookshelf({ position, width = 1.8, height = 2, depth = 0.35, books }) {
  const y = height / 2
  return (
    <group position={position}>
      {/* Laterales */}
      <mesh position={[-width / 2, y, 0]} castShadow>
        <boxGeometry args={[0.06, height, depth]} />
        <meshStandardMaterial color="#6b4a2a" roughness={0.8} />
      </mesh>
      <mesh position={[width / 2, y, 0]} castShadow>
        <boxGeometry args={[0.06, height, depth]} />
        <meshStandardMaterial color="#6b4a2a" roughness={0.8} />
      </mesh>
      {/* Estantes */}
      {[0.45, 0.95, 1.45].map((sy) => (
        <mesh key={sy} position={[0, sy, 0]} castShadow>
          <boxGeometry args={[width - 0.08, 0.06, depth - 0.02]} />
          <meshStandardMaterial color="#6b4a2a" roughness={0.8} />
        </mesh>
      ))}
      {/* Fondo */}
      <mesh position={[0, y, -depth / 2 + 0.03]}>
        <boxGeometry args={[width - 0.1, height - 0.05, 0.02]} />
        <meshStandardMaterial color="#52381f" roughness={0.9} />
      </mesh>
      {/* Libros */}
      {books.map((b, i) => (
        <Book key={i} position={b.position} size={b.size} color={b.color} />
      ))}
    </group>
  )
}

const CHAIR_SPOTS = [
  { position: [0, 0, 1.0], rotation: [0, Math.PI, 0] },
  { position: [0, 0, -2.2], rotation: [0, 0, 0] },
  { position: [1.85, 0, -0.6], rotation: [0, Math.PI / 2, 0] },
  { position: [-1.85, 0, -0.6], rotation: [0, -Math.PI / 2, 0] },
]

export function Furniture() {
  return (
    <group>
      {/* Mesa central */}
      <group position={[0, 0, -0.6]}>
        <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.1, 1.3]} />
          <meshStandardMaterial color="#8a5a32" roughness={0.7} />
        </mesh>
        <Leg position={[-1.16, 0.39, 0.5]} />
        <Leg position={[1.16, 0.39, 0.5]} />
        <Leg position={[-1.16, 0.39, -0.5]} />
        <Leg position={[1.16, 0.39, -0.5]} />
        {/* Vela decorativa */}
        <mesh position={[0.8, 0.86, -0.15]}>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
          <meshStandardMaterial color="#e9e2cf" emissive="#ffd27a" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0.8, 0.96, -0.15]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#ffb347" emissive="#ffab2e" emissiveIntensity={1.5} />
        </mesh>
        {/* Plato/fruta */}
        <mesh position={[-0.7, 0.84, 0.2]} castShadow>
          <cylinderGeometry args={[0.18, 0.14, 0.03, 24]} />
          <meshStandardMaterial color="#e8e4dc" />
        </mesh>
        <mesh position={[-0.7, 0.9, 0.2]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh position={[-0.62, 0.9, 0.15]} castShadow>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#f39c12" />
        </mesh>
      </group>

      {/* Sillas */}
      {CHAIR_SPOTS.map((c, i) => (
        <Chair key={i} position={c.position} rotation={c.rotation} />
      ))}

      {/* Estantería grande (pared oeste) */}
      <Bookshelf
        position={[-4.5, 0, -3.0]}
        books={[
          { position: [-0.7, 0.73, 0.02], size: [0.16, 0.45, 0.2], color: '#c0392b' },
          { position: [-0.48, 0.75, 0.02], size: [0.14, 0.5, 0.2], color: '#2980b9' },
          { position: [-0.28, 0.74, 0.02], size: [0.2, 0.48, 0.2], color: '#27ae60' },
          { position: [-0.02, 0.72, 0.02], size: [0.18, 0.44, 0.2], color: '#8e44ad' },
          { position: [0.22, 0.75, 0.02], size: [0.16, 0.5, 0.2], color: '#d35400' },
          { position: [-0.6, 1.23, 0.02], size: [0.22, 0.44, 0.2], color: '#16a085' },
          { position: [-0.3, 1.21, 0.02], size: [0.16, 0.42, 0.2], color: '#e67e22' },
          { position: [-0.05, 1.22, 0.02], size: [0.15, 0.44, 0.2], color: '#7f8c8d' },
          { position: [0.22, 1.2, 0.02], size: [0.18, 0.4, 0.2], color: '#2c3e50' },
          { position: [-0.55, 1.71, 0.02], size: [0.14, 0.38, 0.2], color: '#f1c40f' },
          { position: [-0.3, 1.72, 0.02], size: [0.2, 0.4, 0.2], color: '#3498db' },
        ]}
      />

      {/* Estantería pequeña (pared este) */}
      <Bookshelf
        position={[4.5, 0, 2.7]}
        width={1.4}
        height={1.6}
        books={[
          { position: [-0.42, 0.72, 0.02], size: [0.16, 0.42, 0.2], color: '#c0392b' },
          { position: [-0.18, 0.73, 0.02], size: [0.18, 0.45, 0.2], color: '#2980b9' },
          { position: [0.1, 0.71, 0.02], size: [0.14, 0.4, 0.2], color: '#27ae60' },
          { position: [-0.35, 1.21, 0.02], size: [0.2, 0.4, 0.2], color: '#8e44ad' },
          { position: [-0.05, 1.2, 0.02], size: [0.16, 0.38, 0.2], color: '#d35400' },
        ]}
      />

      {/* Sofá (pared oeste) */}
      <group position={[-3.9, 0, 1.7]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.35, 1.05]} />
          <meshStandardMaterial color="#5b3a52" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.66, -0.42]} castShadow>
          <boxGeometry args={[2.4, 0.7, 0.28]} />
          <meshStandardMaterial color="#5b3a52" roughness={0.9} />
        </mesh>
        <mesh position={[-1.02, 0.62, -0.02]} castShadow>
          <boxGeometry args={[0.28, 0.66, 1.05]} />
          <meshStandardMaterial color="#7a4f6f" roughness={0.9} />
        </mesh>
        <mesh position={[1.02, 0.62, -0.02]} castShadow>
          <boxGeometry args={[0.28, 0.66, 1.05]} />
          <meshStandardMaterial color="#7a4f6f" roughness={0.9} />
        </mesh>
        <mesh position={[-0.4, 0.42, 0.1]} castShadow>
          <boxGeometry args={[0.62, 0.12, 0.62]} />
          <meshStandardMaterial color="#8e6a83" roughness={0.95} />
        </mesh>
        <mesh position={[0.4, 0.42, 0.1]} castShadow>
          <boxGeometry args={[0.62, 0.12, 0.62]} />
          <meshStandardMaterial color="#8e6a83" roughness={0.95} />
        </mesh>
      </group>

      {/* Alfombra */}
      <mesh position={[-2.5, 0.012, 1.6]} receiveShadow>
        <cylinderGeometry args={[1.35, 1.35, 0.02, 32]} />
        <meshStandardMaterial color="#8c4444" roughness={1} />
      </mesh>

      {/* Escritorio con ordenador (pared norte) */}
      <group position={[2.3, 0, 4.2]}>
        <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.06, 0.7]} />
          <meshStandardMaterial color="#754f2c" roughness={0.7} />
        </mesh>
        <Leg position={[-0.7, 0.39, 0.27]} />
        <Leg position={[0.7, 0.39, 0.27]} />
        <Leg position={[-0.7, 0.39, -0.27]} />
        <Leg position={[0.7, 0.39, -0.27]} />
        {/* Portátil */}
        <group position={[0, 0.84, 0.05]} rotation={[Math.PI / 10, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.46, 0.025, 0.32]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
        <mesh position={[0, 0.95, 0.22]} rotation={[Math.PI / 2.4, 0, 0]} castShadow>
          <boxGeometry args={[0.46, 0.02, 0.3]} />
          <meshStandardMaterial color="#1f2430" />
        </mesh>
        {/* Silla de oficina */}
        <group position={[0, 0, 0.75]}>
          <mesh position={[0, 0.45, -0.1]} castShadow>
            <boxGeometry args={[0.46, 0.08, 0.46]} />
            <meshStandardMaterial color="#222a33" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.78, -0.24]} castShadow>
            <boxGeometry args={[0.46, 0.6, 0.08]} />
            <meshStandardMaterial color="#222a33" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.16, -0.05]}>
            <cylinderGeometry args={[0.03, 0.03, 0.32, 12]} />
            <meshStandardMaterial color="#444" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
        {/* Monitor/TV en la pared */}
        <mesh position={[0, 1.9, 0.36]} castShadow>
          <boxGeometry args={[1.1, 0.65, 0.05]} />
          <meshStandardMaterial color="#0d1117" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.9, 0.345]}>
          <planeGeometry args={[1.05, 0.6]} />
          <meshBasicMaterial color="#22344a" />
        </mesh>
      </group>

      {/* Lámpara de pie */}
      <group position={[3.3, 0, -2.9]}>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.3, 0.34, 0.06, 24]} />
          <meshStandardMaterial color="#4a3b2b" />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 2.2, 12]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 2.3, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.36, 0.32, 24, 1, true]} />
          <meshStandardMaterial
            color="#f3e2b8"
            emissive="#ffd9a0"
            emissiveIntensity={0.35}
            side={2}
            roughness={0.9}
          />
        </mesh>
      </group>

      {/* Planta 1 */}
      <group position={[4.2, 0, -3.9]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.15, 0.4, 20]} />
          <meshStandardMaterial color="#a5582e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <sphereGeometry args={[0.28, 20, 20]} />
          <meshStandardMaterial color="#2f6b3f" roughness={1} />
        </mesh>
        <mesh position={[0.22, 0.32, 0.05]} castShadow>
          <sphereGeometry args={[0.18, 20, 20]} />
          <meshStandardMaterial color="#3a7d4a" roughness={1} />
        </mesh>
        <mesh position={[-0.2, 0.35, -0.05]} castShadow>
          <sphereGeometry args={[0.2, 20, 20]} />
          <meshStandardMaterial color="#37804a" roughness={1} />
        </mesh>
      </group>

      {/* Planta 2 */}
      <group position={[-3.2, 0, -4.35]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.14, 0.36, 20]} />
          <meshStandardMaterial color="#a5582e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.25, 20, 20]} />
          <meshStandardMaterial color="#2f6b3f" roughness={1} />
        </mesh>
        <mesh position={[0.18, 0.3, 0.04]} castShadow>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color="#37914a" roughness={1} />
        </mesh>
      </group>

      {/* Balón de práctica */}
      <mesh position={[1.4, 0.18, -4.1]} castShadow>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#e67e22" roughness={0.6} />
      </mesh>

      {/* Holgada: pizarra práctica pared este */}
      <group position={[4.48, 1.8, -1.1]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[0.06, 1.15, 1.7]} />
          <meshStandardMaterial color="#5a5046" />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[1.6, 1.05]} />
          <meshStandardMaterial color="#274e3f" roughness={0.4} />
        </mesh>
        <mesh position={[-0.4, 0, 0.035]}>
          <planeGeometry args={[0.02, 0.5]} />
          <meshBasicMaterial color="#e9e2cf" />
        </mesh>
        <mesh position={[-0.14, 0, 0.035]} rotation={[0, 0, 0.5]}>
          <planeGeometry args={[0.45, 0.02]} />
          <meshBasicMaterial color="#e9e2cf" />
        </mesh>
        <mesh position={[0.25, 0, 0.035]}>
          <planeGeometry args={[0.35, 0.02]} />
          <meshBasicMaterial color="#e9e2cf" />
        </mesh>
      </group>
    </group>
  )
}