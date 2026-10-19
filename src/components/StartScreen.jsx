import { useEffect, useState } from 'react'
import { useStore } from '../store.js'
import { STATIONS } from '../museum/stations.js'
import { MODO_LOCAL } from '../net/visitors.js'
import { lockPointer, unlockPointer } from './PointerLock.jsx'
import { REPO_URL } from '../museum/exhibits.js'
import { XR_ENABLED } from '../lib/capabilities.js'

const CALIDADES = [
  ['auto', 'Automática'],
  ['alta', 'Alta'],
  ['media', 'Media'],
  ['baja', 'Baja'],
]

/**
 * Pantalla de inicio.
 *
 * Requisitos de accesibilidad: campos con etiqueta, botones grandes, foco
 * visible, textos de alto contraste y opción de saltar el recorrido guiado.
 */
export function StartScreen() {
  const nickname = useStore((s) => s.nickname)
  const setNickname = useStore((s) => s.setNickname)
  const setView = useStore((s) => s.setView)
  const startTour = useStore((s) => s.startTour)
  const xrSupported = useStore((s) => s.xrSupported)
  const xrChecked = useStore((s) => s.xrChecked)
  const qualityPref = useStore((s) => s.qualityPref)
  const setQualityPref = useStore((s) => s.setQualityPref)
  const quality = useStore((s) => s.quality)
  const tourSeen = useStore((s) => s.tourSeen)

  const [nombre, setNombre] = useState(nickname || '')
  const [avisoVr, setAvisoVr] = useState(null)

  useEffect(() => {
    // El botón VR oficial vive en el DOM (lo añade XRSupport dentro del Canvas).
    if (!xrSupported) setAvisoVr(null)
  }, [xrSupported])

  const nombreFinal = () => {
    const limpio = (nombre || '').trim().slice(0, 18) || 'Visitante'
    setNickname(limpio)
    return limpio
  }

  const entrar = (conRecorrido) => {
    nombreFinal()
    setView('world')
    if (conRecorrido) startTour()
    // El bloqueo del puntero requiere gesto de usuario: aquí lo tenemos.
    lockPointer()
  }

  const entrarVr = () => {
    const boton = document.getElementById('VRButton')
    if (!boton || boton.style.display === 'none') {
      setAvisoVr(
        'Este navegador o dispositivo no ofrece realidad virtual inmersiva. Puedes recorrer el museo igualmente en modo escritorio, o abrir la demo desde unas gafas compatibles (Quest, Pico…).'
      )
      return
    }
    nombreFinal()
    setView('world')
    // WebXR exige gesto del usuario; el botón oficial abre la sesión.
    boton.click()
  }

  return (
    <div className="start-screen">
      <div className="start-card">
        <header className="start-head">
          <span className="start-badge">XUPPLY</span>
          <h1>Metaverso explicativo</h1>
          <p className="start-lead">
            Recorrido 3D por los módulos de <strong>Xupply.D</strong>, el ecosistema logístico B2B para
            restaurantes: catálogo mayorista, pedidos con seguimiento GPS, inventario y contabilidad, y
            copiloto de IA.
          </p>
        </header>

        <div className="start-badges">
          <span className="pill pill-demo" title={MODO_LOCAL.detalle}>
            ● {MODO_LOCAL.etiqueta}
          </span>
          <span className="pill">Sin conexión · un solo jugador</span>
          <span className="pill">Vite + Three.js</span>
        </div>

        <div className="start-grid">
          <div className="start-field">
            <label htmlFor="nick">Tu nombre o apodo</label>
            <input
              id="nick"
              name="nickname"
              type="text"
              value={nombre}
              maxLength={18}
              placeholder="Visitante"
              autoComplete="off"
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') entrar(true)
              }}
            />
            <p className="start-hint">Solo se usa para tu presentación: no hay otros usuarios en la demo.</p>
          </div>

          <div className="start-field">
            <label htmlFor="calidad">Calidad gráfica (actual: {quality})</label>
            <select id="calidad" value={qualityPref} onChange={(e) => setQualityPref(e.target.value)}>
              {CALIDADES.map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </select>
            <p className="start-hint">Si el equipo va lento, elige calidad baja.</p>
          </div>
        </div>

        <div className="start-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => entrar(true)}>
            Entrar al metaverso y empezar el recorrido
          </button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => entrar(false)}>
            {tourSeen ? 'Entrar y explorar libremente' : 'Entrar y explorar sin recorrido'}
          </button>
        </div>

        <section className="start-vr" aria-live="polite">
          <h2>Realidad virtual (opcional)</h2>
          {XR_ENABLED ? (
            xrSupported ? (
              <>
                <button type="button" className="btn btn-vr btn-lg" onClick={entrarVr}>
                  Entrar en VR (primera persona)
                </button>
                <p className="start-vr-note">
                  Dentro del visor ves el museo <strong>en primera persona</strong>, sin avatar ni otros visitantes.
                  Funciona con cualquier mando WebXR (Quest, Pico, Index, Vive…); también puedes avanzar con el
                  joystick si tu mando lo trae.
                </p>
                <ul className="controls controls-vr">
                  <li>
                    <kbd>Gatillo</kbd> apuntar y soltar para teletransportarte
                  </li>
                  <li>
                    <kbd>Joystick izq.</kbd> avanzar y desplazarte lateralmente
                  </li>
                  <li>
                    <kbd>Joystick der.</kbd> girar 30° por pasos (cómodo, sin mareo)
                  </li>
                  <li>
                    <kbd>Gatillo</kbd> apuntando a una estación o cartel para leer su ficha en una pizarra 3D
                  </li>
                </ul>
              </>
            ) : (
              <p className="start-vr-note">
                {xrChecked
                  ? 'No se han detectado unas gafas compatibles en este navegador. El modo escritorio funciona igual: puedes entrar sin VR.'
                  : 'Comprobando compatibilidad con gafas…'}
              </p>
            )
          ) : (
            <p className="start-vr-note">
              La realidad virtual está desactivada en este despliegue (se puede activar con VITE_ENABLE_XR).
            </p>
          )}
          {avisoVr && (
            <p className="start-vr-note warn" role="status">
              {avisoVr}
            </p>
          )}
        </section>

        <section className="start-modules">
          <h2>Qué vas a encontrar</h2>
          <ul>
            {STATIONS.map((s) => (
              <li key={s.id}>
                <span className="mod-num" style={{ background: s.accent }}>
                  {s.num}
                </span>
                <span>
                  <strong>{s.title}</strong> — {s.subtitle}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="start-controls">
          <h2>Controles</h2>
          <ul className="controls">
            <li>
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd> moverte (o flechas)
            </li>
            <li>
              <kbd>Ratón</kbd> girar la vista · <kbd>V</kbd> alternar 1.ª (por defecto) y 3.ª persona
            </li>
            <li>
              <kbd>E</kbd> o clic leer una estación · <kbd>Shift</kbd> correr · <kbd>Espacio</kbd> saltar
            </li>
            <li>
              <kbd>ESC</kbd> pausa y menú · <kbd>M</kbd> recorrido guiado
            </li>
          </ul>
          <p className="start-hint">
            La experiencia es individual y en <strong>primera persona</strong>: no verás a otros visitantes ni podrás
            interactuar con nadie. En móvil y tablet aparecen controles táctiles (joystick, arrastrar para mirar y
            botón E).
          </p>
        </section>

        <footer className="start-foot">
          <a className="link" href={REPO_URL} target="_blank" rel="noreferrer">
            github.com/JuanBerro-back/xupply-D
          </a>
          <span>·</span>
          <a className="link" href="https://juanberro-back.github.io/metaverso/" target="_blank" rel="noreferrer">
            demo publicada
          </a>
        </footer>

        <p className="start-honest">
          Honestidad de la demo: no hay backend multijugador, ni otros usuarios, ni datos reales. Todas las cifras de
          las estaciones son DEMO y las mascotas son decorativas.
        </p>
      </div>
    </div>
  )
}

/** Al entrar desde el panel de pausa, el puntero se vuelve a capturar. */
export function reanudar() {
  lockPointer()
}

export { unlockPointer }
