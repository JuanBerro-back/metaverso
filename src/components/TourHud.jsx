import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store.js'
import { TOUR_MODULOS, TOUR_STEPS, TOUR_TOTAL } from '../tour/steps.js'

/**
 * Barra del recorrido guiado ("modo presentación").
 *
 * Se mantiene siempre visible mientras el recorrido está activo y ofrece:
 * barra de progreso, narración del paso, Siguiente / Anterior / Reiniciar,
 * salto directo a un módulo, pantalla completa y salida del recorrido.
 *
 * No se muestra en VR (los paneles HTML no existen en el espacio inmersivo);
 * allí la información se pinta en la pizarra 3D (`XRInfoBoard`).
 */
export function TourHud() {
  const active = useStore((s) => s.tour.active)
  const step = useStore((s) => s.tour.step)
  const view = useStore((s) => s.view)
  const xrActive = useStore((s) => s.xrActive)

  const [pantallaCompleta, setPantallaCompleta] = useState(false)

  // Índice en TOUR_STEPS de cada módulo, para el desplegable "Saltar a módulo".
  const opciones = useMemo(
    () => TOUR_MODULOS.map((m) => ({ id: m.station, label: `${m.title}`, index: TOUR_STEPS.indexOf(m) })),
    []
  )

  const pasoActual = TOUR_STEPS[step]
  const indiceModulo = opciones.find((o) => o.index === step)?.id || ''

  useEffect(() => {
    const onChange = () => setPantallaCompleta(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  if (!active || view !== 'world' || xrActive || !pasoActual) return null

  const total = TOUR_TOTAL
  const progreso = ((step + 1) / total) * 100
  const esUltimo = step >= total - 1

  const ir = (destino) => useStore.getState().gotoStep(destino, total)
  const salir = () => useStore.getState().stopTour()
  const terminar = () => useStore.getState().finishTour()

  const alternarPantallaCompleta = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen()
      else document.documentElement.requestFullscreen?.()
    } catch {
      /* algunos navegadores lo bloquean: no es crítico */
    }
  }

  return (
    <section className="tour-hud" aria-label="Recorrido guiado">
      <div className="tour-progress" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1}>
        <span style={{ width: `${progreso}%` }} />
      </div>

      <div className="tour-row">
        <div className="tour-text">
          <p className="tour-step-count">
            Paso {step + 1} de {total} · Modo presentación
          </p>
          <h2 className="tour-title">{pasoActual.title}</h2>
          <p className="tour-desc">{pasoActual.text}</p>
          {pasoActual.metrica && <p className="tour-metrica">{pasoActual.metrica}</p>}
        </div>

        <div className="tour-controls">
          <div className="tour-buttons">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => ir(step - 1)}
              disabled={step === 0}
            >
              ‹ Anterior
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => (esUltimo ? terminar() : ir(step + 1))}
            >
              {esUltimo ? 'Terminar recorrido' : 'Siguiente ›'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => ir(0)}>
              ⟲ Reiniciar
            </button>
          </div>

          <div className="tour-buttons">
            <label className="tour-select">
              <span className="sr-only">Saltar a módulo</span>
              <select
                value={indiceModulo}
                onChange={(e) => {
                  const op = opciones.find((o) => o.id === e.target.value)
                  if (op) ir(op.index)
                }}
              >
                <option value="">Saltar a módulo…</option>
                {opciones.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={alternarPantallaCompleta}
              aria-pressed={pantallaCompleta}
            >
              {pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
            </button>

            <button type="button" className="btn btn-ghost btn-sm" onClick={salir}>
              Salir del recorrido
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={terminar}>
              Saltar recorrido
            </button>
          </div>
        </div>
      </div>

      <p className="tour-hint">
        También puedes moverte con <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> y abrir cualquier estación con{' '}
        <kbd>E</kbd>. Pulsa <kbd>M</kbd> para salir del recorrido.
      </p>
    </section>
  )
}
