import { useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './Experience.jsx'
import { Overlay } from './Overlay.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { LoadingScreen } from './components/LoadingScreen.jsx'
import { RecoveryScreen } from './components/RecoveryScreen.jsx'
import { pointerLockSupported } from './components/PointerLock.jsx'
import {
  detectWebGL,
  detectWebXR,
  isTouchDevice,
  webglHelp,
  clampedPixelRatio,
} from './lib/capabilities.js'
import { QUALITY_PRESETS, useStore } from './store.js'

/** Elige calidad automática según GPU detectada y tipo de dispositivo. */
function autoQuality(webgl) {
  try {
    const renderer = String(webgl?.renderer || '').toLowerCase()
    const software =
      renderer.includes('swiftshader') ||
      renderer.includes('llvmpipe') ||
      renderer.includes('software') ||
      renderer.includes('basic render')
    if (software || webgl?.version === 'webgl1') return 'baja'

    const touch = isTouchDevice()
    const small = (window.innerWidth || 0) < 900
    const memory = navigator.deviceMemory || 4
    if (small) return 'media'
    if (touch) return 'media'
    return memory >= 4 ? 'alta' : 'media'
  } catch {
    return 'media'
  }
}

export default function App({ onMounted }) {
  // La comprobación de WebGL se hace una sola vez, antes de crear el Canvas.
  const webgl = useMemo(() => detectWebGL(), [])

  const [retryKey, setRetryKey] = useState(0)
  const [ready, setReady] = useState(false)
  const [minElapsed, setMinElapsed] = useState(false)
  const [stalled, setStalled] = useState(false)

  const qualityPref = useStore((s) => s.qualityPref)
  const setQuality = useStore((s) => s.setQuality)
  const setShadows = useStore((s) => s.setShadows)
  const setXrSupported = useStore((s) => s.setXrSupported)
  const setTouch = useStore((s) => s.setTouch)

  const quality = useMemo(() => {
    if (qualityPref !== 'auto') return qualityPref
    return autoQuality(webgl)
  }, [qualityPref, webgl])

  const preset = QUALITY_PRESETS[quality] || QUALITY_PRESETS.media

  // Publicamos la calidad efectiva para que la escena ajuste sombras y luces.
  useEffect(() => {
    setQuality(quality)
    setShadows(Boolean(preset.shadows))
  }, [quality, preset, setQuality, setShadows])

  useEffect(() => {
    if (typeof onMounted === 'function') onMounted()
  }, [onMounted])

  // Detección de WebXR. Nunca bloquea: si falla, simplemente no se ofrece VR.
  useEffect(() => {
    let alive = true
    detectWebXR().then((res) => {
      if (alive) setXrSupported(res.supported)
    })
    return () => {
      alive = false
    }
  }, [setXrSupported])

  useEffect(() => {
    // Táctil cuando el puntero principal es un dedo; también cuando el
    // navegador no permite capturar el ratón (kiosco, iframe, presentaciones),
    // para que la demo nunca se quede sin forma de moverse.
    let puedeCapturar = true
    try {
      puedeCapturar = pointerLockSupported()
    } catch {
      puedeCapturar = false
    }
    setTouch(isTouchDevice() || !puedeCapturar)
  }, [setTouch])

  // Temporizador de cortesía de la pantalla de carga + vigilante del motor 3D.
  useEffect(() => {
    setReady(false)
    setStalled(false)
    const t1 = setTimeout(() => setMinElapsed(true), 1100)
    // Si el motor no confirma el arranque en 20 s marcamos la carga como
    // "atascada": la pantalla de carga ofrece reintentar y cambiar de calidad.
    const t2 = setTimeout(() => {
      setReady((wasReady) => {
        if (!wasReady) {
          console.warn('[Xupply] el motor 3D no confirmó su arranque en 20 s')
          setStalled(true)
        }
        return wasReady
      })
    }, 20000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [retryKey])

  const retryScene = useCallback((forzarCalidad) => {
    if (forzarCalidad) useStore.getState().setQualityPref(forzarCalidad)
    setReady(false)
    setStalled(false)
    setMinElapsed(false)
    setRetryKey((k) => k + 1)
  }, [])

  const loading = !(ready && minElapsed)

  const canvasFallback = useCallback(
    ({ error, retry }) => (
      <RecoveryScreen
        title="El motor 3D se detuvo"
        message="La escena 3D lanzó un error inesperado. Puedes reintentar sin recargar la página."
        help={[
          'Reintenta primero: el error puede ser puntual (contexto WebGL agotado por demasiadas pestañas).',
          'Si vuelve a ocurrir, prueba en calidad baja: reduce resolución, sombras y antialias.',
          'Cierra otras pestañas con contenido 3D y actualiza los controladores de tu tarjeta gráfica.',
        ]}
        error={error}
        onRetry={retry}
        extraActions={
          <button
            type="button"
            className="btn btn-ghost btn-lg"
            onClick={() => {
              useStore.getState().setQualityPref('baja')
              retry()
            }}
          >
            Reintentar en calidad baja
          </button>
        }
      />
    ),
    []
  )

  // Sin WebGL no hay escena posible: mostramos recuperación clara, nunca el
  // genérico "ocurrió un problema al renderizar la escena".
  if (!webgl.ok) {
    return (
      <RecoveryScreen
        title="Tu navegador no puede crear un contexto WebGL"
        message="El metaverso necesita WebGL, la tecnología 3D del navegador. Ahora mismo está desactivado o no disponible en este equipo, por eso no se puede mostrar la escena."
        help={webglHelp(webgl.reason)}
        error={
          webgl.error ||
          `reason=${webgl.reason} · webgl2=${typeof WebGL2RenderingContext !== 'undefined'} · dpr=${clampedPixelRatio()}`
        }
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div id="scene" className="scene">
      <ErrorBoundary resetKeyProp={`${retryKey}-${quality}`} fallback={canvasFallback}>
        <Canvas
          key={`canvas-${retryKey}-${quality}`}
          shadows={preset.shadows ? 'soft' : false}
          dpr={[1, preset.pixelRatioMax]}
          performance={{ min: 0.5 }}
          gl={{
            antialias: preset.antialias,
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
          }}
          camera={{ position: [0, 2.3, 7.5], fov: 62, near: 0.1, far: 120 }}
          onCreated={({ gl, scene }) => {
            try {
              // Color de fondo por si la primera escena tarda en pintar.
              gl.setClearColor('#0a0e17', 1)
              scene.background = null
            } catch {
              /* noop */
            }
            setReady(true)
          }}
        >
          <Experience quality={quality} preset={preset} />
        </Canvas>
      </ErrorBoundary>

      <Overlay />

      <LoadingScreen
        visible={loading}
        stalled={stalled}
        onRecover={() => retryScene(null)}
        onLowQuality={() => retryScene('baja')}
      />
    </div>
  )
}
