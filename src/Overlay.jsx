import { useEffect, useRef, useState } from 'react'
import { EXHIBIT_MAP, REPO_URL } from './museum/exhibits.js'
import { useStore } from './store.js'

function VideoPlayer({ src, caption }) {
  const videoRef = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    setFailed(false)
    try {
      const p = el.play()
      if (p) p.catch(() => {})
    } catch {
      /* autoplay bloqueado: el usuario pulsa play */
    }
  }, [src])

  return (
    <div className="video-frame">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        src={src}
        onError={() => setFailed(true)}
      >
        Tu navegador no soporta la reproducción de video.
      </video>
      <p className="video-caption">&#9654; {caption} (con sonido)</p>
      {failed && (
        <p className="video-error">
          No se encontró el video. Añade el archivo en <code>public/media/presentacion.mp4</code> y
          recarga la página.
        </p>
      )}
    </div>
  )
}

export function Overlay() {
  const [locked, setLocked] = useState(false)
  const target = useStore((s) => s.target)
  const viewing = useStore((s) => s.viewing)
  const setViewing = useStore((s) => s.setViewing)

  useEffect(() => {
    const onChange = () => setLocked(document.pointerLockElement !== null)
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.code === 'KeyC' || e.code === 'Escape') && useStore.getState().viewing) {
        setViewing(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setViewing])

  const exhibit = viewing ? EXHIBIT_MAP[viewing] : null

  return (
    <>
      {!locked && !exhibit && (
        <div className="menu">
          <div className="panel">
            <h1>Museo del Proyecto Zupply</h1>
            <p className="subtitle">
              Un metaverso de práctica que expone la plataforma{' '}
              <a className="link" href={REPO_URL} target="_blank" rel="noreferrer">
                zupply-D
              </a>{' '}
              — ERP B2B para el sector gastronómico de Bucaramanga, Colombia.
            </p>
            <ul className="controls">
              <li><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> moverte por el museo</li>
              <li><kbd>Ratón</kbd> mirar · apunta a cada obra para resaltarla</li>
              <li><kbd>Clic</kbd> abrir la explicación de la obra</li>
              <li><kbd>Shift</kbd> correr · <kbd>ESC</kbd> liberar el ratón</li>
            </ul>
            <button id="start" className="start">Entrar al museo</button>
            <p className="hint">8 obras · la última incluye el video final del proyecto</p>
          </div>
        </div>
      )}

      {exhibit && (
        <div className="exhibit" onClick={() => setViewing(null)}>
          <div className="exhibit-card" onClick={(e) => e.stopPropagation()}>
            <div className="exhibit-band" style={{ background: exhibit.accent || '#5aa9ff' }}>
              <span className="exhibit-num">{exhibit.num}</span>
              <div>
                <h2>{exhibit.title}</h2>
                <p>{exhibit.subtitle}</p>
              </div>
            </div>
            <div className="exhibit-body">
              <p className="exhibit-lead">{exhibit.details.lead}</p>
              {exhibit.details.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {exhibit.video && (
                <VideoPlayer src={exhibit.video.src} caption={exhibit.video.caption} />
              )}
              <div className="exhibit-actions">
                <a className="link" href={REPO_URL} target="_blank" rel="noreferrer">
                  github.com/JuanBerro-back/zupply-D
                </a>
                <button className="close" onClick={() => setViewing(null)}>
                  Cerrar (C / clic fuera)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {locked && !exhibit && (
        <>
          <div className="crosshair" />
          <div className="hud">
            <span>Museo · Proyecto Zupply</span>
            <span className="hud-hint">ESC para liberar el ratón</span>
          </div>

          {target && (
            <div className="tooltip">
              <span className="tooltip-dot" />
              {target.title} — clic para leer
            </div>
          )}
        </>
      )}
    </>
  )
}