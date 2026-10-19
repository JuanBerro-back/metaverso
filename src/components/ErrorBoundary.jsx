import { Component, Fragment } from 'react'

/**
 * ErrorBoundary con posibilidad de reintentar.
 *
 * A diferencia de la versión anterior, pasa el error al fallback y permite
 * reiniciar el subárbol (`onRetry`) sin recargar la página entera: al cambiar
 * `resetKey` se desmonta y vuelve a montarse el contenido, lo que recrea el
 * contexto WebGL desde cero.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, resetKey: 0 }
    this.handleRetry = this.handleRetry.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[Xupply] error capturado por ErrorBoundary:', error, info)
    if (typeof this.props.onError === 'function') {
      try {
        this.props.onError(error, info)
      } catch {
        /* noop */
      }
    }
  }

  handleRetry() {
    this.setState((s) => ({ error: null, resetKey: s.resetKey + 1 }))
  }

  render() {
    if (this.state.error) {
      const { fallback } = this.props
      if (typeof fallback === 'function') {
        return fallback({ error: this.state.error, retry: this.handleRetry })
      }
      return fallback ?? null
    }

    const { children, resetKeyProp } = this.props
    // La key combina el reinicio interno con una prop externa (p. ej. la calidad
    // gráfica elegida por el usuario) para forzar el remontaje completo.
    return <Fragment key={`${this.state.resetKey}-${resetKeyProp ?? ''}`}>{children}</Fragment>
  }
}
