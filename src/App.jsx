import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './Experience.jsx'
import { Overlay } from './Overlay.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { LoadingScreen } from './components/LoadingScreen.jsx'

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
  const [ready, setReady] = useState(false)
  const [minElapsed, setMinElapsed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 1200)
    return () => clearTimeout(t)
  }, [])

  const loading = !(ready && minElapsed)

  return (
    <div id="scene" className="scene">
      <ErrorBoundary fallback={<SceneFallback />}>
        <Canvas
          shadows
          dpr={[1, 2]}
          onCreated={() => setReady(true)}
          camera={{ position: [0, 1.65, 11], fov: 75, near: 0.1, far: 100 }}
        >
          <Experience />
        </Canvas>
      </ErrorBoundary>
      <Overlay />
      <LoadingScreen visible={loading} />
    </div>
  )
}