export function Room() {
  return (
    <group>
      {/* Suelo de madera */}
      <mesh position={[0, -0.11, 0]} receiveShadow>
        <boxGeometry args={[10.4, 0.22, 10.4]} />
        <meshStandardMaterial color="#a97c50" roughness={0.9} />
      </mesh>

      {/* Techo */}
      <mesh position={[0, 3.15, 0]} receiveShadow>
        <boxGeometry args={[10.4, 0.3, 10.4]} />
        <meshStandardMaterial color="#ece7dc" roughness={0.95} />
      </mesh>

      {/* Paredes */}
      <mesh position={[0, 1.6, 5]} receiveShadow>
        <boxGeometry args={[10.4, 3.2, 0.2]} />
        <meshStandardMaterial color="#cfc4ae" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.6, -5]} receiveShadow>
        <boxGeometry args={[10.4, 3.2, 0.2]} />
        <meshStandardMaterial color="#cfc4ae" roughness={0.95} />
      </mesh>
      <mesh position={[5, 1.6, 0]} receiveShadow>
        <boxGeometry args={[0.2, 3.2, 10.4]} />
        <meshStandardMaterial color="#d6cbb6" roughness={0.95} />
      </mesh>
      <mesh position={[-5, 1.6, 0]} receiveShadow>
        <boxGeometry args={[0.2, 3.2, 10.4]} />
        <meshStandardMaterial color="#d6cbb6" roughness={0.95} />
      </mesh>

      {/* Rodapié */}
      {[[0, 5], [0, -5], [5, 0], [-5, 0]].map(([x, z], i) => {
        const horizontal = i < 2
        return (
          <mesh
            key={i}
            position={[x, 0.09, z]}
            receiveShadow
          >
            <boxGeometry args={horizontal ? [10.3, 0.18, 0.08] : [0.08, 0.18, 10.3]} />
            <meshStandardMaterial color="#8a6b48" roughness={0.8} />
          </mesh>
        )
      })}

      {/* Ventana (pared norte) */}
      <group position={[0, 0, 4.98]}>
        <mesh position={[0, 2.56, 0]}>
          <boxGeometry args={[2.7, 0.12, 0.12]} />
          <meshStandardMaterial color="#5a5046" />
        </mesh>
        <mesh position={[0, 1.12, 0]}>
          <boxGeometry args={[2.7, 0.12, 0.12]} />
          <meshStandardMaterial color="#5a5046" />
        </mesh>
        <mesh position={[-1.35, 1.84, 0]}>
          <boxGeometry args={[0.12, 1.44, 0.12]} />
          <meshStandardMaterial color="#5a5046" />
        </mesh>
        <mesh position={[1.35, 1.84, 0]}>
          <boxGeometry args={[0.12, 1.44, 0.12]} />
          <meshStandardMaterial color="#5a5046" />
        </mesh>
        <mesh position={[0, 1.84, -0.02]}>
          <planeGeometry args={[2.4, 1.4]} />
          <meshBasicMaterial color="#cfe9ff" />
        </mesh>
        <mesh position={[0, 1.84, 0]}>
          <boxGeometry args={[2.46, 0.08, 0.08]} />
          <meshStandardMaterial color="#6a5f54" />
        </mesh>
      </group>

      {/* Puerta (pared sur) */}
      <group position={[0, 0, -4.96]}>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.95, 2.1, 0.1]} />
          <meshStandardMaterial color="#7b5837" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.12, 0]}>
          <boxGeometry args={[1.15, 0.12, 0.14]} />
          <meshStandardMaterial color="#5a5046" />
        </mesh>
        <mesh position={[0.38, 1.05, 0.08]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#d8b56a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Paneles de luz en el techo */}
      <mesh position={[-3, 3.02, 2]}>
        <planeGeometry args={[1.3, 0.9]} />
        <meshBasicMaterial color="#fff6e0" />
      </mesh>
      <mesh position={[3, 3.02, -2]}>
        <planeGeometry args={[1.3, 0.9]} />
        <meshBasicMaterial color="#fff6e0" />
      </mesh>

      {/* Cuadro (pared oeste) */}
      <group position={[-4.48, 1.75, 1.6]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[0.05, 0.55, 0.45]} />
          <meshStandardMaterial color="#4a3b2b" />
        </mesh>
        <mesh position={[0, 0, 0.031]}>
          <planeGeometry args={[0.44, 0.34]} />
          <meshBasicMaterial color="#3f6d8c" />
        </mesh>
        <mesh position={[0, 0.14, 0.031]}>
          <planeGeometry args={[0.2, 0.12]} />
          <meshBasicMaterial color="#7f9c55" />
        </mesh>
      </group>

      {/* Reloj (pared oeste) */}
      <group position={[-4.48, 2.5, -0.9]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.24, 0.05, 32]} />
          <meshStandardMaterial color="#2f2a24" />
        </mesh>
        <mesh position={[0, 0, 0.031]}>
          <circleGeometry args={[0.2, 32]} />
          <meshBasicMaterial color="#f4efe4" />
        </mesh>
        <mesh position={[0, 0.09, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.03, 0.13, 0.01]} />
          <meshBasicMaterial color="#222" />
        </mesh>
        <mesh position={[0.06, 0.02, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.03, 0.1, 0.01]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      </group>
    </group>
  )
}