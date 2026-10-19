import { useEffect, useState } from 'react'

/** Ruta correcta de los recursos en GitHub Pages (base: '/metaverso/'). */
export const BASE = import.meta.env.BASE_URL || '/'

/**
 * Pantalla de carga de Xupply.
 *
 * Se conserva la estética original (portada + badge XUPPLY + spinner) y se
 * añaden dos garantías: la imagen degradada no rompe nada y, si el motor 3D
 * se queda atascado, aparece una vía de escape con reintento.
 */
export function LoadingScreen({ visible, stalled = false, onRecover, onLowQuality }) {
  const [imagenOk, setImagenOk] = useState(true)
  const [progreso, setProgreso] = useState(8)

  // Barra de progreso honesta: avanza hacia el 90% mientras se prepara la
  // escena y solo se completa cuando la escena confirma que está lista.
  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => {
      setProgreso((p) => (p >= 90 ? 90 : p + Math.max(1, (90 - p) * 0.06)))
    }, 220)
    return () => clearInterval(id)
  }, [visible])

  useEffect(() => {
    if (!visible) setProgreso(100)
  }, [visible])

  return (
    <div className={`loading-screen${visible ? '' : ' done'}`} aria-hidden={!visible} aria-busy={visible}>
      {imagenOk ? (
        <img src={`${BASE}media/portada.jpeg`} alt="" onError={() => setImagenOk(false)} />
      ) : (
        <div className="loading-fallback" />
      )}
      <div className="loading-fade" />
      <div className="loading-body">
        <span className="loading-badge">XUPPLY</span>
        <p className="loading-title">Metaverso Xupply</p>
        <p className="loading-sub">Preparando el museo, el gato-ovni y la hamburguesa voladora…</p>

        <div className="loading-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progreso)}>
          <span style={{ width: `${progreso}%` }} />
        </div>

        {stalled && (
          <div className="loading-stalled" role="alert">
            <p>
              La escena está tardando más de lo esperado. Puedes reintentar o entrar en calidad baja
              (menos resolución, sin sombras).
            </p>
            <div className="loading-actions">
              <button type="button" className="btn btn-primary" onClick={onRecover}>
                Reintentar
              </button>
              <button type="button" className="btn btn-ghost" onClick={onLowQuality}>
                Calidad baja
              </button>
            </div>
          </div>
        )}
        <div className="loading-spinner" />
        <p className="loading-note">Modo demostración local · no requiere conexión</p>
      </div>
    </div>
  )
}
