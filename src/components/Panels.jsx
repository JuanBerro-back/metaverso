import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { makePoster } from '../museum/poster.js'
import { EXHIBITS } from '../museum/exhibits.js'
import { panelSpot } from '../museum/config.js'
import { REGISTRY } from '../museum/registry.js'

function usePosterMaterial(exhibit) {
  const texture = useMemo(() => makePoster(exhibit), [exhibit])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        toneMapped: false,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1
      }),
    [texture]
  )
  return material
}

function Poster({ exhibit, spot }) {
  const material = usePosterMaterial(exhibit)
  const planeRef = useRef(null)
  const meshRef = useRef(null)

  useLayoutEffect(() => {
    if (planeRef.current) {
      planeRef.current.userData.id = exhibit.id
      planeRef.current.userData.title = exhibit.title
      REGISTRY.set(exhibit.id, planeRef.current)
    }
    return () => {
      REGISTRY.delete(exhibit.id)
    }
  }, [exhibit.id])

  return (
    <group position={[spot.x, 0, spot.z]} rotation={[0, spot.rotationY, 0]}>
      {/* Peana */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.9, 0.85]} />
        <meshStandardMaterial color="#33394a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[1.75, 0.1, 1.1]} />
        <meshStandardMaterial color="#454c61" roughness={0.4} metalness={0.25} />
      </mesh>

      {/* Marco */}
      <mesh ref={meshRef} position={[0, 2.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.1, 2.35, 0.16]} />
        <meshStandardMaterial color="#1d2231" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.35, 0.085]} receiveShadow>
        <boxGeometry args={[3.35, 2.6, 0.06]} />
        <meshStandardMaterial color="#0e1119" roughness={0.4} metalness={0.35} />
      </mesh>

      {/* Póster — separado del marco para evitar z-fighting */}
      <mesh ref={planeRef} position={[0, 2.35, 0.15]} material={material}>
        <planeGeometry args={[2.95, 2.2]} />
      </mesh>
    </group>
  )
}

export function Panels() {
  return (
    <>
      {EXHIBITS.map((exhibit, i) => (
        <Poster key={exhibit.id} exhibit={exhibit} spot={panelSpot(i)} />
      ))}
    </>
  )
}