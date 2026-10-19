import { useEffect } from 'react'
import { useStore } from '../store.js'
import { DEMO_DISCLAIMER, STATIONS, STATION_MAP } from '../museum/stations.js'
import { TOUR_TOTAL, tourStepIndex } from '../tour/steps.js'
import { lockPointer } from './PointerLock.jsx'

/**
 * Ficha de una estación del Museo Xupply.
 *
 * Se muestra como panel lateral (no como modal a pantalla completa) para que
 * la estación 3D siga viéndose mientras se lee la explicación: es el modo
 * presentación.
 *
 * Toda la sección "Ejemplo" va marcada como DEMO: son datos ficticios para
 * explicar el módulo, nunca datos reales.
 */
export function StationPanel({ stationId }) {
  const station = STATION_MAP[stationId]
  const tourActive = useStore((s) => s.tour.active)

  /** Cierra la ficha y devuelve el control al museo. */
  const cerrar = () => {
    useStore.getState().setStation(null)
    if (!document.pointerLockElement) lockPointer()
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'KeyC' || e.code === 'Escape') {
        if (!useStore.getState().station) return
        e.preventDefault()
        useStore.getState().setStation(null)
        if (!document.pointerLockElement) lockPointer()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!station) return null

  /** Avanza el recorrido guiado (o lo termina si ya estamos en el cierre). */
  const continuarRecorrido = () => {
    const st = useStore.getState()
    if (st.tour.step >= TOUR_TOTAL - 1) st.finishTour()
    else st.gotoStep(st.tour.step + 1, TOUR_TOTAL)
  }

  /** Abre la siguiente estación sin recorrido guiado. */
  const siguienteModulo = () => {
    const i = STATIONS.findIndex((s) => s.id === station.id)
    const siguiente = STATIONS[(i + 1) % STATIONS.length]
    useStore.getState().setStation(siguiente.id)
  }

  /** Empieza el recorrido guiado justo en este módulo. */
  const recorrerDesdeAqui = () => {
    const st = useStore.getState()
    const idx = tourStepIndex(station.id)
    st.startTour()
    if (idx >= 0) st.gotoStep(idx, TOUR_TOTAL)
  }

  return (
    <aside
      className="station-panel"
      style={{ '--accent': station.accent }}
      role="dialog"
      aria-modal="false"
      aria-labelledby="station-title"
    >
      <header className="station-head">
        <span className="station-num">{station.num}</span>
        <div className="station-head-text">
          <h2 id="station-title">{station.title}</h2>
          <p>{station.subtitle}</p>
        </div>
        <button type="button" className="station-x" onClick={cerrar} aria-label="Cerrar la ficha de la estación">
          ×
        </button>
      </header>

      <div className="station-body">
        <p className="station-pitch">{station.pitch}</p>

        <ul className="station-bullets">
          {station.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>

        <p className="station-how">
          <strong>Cómo funciona · </strong>
          {station.how}
        </p>

        <section className="station-demo" aria-labelledby="station-demo-title">
          <h3 id="station-demo-title">Ejemplo ilustrativo</h3>
          <p className="station-demo-note">
            <span aria-hidden="true">⚠ </span>
            {station.demo.note}
          </p>

          <div className="demo-table-wrap">
            <table className="demo-table">
              <thead>
                <tr>
                  {station.demo.columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {station.demo.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="demo-metrics">
            {station.demo.metrics.map((m) => (
              <div className="demo-metric" key={m.label}>
                <span>{m.label}</span>
                <strong>{m.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <p className="station-disclaimer">{DEMO_DISCLAIMER}</p>
      </div>

      <footer className="station-actions">
        {tourActive ? (
          <>
            <button type="button" className="btn btn-primary" onClick={continuarRecorrido}>
              Continuar el recorrido ›
            </button>
            <button type="button" className="btn btn-ghost" onClick={cerrar}>
              Volver al recorrido
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-primary" onClick={siguienteModulo}>
              Siguiente módulo ›
            </button>
            <button type="button" className="btn btn-ghost" onClick={recorrerDesdeAqui}>
              Ver como recorrido guiado
            </button>
            <button type="button" className="btn btn-ghost" onClick={cerrar}>
              Volver al recorrido
            </button>
          </>
        )}
        <p className="station-close-hint">
          Cierra con <kbd>C</kbd> o <kbd>ESC</kbd>
        </p>
      </footer>
    </aside>
  )
}
