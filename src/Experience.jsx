import { PointerLockControls } from '@react-three/drei'
import { Museum } from './components/Museum.jsx'
import { Panels } from './components/Panels.jsx'
import { Player } from './components/Player.jsx'
import { Interaction } from './components/Interaction.jsx'

export function Experience() {
  return (
    <>
      <color attach="background" args={['#0a0e17']} />
      <fog attach="fog" args={['#0a0e17', 30, 90]} />
      <Museum />
      <Panels />
      <Player />
      <Interaction />
      <PointerLockControls selector="#start" />
    </>
  )
}