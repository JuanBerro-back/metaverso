import { memo, useEffect, useState } from 'react'
import { EXHIBIT_MAP, REPO_URL } from './museum/exhibits.js'
import { useStore } from './store.js'
import { lockPointer, unlockPointer } from './components/PointerLock.jsx'
import { BASE } from './components/LoadingScreen.jsx'
import { StartScreen } from './components/StartScreen.jsx'
import { StationPanel } from './components/StationPanel.jsx'
import { TourHud } from './components/TourHud.jsx'
import { TouchControls } from './components/TouchControls.jsx'
import { MODO_LOCAL } from './net/visitors.js'
import { STATIONS } from './museum/stations.js'

/**
 * Resuelve una ruta de recurso teniendo en cuenta el `base` de Vite
 * (`/metaverso/` en GitHub Pages). Sin esto, `/media/...` daría 404.
 */
function mediaUrl(src) {
  if (!src) return src
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:')) return src
  return `${BASE}${String(src).replace(/^\/+/, '')}`
}

const CALIDADES = [
  ['auto', 'Automática'],
  ['alta', 'Alta'],
  ['media', 'Media'],
  ['baja', 'Baja'],
]

/* ------------------------------------------------------------------ *
 * Cartel del museo (ficha clásica, se conserva)                       *
 * ------------------------------------------------------------------ */

function VideoPlayer({ src, caption }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="video-frame">
      <video controls playsInline preload="metadata" src={mediaUrl(src)} onError={() => setFailed(true)}>
        Tu navegador no soporta la reproducción de video.
      </video>
      <p className="video-caption">&#9654; {caption} (con sonido)</p>
      {failed && (
        <p className="video-error">
          No se encontró el video. Añade el archivo en <code>public/media/presentacion.mp4</code> y recarga la
          página.
        </p>
      )}
    </div>
  )
}

const ExhibitCard = memo(function ExhibitCard({ exhibit }) {
  return (
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
        {exhibit.video && <VideoPlayer src={exhibit.video.src} caption={exhibit.video.caption} />}
        <div className="exhibit-actions">
          <a className="link" href={REPO_URL} target="_blank" rel="noreferrer">
            github.com/JuanBerro-back/xupply-D
          </a>
          <button
            className="close"
            onClick={() => {
              useStore.getState().setViewing(null)
              if (!document.pointerLockElement) lockPointer()
            }}
          >
            Cerrar (C / clic fuera)
          </button>
        </div>
      </div>
    </div>
  )
})

/* ------------------------------------------------------------------ *
 * Panel de pausa / menú principal dentro del metaverso                *
 * ------------------------------------------------------------------ */

function PausePanel({ onClose }) {
  const mode = useStore((s) => s.mode)
  const nickname = useStore((s) => s.nickname)
  const quality = useStore((s) => s.quality)
  const qualityPref = useStore((s) => s.qualityPref)
  const cameraMode = useStore((s) => s.cameraMode)
  const inProgress = useStore((s) => s.inProgress)
  const tourSeen = useStore((s) => s.tourSeen)

  const inGame = mode === 'game'

  const cerrarMenu = () => {
    if (typeof onClose === 'function') onClose()
  }
  const continuar = () => {
    cerrarMenu()
    lockPointer()
  }
  const empezarRecorrido = () => {
    cerrarMenu()
    useStore.getState().startTour()
    lockPointer()
  }
  const irAlInicio = () => {
    cerrarMenu()
    unlockPointer()
    useStore.getState().clearOverlays()
    useStore.getState().setView('start')
  }
  const jugar = () => {
    cerrarMenu()
    if (useStore.getState().inProgress) useStore.getState().setMode('game')
    else useStore.getState().startGame()
    lockPointer()
  }
  const irAlMuseo = () => {
    cerrarMenu()
    useStore.getState().setMode('museum')
    lockPointer()
  }

  return (
    <div className="menu">
      <div className="panel pause-panel" role="dialog" aria-modal="true" aria-labelledby="pause-title">
        <h1 id="pause-title">{inGame ? 'Banda logística · en pausa' : 'Museo Xupply · en pausa'}</h1>
        <p className="subtitle">
          {nickname ? `${nickname} · ` : ''}
          {inGame
            ? 'clasifica las cajas en su tolva antes de que caigan de la banda'
            : 'ecosistema logístico B2B para la restauración · '}{' '}
          <a className="link" href={REPO_URL} target="_blank" rel="noreferrer">
            xupply-D
          </a>
        </p>

        <ul className="controls">
          <li>
            <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd> moverte por el espacio (o flechas)
          </li>
          <li>
            <kbd>Ratón</kbd> mirar · <kbd>V</kbd> 1.ª/3.ª persona · <kbd>M</kbd> recorrido guiado
          </li>
          <li>
            <kbd>E</kbd> interactuar · <kbd>Shift</kbd> correr · <kbd>Espacio</kbd> saltar ·{' '}
            <kbd>ESC</kbd> pausa
          </li>
        </ul>

        <div className="panel-actions">
          <button type="button" id="continue" className="start" onClick={continuar}>
            {inGame ? 'Volver a jugar' : 'Continuar explorando'}
          </button>

          {inGame ? (
            <button type="button" className="start ghost" onClick={irAlMuseo}>
              Ir al Museo Xupply
            </button>
          ) : (
            <>
              <button type="button" className="start game" onClick={empezarRecorrido}>
                {tourSeen ? 'Repetir recorrido guiado' : 'Empezar el recorrido guiado'}
              </button>
              <button type="button" className="start ghost" onClick={jugar}>
                {inProgress ? 'Reanudar la banda logística' : 'Jugar: banda logística'}
              </button>
            </>
          )}

          <button type="button" className="start ghost" onClick={irAlInicio}>
            Volver a la pantalla de inicio
          </button>
          {typeof onClose === 'function' && (
            <button type="button" className="start ghost" onClick={cerrarMenu}>
              Cerrar el menú y seguir en el museo
            </button>
          )}
        </div>

        <div className="pause-options">
          <label className="pause-option">
            <span>Calidad gráfica (actual: {quality})</span>
            <select
              value={qualityPref}
              onChange={(e) => useStore.getState().setQualityPref(e.target.value)}
            >
              {CALIDADES.map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => useStore.getState().setTouch(true)}
            title="Útil si el navegador no permite capturar el ratón (kiosco, iframe, presentaciones)."
          >
            Activar controles sin ratón (táctil/arrastrar)
          </button>
          <p className="pause-note">
            Si al pulsar «Continuar» el ratón no se captura, usa el botón anterior: mueves con el joystick y giras
            arrastrando.
          </p>
        </div>

        <p className="pause-modules">
          Módulos del museo:{' '}
          {STATIONS.map((s, i) => (
            <span key={s.id}>
              {i > 0 && ' · '}
              <button
                type="button"
                className="link link-button"
                onClick={() => {
                  useStore.getState().setMode('museum')
                  useStore.getState().setStation(s.id)
                }}
              >
                {s.num} {s.title}
              </button>
            </span>
          ))}
        </p>

        <p className="hint">
          {MODO_LOCAL.etiqueta} · cámara: {cameraMode === 'third' ? '3.ª persona' : '1.ª persona (inmersiva)'}
          {' · '}
          calidad {quality}
          {qualityPref === 'auto' ? ' (automática)' : ''}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * HUD dentro del museo (punto de mira, pista e indicadores)           *
 * ------------------------------------------------------------------ */

function Hud({ onMenu }) {
  const mode = useStore((s) => s.mode)
  const target = useStore((s) => s.target)
  const prompt = useStore((s) => s.prompt)
  const level = useStore((s) => s.level)
  const score = useStore((s) => s.score)
  const hearts = useStore((s) => s.hearts)
  const quality = useStore((s) => s.quality)
  const cameraMode = useStore((s) => s.cameraMode)
  const tourActive = useStore((s) => s.tour.active)
  const xrSupported = useStore((s) => s.xrSupported)

  const inGame = mode === 'game'

  return (
    <>
      <div className="crosshair" />

      <div className="hud">
        <span>{inGame ? 'Xupply · Clasificación' : 'Museo Xupply · recorrido explicativo'}</span>

        {inGame ? (
          <span className="hud-stats">
            <span>Nivel {level}</span>
            <span>Puntos {score}</span>
            <span className="hearts">
              {'♥'.repeat(hearts)}
              {'·'.repeat(Math.max(0, 3 - hearts))}
            </span>
          </span>
        ) : (
          <span className="hud-right">
            <span className="hud-pill" title={MODO_LOCAL.detalle}>
              ● {MODO_LOCAL.etiqueta}
            </span>
            <span className="hud-pill" title="Calidad gráfica efectiva">
              {quality}
            </span>
            <button
              type="button"
              className="hud-btn"
              onClick={() =>
                useStore.getState().setCameraMode(cameraMode === 'third' ? 'first' : 'third')
              }
              title="Cambiar de cámara (tecla V)"
            >
              {cameraMode === 'third' ? '3.ª persona' : '1.ª persona'}
            </button>
            {!tourActive && (
              <button
                type="button"
                className="hud-btn"
                onClick={() => useStore.getState().startTour()}
                title="Empezar el recorrido guiado (tecla M)"
              >
                ▶ Recorrido
              </button>
            )}
            {xrSupported && <span className="hud-pill hud-pill-xr">VR disponible</span>}
          </span>
        )}

        {typeof onMenu === 'function' && (
          <button type="button" className="hud-btn" onClick={onMenu} title="Abrir el menú de pausa">
            ☰ Menú
          </button>
        )}
      </div>

      {!tourActive && prompt && (
        <div className="prompt-hint">
          <kbd>E</kbd>
          <span>{prompt}</span>
        </div>
      )}

      {!tourActive && target && (
        <div className="tooltip">
          <span className="tooltip-dot" />
          {target.title}
        </div>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Capa de interfaz completa                                           *
 * ------------------------------------------------------------------ */

export function Overlay() {
  const view = useStore((s) => s.view)
  const locked = useStore((s) => s.locked)
  const touch = useStore((s) => s.touch)
  const mode = useStore((s) => s.mode)
  const gameOver = useStore((s) => s.gameOver)
  const score = useStore((s) => s.score)
  const best = useStore((s) => s.best)
  const viewing = useStore((s) => s.viewing)
  const station = useStore((s) => s.station)
  const xrActive = useStore((s) => s.xrActive)
  const tourActive = useStore((s) => s.tour.active)

  // Menú abierto a mano (modo táctil/sin ratón), donde no hay ESC ni pausa automática.
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Al abrir una ficha hay que soltar el ratón; si no, no se puede pulsar nada.
  useEffect(() => {
    if ((station || viewing) && document.pointerLockElement) unlockPointer()
  }, [station, viewing])

  // Atajos globales: V (cámara), M (recorrido), C / ESC (cerrar capas y menú).
  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return
      const st = useStore.getState()
      if (st.view !== 'world') return

      if (e.code === 'KeyV') {
        st.setCameraMode(st.cameraMode === 'third' ? 'first' : 'third')
        return
      }
      if (e.code === 'KeyM') {
        if (st.tour.active) st.stopTour()
        else st.startTour()
        return
      }
      if (e.code === 'KeyC' || e.code === 'Escape') {
        if (st.station) {
          st.setStation(null)
          if (!document.pointerLockElement) lockPointer()
        } else if (st.viewing) {
          st.setViewing(null)
          if (!document.pointerLockElement) lockPointer()
        } else {
          setMenuAbierto((v) => !v)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (view === 'start') return <StartScreen />

  const exhibit = viewing ? EXHIBIT_MAP[viewing] : null
  const inGame = mode === 'game'
  const overlayAbierto = Boolean(station || viewing)
  const mostrarPausa =
    (!locked && !touch && !overlayAbierto && !gameOver && !xrActive && !tourActive) ||
    (menuAbierto && !overlayAbierto && !xrActive && !tourActive)

  return (
    <>
      {/* Fin de partida del minijuego */}
      {gameOver && inGame && !overlayAbierto && (
        <div className="menu">
          <div className="panel" role="dialog" aria-modal="true">
            <h1>Fin de la jornada</h1>
            <p className="subtitle">Se escaparon demasiadas cajas de la banda…</p>
            <div className="final-stats">
              <div className="final-stat">
                <span>Puntaje</span>
                <strong>{score}</strong>
              </div>
              <div className="final-stat">
                <span>Récord</span>
                <strong>{best}</strong>
              </div>
            </div>
            <div className="panel-actions">
              <button
                id="retry"
                className="start game"
                onClick={() => {
                  useStore.getState().startGame()
                  lockPointer()
                }}
              >
                Volver a jugar
              </button>
              <button
                className="start ghost"
                onClick={() => {
                  useStore.getState().setMode('museum')
                  lockPointer()
                }}
              >
                Explorar el museo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pausa / menú dentro del metaverso */}
      {mostrarPausa && <PausePanel onClose={menuAbierto ? () => setMenuAbierto(false) : undefined} />}

      {/* Ficha de una estación del museo (panel lateral) */}
      {station && !xrActive && <StationPanel stationId={station} />}

      {/* Cartel clásico del museo */}
      {exhibit && (
        <div className="exhibit" onClick={() => useStore.getState().setViewing(null)}>
          <ExhibitCard exhibit={exhibit} />
        </div>
      )}

      {/* HUD mientras se juega o explora */}
      {(locked || touch) && !overlayAbierto && !gameOver && !xrActive && !menuAbierto && (
        <Hud onMenu={touch ? () => setMenuAbierto(true) : undefined} />
      )}

      {/* Recorrido guiado (modo presentación) */}
      <TourHud />

      {/* Controles táctiles / sin ratón */}
      <TouchControls />
    </>
  )
}
