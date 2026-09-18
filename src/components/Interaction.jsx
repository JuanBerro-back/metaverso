import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { REGISTRY } from '../museum/registry.js'
import { EXHIBIT_MAP, EXHIBITS } from '../museum/exhibits.js'
import { useStore } from '../store.js'

const MAX_DISTANCE = 9
const WHITE = new THREE.Color('#ffffff')

const ACCENT = {}
for (const e of EXHIBITS) ACCENT[e.id] = new THREE.Color(e.accent)

export function Interaction() {
  const { camera } = useThree()
  const raycaster = useRef(new THREE.Raycaster()).current
  const hoverId = useRef(null)

  const setTarget = useStore((s) => s.setTarget)
  const setViewing = useStore((s) => s.setViewing)

  useFrame((_, delta) => {
    const meshes = [...REGISTRY.values()]
    if (meshes.length) {
      raycaster.setFromCamera({ x: 0, y: 0 }, camera)
      const hits = raycaster.intersectObjects(meshes, false)
      let id = null
      for (const hit of hits) {
        if (hit.distance <= MAX_DISTANCE) {
          id = hit.object.userData.id || null
          break
        }
      }

      if (hoverId.current !== id) {
        hoverId.current = id
        setTarget(id ? { id, title: EXHIBIT_MAP[id]?.title } : null)
      }

      for (const [exId, mesh] of REGISTRY) {
        const material = mesh.material
        const base = id === exId ? ACCENT[exId] : WHITE
        material.color.r = THREE.MathUtils.damp(material.color.r, base.r, 10, delta)
        material.color.g = THREE.MathUtils.damp(material.color.g, base.g, 10, delta)
        material.color.b = THREE.MathUtils.damp(material.color.b, base.b, 10, delta)
      }
    }
  })

  useEffect(() => {
    const onClick = (e) => {
      if (e.button !== 0) return
      if (!document.pointerLockElement) return
      const id = hoverId.current
      if (!id) return
      const { viewing } = useStore.getState()
      setViewing(viewing === id ? null : id)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [setViewing])

  return null
}