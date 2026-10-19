import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { makeStationSign, makeStationSheet } from '../museum/poster.js'
import { STATIONS } from '../museum/stations.js'
import { stationSpot } from '../museum/config.js'
import { STATION_REGISTRY } from '../museum/registry.js'

/** Material de ficha reutilizable (DoubleSide para no perderlo de vista). */
function makeSheetMaterial(station) {
  const texture = makeStationSheet(station)
  return new THREE.MeshBasicMaterial({
    map: texture,
    toneMapped: false,
    side: THREE.DoubleSide,
  })
}

function Station({ station, index }) {
  const spot = useMemo(() => stationSpot(index), [index])
  const sheetMaterial = useMemo(() => makeSheetMaterial(station), [station])
  const signTexture = useMemo(
    () => makeStationSign({ num: station.num, title: station.title, subtitle: station.subtitle, accent: station.accent }),
    [station]
  )

  const screenRef = useRef(null)
  const signRef = useRef(null)

  // Registro para el raycast de interacción (sin re-renderizar).
  useLayoutEffect(() => {
    const key = `station:${station.id}`
    const meshes = [screenRef.current, signRef.current].filter(Boolean)
    for (const mesh of meshes) {
      mesh.userData.interact = {
        id: station.id,
        kind: 'station',
        title: station.title,
        accent: station.accent,
      }
      STATION_REGISTRY.set(`${key}:${mesh.uuid}`, mesh)
    }
    return () => {
      for (const mesh of meshes) STATION_REGISTRY.delete(`${key}:${mesh.uuid}`)
    }
  }, [station.id, station.title])

  return (
    <group position={[spot.x, 0, spot.z]} rotation={[0, spot.rotationY, 0]}>
      {/* Zócalo */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.3, 0.32, 1.5]} />
        <meshStandardMaterial color="#2b3143" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.26, 1.3]} />
        <meshStandardMaterial color="#3a4157" roughness={0.55} metalness={0.25} />
      </mesh>

      {/* Columna trasera */}
      <mesh position={[0, 1.05, -0.35]} castShadow>
        <boxGeometry args={[0.32, 1.6, 0.32]} />
        <meshStandardMaterial color="#242a3a" roughness={0.7} />
      </mesh>

      {/* Pantalla inclinada con la ficha del módulo */}
      <group position={[0, 1.08, 0.12]} rotation={[-0.28, 0, 0]}>
        <mesh position={[0, 0, -0.06]} castShadow receiveShadow>
          <boxGeometry args={[2.75, 1.72, 0.1]} />
          <meshStandardMaterial color="#12161f" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.01]} castShadow receiveShadow>
          <boxGeometry args={[2.95, 1.9, 0.05]} />
          <meshStandardMaterial
            color={station.accent}
            emissive={station.accent}
            emissiveIntensity={0.35}
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
        <mesh ref={screenRef} position={[0, 0, 0.05]} material={sheetMaterial}>
          <planeGeometry args={[2.6, 1.6]} />
        </mesh>
      </group>

      {/* Cartel 3D del módulo */}
      <group position={[0, 2.72, -0.1]}>
        <mesh position={[0, 0, -0.08]} castShadow>
          <boxGeometry args={[3.2, 0.9, 0.14]} />
          <meshStandardMaterial color="#10141f" roughness={0.7} />
        </mesh>
        <mesh ref={signRef} position={[0, 0, 0.01]}>
          <planeGeometry args={[3.05, 0.76]} />
          <meshBasicMaterial map={signTexture} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Aro de acento en el suelo: marca dónde colocarse */}
      <mesh position={[0, 0.014, 2.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.78, 40]} />
        <meshBasicMaterial color={station.accent} transparent opacity={0.55} depthWrite={false} />
      </mesh>

      {/* Iluminación de acento */}
      <pointLight position={[0, 2.0, 1.2]} intensity={14} distance={8} decay={2} color={station.accent} />
    </group>
  )
}

export function Stations() {
  return (
    <>
      {STATIONS.map((station, i) => (
        <Station key={station.id} station={station} index={i} />
      ))}
    </>
  )
}
