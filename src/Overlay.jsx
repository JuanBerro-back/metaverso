import { memo, useEffect, useState } from 'react'
import { EXHIBIT_MAP, REPO_URL } from './museum/exhibits.js'
import { useStore } from './store.js'
import { lockPointer } from './components/PointerLock.jsx'

function VideoPlayer({ src, caption }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="video-frame">
      <video
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

export function Overlay() {
  const [locked, setLocked] = useState(false)
  const target = useStore((s) => s.target)
  const viewing = useStore((s) => s.viewing)
  const setViewing = useStore((s) => s.setViewing)
  const mode = useStore((s) => s.mode)
  const score = useStore((s) => s.score)
  const hearts = useStore((s) => s.hearts)
  const level = useStore((s) => s.level)
  const best = useStore((s) => s.best)
  const gameOver = useStore((s) => s.gameOver)
  const inProgress = useStore((s) => s.inProgress)
  const setMode = useStore((s) => s.setMode)
  const startGame = useStore((s) => s.startGame)

  const inGame = mode === 'game'

  useEffect(() => {
    const onChange = () => setLocked(document.pointerLockElement !== null)
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.code === 'KeyC' || e.code === 'Escape') && useStore.getState().viewing) {
        closePanel()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const exhibit = viewing ? EXHIBIT_MAP[viewing] : null

  function closePanel() {
    setViewing(null)
    if (!document.pointerLockElement) lockPointer()
  }

  return (
    <>
      {gameOver && inGame && !exhibit && (
        <div className="menu">
          <div className="panel">
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
                  startGame()
                  lockPointer()
                }}
              >
                Volver a jugar
              </button>
              <button className="start ghost" onClick={() => {
                  lockPointer()
                  useStore.getState().setMode('museum')
                }}>
                Explorar el museo
              </button>
            </div>
          </div>
        </div>
      )}

      {!locked && !exhibit && !gameOver && (
        <div className="menu">
          <div className="panel">
            <h1>Metaverso Xupply</h1>
            <p className="subtitle">
              Ecosistema logístico B2B para la gastronomía de Bucaramanga ·{' '}
              <a className="link" href={REPO_URL} target="_blank" rel="noreferrer">
                xupply-D
              </a>
            </p>
            <ul className="controls">
              <li><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> moverte por el espacio</li>
              <li><kbd>Ratón</kbd> mirar y apuntar con el punto</li>
              <li><kbd>Shift</kbd> correr · <kbd>Espacio</kbd> saltar · <kbd>ESC</kbd> liberar el ratón</li>
            </ul>
            <div className="panel-actions">
              <button
                id="start-museum"
                className="start"
                onClick={() => {
                  setMode('museum')
                  lockPointer()
                }}
              >
                Entrar al museo
              </button>
              <button
                id="start-game"
                className="start game"
                onClick={() => {
                  if (useStore.getState().inProgress) {
                    setMode('game')
                  } else {
                    startGame()
                  }
                  lockPointer()
                }}
              >
                {inProgress ? 'Reanudar partida' : 'Jugar: banda logística'}
              </button>
            </div>
            <p className="hint">
              El juego: clasifica las cajas en su tolva antes de que caigan de la banda
            </p>
          </div>
        </div>
      )}

      {exhibit && (
        <div className="exhibit" onClick={closePanel}>
          <ExhibitCard exhibit={exhibit} />
        </div>
      )}

      {locked && !exhibit && (
        <>
          <div className="crosshair" />
          {inGame ? (
            <div className="hud">
              <span>Xupply · Clasificación</span>
              <span className="hud-stats">
                <span>Nivel {level}</span>
                <span>Puntos {score}</span>
                <span className="hearts">{"♥".repeat(hearts)}{"·".repeat(3 - hearts)}</span>
              </span>
            </div>
          ) : (
            <div className="hud">
              <span>Museo · Proyecto Xupply</span>
              <span className="hud-hint">ESC para liberar el ratón</span>
            </div>
          )}

          {target && (
            <div className="tooltip">
              <span className="tooltip-dot" />
              {target.title}
            </div>
          )}
        </>
      )}
    </>
  )
}