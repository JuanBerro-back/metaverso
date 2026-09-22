import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Museum } from './components/Museum.jsx'
import { Panels } from './components/Panels.jsx'
import { Player } from './components/Player.jsx'
import { Interaction } from './components/Interaction.jsx'
import { PointerLock, look } from './components/PointerLock.jsx'
import { Warehouse } from './components/Warehouse.jsx'
import { ConveyorGame } from './components/ConveyorGame.jsx'
import { ZuppyBot } from './components/ZuppyBot.jsx'
import { KawaiiHamburger } from './components/KawaiiHamburger.jsx'
import { Portal } from './components/Portal.jsx'
import { useStore } from './store.js'

function ResetCamera() {
  const { camera } = useThree()
  const mode = useStore((s) => s.mode)
  const inProgress = useStore((s) => s.inProgress)

  useEffect(() => {
    look.yaw = 0
    look.pitch = 0
    if (mode === 'game' && inProgress) {
      camera.position.set(0, 1.65, 3.9)
    } else {
      camera.position.set(0, 1.65, 11)
    }
    camera.rotation.set(0, 0, 0, 'YXZ')
  }, [mode, inProgress, camera])

  return null
}

export function Experience() {
  const mode = useStore((s) => s.mode)
  const inGame = mode === 'game'

  return (
    <>
      <color attach="background" args={[inGame ? '#0b0e13' : '#0a0e17']} />
      <fog attach="fog" args={[inGame ? '#0b0e13' : '#0a0e17', 24, 80]} />
      <ResetCamera />
      <PointerLock />
      {inGame ? (
        <>
          <Warehouse />
          <ConveyorGame />
          <ZuppyBot position={[2.6, 0, 3.6]} />
          <KawaiiHamburger position={[4.2, 0, -4.2]} />
          <Portal position={[0, 0, 8.0]} to="museum" label="Museo" />
        </>
      ) : (
        <>
          <Museum />
          <Panels />
          <Interaction />
          <ZuppyBot position={[-2.2, 0, 9.5]} />
          <KawaiiHamburger position={[3.2, 0, 5.4]} />
          <Portal position={[0, 0, 7.5]} to="game" label="Jugar" hex="#5aa9ff" />
        </>
      )}
      <Player />
    </>
  )
}