import { useEffect } from 'react'
import { useStore } from '../store.js'
import { TOUR_STEPS, stepStation } from './steps.js'
import { teleportPlayer, yawTowards, SPAWN_MUSEUM } from '../player/state.js'
import { stationSpot } from '../museum/config.js'
import { STATIONS } from '../museum/stations.js'
import { look } from '../components/PointerLock.jsx'

/**
 * Director del recorrido guiado.
 *
 * Al cambiar de paso: coloca al visitante frente a la estación correspondiente,
 * orienta la cámara hacia ella, abre su ficha y publica la frase del guía.
 * Los pasos de introducción y cierre devuelven al visitante al centro del museo.
 */
export function TourDirector() {
  const step = useStore((s) => s.tour.step)
  const active = useStore((s) => s.tour.active)

  useEffect(() => {
    if (!active) return
    const paso = TOUR_STEPS[step]
    if (!paso) return

    const st = useStore.getState()

    // Frase del guía (la muestra la burbuja del asistente sobre Xuppy).
    if (paso.guide) st.setAssistant(paso.guide)

    const estacion = stepStation(paso)
    if (!estacion) {
      // Introducción / cierre: al centro del museo, mirando a la entrada.
      teleportPlayer({ x: SPAWN_MUSEUM.x, z: 3.2 })
      look.yaw = 0
      look.pitch = -0.05
      return
    }

    const index = STATIONS.findIndex((s) => s.id === estacion.id)
    const spot = stationSpot(index)
    const yaw = yawTowards(spot.standX, spot.standZ, spot.x, spot.z)

    teleportPlayer({ x: spot.standX, z: spot.standZ, yaw })
    // La cámara mira hacia la estación (mismo ángulo que el avatar).
    look.yaw = yaw
    look.pitch = -0.02

    // Abre la ficha del módulo para que se lea sin buscar nada.
    st.setStation(estacion.id)
  }, [active, step])

  return null
}
