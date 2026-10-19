import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { REGISTRY, STATION_REGISTRY } from '../museum/registry.js'
import { EXHIBIT_MAP, EXHIBITS } from '../museum/exhibits.js'
import { useStore } from '../store.js'
import { touchInput } from '../player/input.js'

const MAX_DISTANCE = 9

/** Color de acento por cartel, para el resaltado. */
const ACCENT = {}
for (const e of EXHIBITS) ACCENT[`poster:${e.id}`] = new THREE.Color(e.accent || '#5aa9ff')

/** Materiales cuyo color base es blanco: se pueden teñir sin estropear la textura. */
const TINTABLES = new Set(['poster', 'station'])

function promptFor(info) {
  if (!info) return null
  if (info.kind === 'station') return `E · abrir la estación ${info.title}`
  if (info.kind === 'poster') return `E · leer el cartel «${info.title}»`
  return null
}

/**
 * Interacción por rayo.
 *
 * Mira desde la cámara hacia el centro de la pantalla y detecta carteles y
 * estaciones del museo Xupply. Ofrece resaltado, pista contextual y apertura
 * con la tecla E, con clic (ratón capturado) o con el botón táctil.
 *
 * No hay interacción con otras personas: el recorrido es individual, sin
 * multijugador ni NPC con los que hablar (ver README → "Por qué no hay otros
 * visitantes").
 */
export function Interaction() {
  const { camera } = useThree()
  const raycaster = useRef(new THREE.Raycaster()).current
  const hover = useRef(null)
  const tinted = useRef(null)

  const setTarget = useStore((s) => s.setTarget)
  const setPrompt = useStore((s) => s.setPrompt)

  /** Abre lo que esté enfocado ahora mismo. */
  const abrir = () => {
    const st = useStore.getState()
    if (st.view !== 'world' || st.viewing || st.station) return
    const h = hover.current
    if (!h) return

    if (h.kind === 'station') st.setStation(h.id)
    else if (h.kind === 'poster') st.setViewing(h.id)
  }

  // Tecla E: interactuar.
  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return
      if (e.code === 'KeyE') {
        e.preventDefault()
        abrir()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Clic con el ratón capturado dentro del museo.
  useEffect(() => {
    const onDown = (e) => {
      if (e.button !== 0) return
      const st = useStore.getState()
      if (st.mode !== 'museum') return
      if (!document.pointerLockElement) return
      abrir()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  useFrame((_, delta) => {
    const st = useStore.getState()
    // En VR el rayo del mando manda; el rayo de la mirada se apaga para no
    // encender objetos que no se pueden abrir desde el visor.
    const activo = st.view === 'world' && !st.viewing && !st.station && !st.xrActive

    // Botón táctil equivalente a la tecla E.
    if (touchInput.interact) {
      touchInput.interact = false
      abrir()
    }

    let encontrado = null

    if (activo) {
      const meshList = [...REGISTRY.values(), ...STATION_REGISTRY.values()]
      if (meshList.length) {
        raycaster.setFromCamera({ x: 0, y: 0 }, camera)
        raycaster.far = MAX_DISTANCE
        const hits = raycaster.intersectObjects(meshList, false)
        for (const hit of hits) {
          if (hit.distance > MAX_DISTANCE) continue
          const info = hit.object.userData.interact
          if (info) {
            encontrado = { ...info, mesh: hit.object, distance: hit.distance }
            break
          }
        }
      }
    }

    const keyAntes = hover.current?.mesh?.uuid || null
    const keyAhora = encontrado?.mesh?.uuid || null
    hover.current = encontrado

    if (keyAntes !== keyAhora) {
      setTarget(encontrado ? { id: encontrado.id, kind: encontrado.kind, title: encontrado.title } : null)
      setPrompt(promptFor(encontrado))
    }

    /* Resaltado del objeto enfocado (solo carteles y estaciones). */
    const nuevoMaterial = encontrado && TINTABLES.has(encontrado.kind) ? encontrado.mesh.material : null
    if (tinted.current && tinted.current !== nuevoMaterial) {
      tinted.current.color.setRGB(1, 1, 1)
      tinted.current = null
    }
    if (nuevoMaterial?.color) {
      const accent = encontrado.kind === 'poster' ? ACCENT[`poster:${encontrado.id}`] : new THREE.Color(encontrado.accent || '#5aa9ff')
      nuevoMaterial.color.lerp(accent, Math.min(1, delta * 8))
      tinted.current = nuevoMaterial
    }
  })

  return null
}
