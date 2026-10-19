import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { makePoster, makeStationSheet, makeHelpSheet } from '../museum/poster.js'
import { STATION_MAP } from '../museum/stations.js'
import { EXHIBIT_MAP } from '../museum/exhibits.js'
import { useStore } from '../store.js'

const DISTANCIA = 2.2
const ALTURA = 1.55

const _head = new THREE.Vector3()
const _forward = new THREE.Vector3()

/**
 * Pizarra 3D que sí se ve dentro de VR.
 *
 * Los paneles HTML (ficha de la estación, carteles del museo) no existen en el
 * espacio inmersivo, así que la información se pinta en un lienzo y se coloca
 * flotando delante del visitante, mirándole siempre de frente. También sirve
 * para mostrar (`kind: 'help'`) los controles de VR al entrar en la sesión.
 */
export function XRInfoBoard() {
  const xrActive = useStore((s) => s.xrActive)
  const xrBoard = useStore((s) => s.xrBoard)
  const { camera } = useThree()

  const boardRef = useRef(null)

  const texture = useMemo(() => {
    if (!xrBoard) return null
    try {
      if (xrBoard.kind === 'help') return makeHelpSheet()
      if (xrBoard.kind === 'station') {
        const estacion = STATION_MAP[xrBoard.id]
        return estacion ? makeStationSheet(estacion) : null
      }
      const cartel = EXHIBIT_MAP[xrBoard.id]
      return cartel ? makePoster(cartel) : null
    } catch (err) {
      console.warn('[Xupply][XR] no se pudo pintar la pizarra:', err)
      return null
    }
  }, [xrBoard])

  useEffect(() => () => texture?.dispose(), [texture])

  useFrame(() => {
    const board = boardRef.current
    if (!board) return

    camera.getWorldPosition(_head)
    // Dirección horizontal de la mirada.
    _forward.set(0, 0, -1).applyQuaternion(camera.getWorldQuaternion(new THREE.Quaternion()))
    _forward.y = 0
    if (_forward.lengthSq() < 1e-6) _forward.set(0, 0, -1)
    _forward.normalize()

    board.position.set(_head.x + _forward.x * DISTANCIA, ALTURA, _head.z + _forward.z * DISTANCIA)
    // `lookAt` deja el +Z mirando en sentido contrario, así que giramos 180°
    // para que el texto quede legible desde el visor.
    board.lookAt(_head.x, ALTURA, _head.z)
    board.rotateY(Math.PI)
  })

  if (!xrActive || !texture) return null

  return (
    <group ref={boardRef}>
      <mesh>
        <planeGeometry args={[2.4, 1.8]} />
        <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Marco */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[2.52, 1.92]} />
        <meshBasicMaterial color="#0b1020" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
