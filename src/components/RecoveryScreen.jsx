/**
 * Pantalla de recuperación.
 *
 * Sustituye al mensaje genérico "Ocurrió un problema al renderizar la escena".
 * Nunca deja la pantalla en blanco: siempre explica QUÉ pasó, ofrece ayuda
 * accionable y un botón para volver a intentarlo.
 */
export function RecoveryScreen({
  title = 'No se pudo iniciar el visor 3D',
  message,
  help = [],
  error,
  onRetry,
  retryLabel = 'Reintentar',
  extraActions = null,
}) {
  return (
    <div className="recovery" role="alertdialog" aria-modal="true" aria-labelledby="recovery-title">
      <div className="recovery-card">
        <span className="recovery-badge">XUPPLY · Metaverso</span>
        <h1 id="recovery-title" className="recovery-title">
          {title}
        </h1>

        {message && <p className="recovery-message">{message}</p>}

        {help.length > 0 && (
          <>
            <h2 className="recovery-subtitle">Cómo solucionarlo</h2>
            <ul className="recovery-help">
              {help.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </>
        )}

        <div className="recovery-actions">
          {onRetry && (
            <button type="button" className="btn btn-primary btn-lg" onClick={onRetry}>
              {retryLabel}
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => window.location.reload()}>
            Recargar página
          </button>
          {extraActions}
        </div>

        {error && (
          <details className="recovery-details">
            <summary>Detalle técnico (para soporte)</summary>
            <pre>{typeof error === 'string' ? error : error.message || String(error)}</pre>
          </details>
        )}

        <p className="recovery-foot">
          Modo demostración local · Este recorrido no necesita conexión ni backend.
        </p>
      </div>
    </div>
  )
}
