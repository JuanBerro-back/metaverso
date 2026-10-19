import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Museum } from './components/Museum.jsx'
import { Panels } from './components/Panels.jsx'
import { Stations } from './components/Stations.jsx'
import { Player } from './components/Player.jsx'
import { Avatar } from './components/Avatar.jsx'
import { Interaction } from './components/Interaction.jsx'
import { PointerLock } from './components/PointerLock.jsx'
import { Warehouse } from './components/Warehouse.jsx'
import { ConveyorGame } from './components/ConveyorGame.jsx'
import { ZuppyBot } from './components/ZuppyBot.jsx'
import { KawaiiHamburger } from './components/KawaiiHamburger.jsx'
import { Visitors } from './components/Visitors.jsx'
import { Portal } from './components/Portal.jsx'
import { XRSupport } from './xr/XRSupport.jsx'
import { TourDirector } from './tour/TourDirector.jsx'
import { useStore } from './store.js'
import { SPAWN_GAME, SPAWN_MUSEUM, teleportPlayer } from './player/state.js'
import { look } from './components/PointerLock.jsx'

/** Coloca al visitante en el punto de aparición al entrar o al cambiar de escena. */
function SpawnController() {
  const mode = useStore((s) => s.mode)
  const view = useStore((s) => s.view)
  const previo = useRef(null)

  useEffect(() => {
    if (view !== 'world') return
    const clave = `${view}:${mode}`
    if (previo.current === clave) return
    previo.current = clave

    const spawn = mode === 'game' ? SPAWN_GAME : SPAWN_MUSEUM
    teleportPlayer(spawn)
    look.yaw = 0
    look.pitch = 0
  }, [mode, view])

  return null
}

/** Activa o desactiva el mapa de sombras del renderer sin recrear el Canvas. */
function ShadowToggle() {
  const shadows = useStore((s) => s.shadows)
  const { gl } = useThree()

  useEffect(() => {
    try {
      gl.shadowMap.enabled = Boolean(shadows)
      gl.shadowMap.needsUpdate = true
    } catch {
      /* noop */
    }
  }, [shadows, gl])

  return null
}

/**
 * Contenido de la escena 3D. Se mantiene la estética original (museo, ovni,
 * gato hambriento, hamburguesa voladora, banda logística) y se añaden las
 * estaciones del museo, el avatar, los visitantes de demostración y WebXR.
 */
export function Experience({ quality = 'media', preset }) {
  const mode = useStore((s) => s.mode)
  const inGame = mode === 'game'
  const detalle = quality !== 'baja'

  return (
    <>
      <color attach="background" args={[inGame ? '#0b0e13' : '#0a0e17']} />
      <fog attach="fog" args={[inGame ? '#0b0e13' : '#0a0e17', 24, 80]} />

      <ShadowToggle />
      <PointerLock />
      <SpawnController />
      <TourDirector />
      <XRSupport />

      {inGame ? (
        <>
          <Warehouse detail={detalle} />
          <ConveyorGame />
          <ZuppyBot position={[2.6, 0, 3.6]} />
          <KawaiiHamburger position={[4.2, 0, -4.2]} />
          <Portal position={[0, 0, 8.0]} to="museum" label="Museo" />
        </>
      ) : (
        <>
          <Museum detail={detalle} />
          <Panels />
          <Stations />
          <Visitors />
          <Interaction />
          {/* Guías kawaii del recorrido */}
          <ZuppyBot position={[-2.2, 0, 9.5]} />
          <KawaiiHamburger position={[3.2, 0, 5.4]} />
          <Portal position={[0, 0, 7.5]} to="game" label="Jugar" hex="#5aa9ff" />
        </>
      )}

      <Avatar />
      <Player />
    </>
  )
}
