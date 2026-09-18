import { Canvas } from '@react-three/fiber'
import { Experience } from './Experience.jsx'
import { Overlay } from './Overlay.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

function SceneFallback() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0e17',
        color: '#e8eefc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      Ocurrió un problema al renderizar la escena. Recarga la página.
    </div>
  )
}

export default function App() {
  return (
    <div id="scene" className="scene">
      <ErrorBoundary fallback={<SceneFallback />}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 1.65, 11], fov: 75, near: 0.1, far: 100 }}
        >
          <Experience />
        </Canvas>
      </ErrorBoundary>
      <Overlay />
    </div>
  )
}