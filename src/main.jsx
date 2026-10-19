import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import { showBootRecovery } from './lib/bootFallback.js'

/**
 * Manejo global de errores.
 *
 * Cubre los fallos que React no puede capturar (errores al evaluar el bundle,
 * módulos que no cargan, promesas rechazadas antes del montaje). Si la app ya
 * está montada, dejamos que el ErrorBoundary de React haga su trabajo y solo
 * registramos el error en consola para no tapar la interfaz del usuario.
 */
let appMounted = false
export function markAppMounted() {
  appMounted = true
  // Desactiva la red de seguridad definida en index.html.
  window.__XUPPLY_MOUNTED__ = true
}

const HELP_COMMON = [
  'Recarga la página con Ctrl + F5 (o Cmd + Shift + R) para evitar una versión antigua en caché.',
  'Comprueba tu conexión: la primera carga descarga el motor 3D.',
  'Si el problema continúa, abre la consola del navegador (F12) y copia el detalle técnico.',
]

window.addEventListener('error', (event) => {
  if (appMounted) {
    console.error('[Xupply] error no capturado:', event.error || event.message)
    return
  }
  console.error('[Xupply] error durante el arranque:', event.error || event.message)
  showBootRecovery({
    title: 'No se pudo iniciar la aplicación',
    message: 'Se produjo un error antes de que el metaverso terminara de cargar.',
    help: HELP_COMMON,
    error: event.error || event.message,
  })
})

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  console.warn('[Xupply] promesa rechazada:', reason)
  if (appMounted) return
  showBootRecovery({
    title: 'No se pudo iniciar la aplicación',
    message: 'Un recurso necesario no respondió correctamente durante la carga.',
    help: HELP_COMMON,
    error: reason,
  })
})

const container = document.getElementById('root')

if (!container) {
  showBootRecovery({
    title: 'Falta el contenedor de la aplicación',
    message: 'El documento HTML no contiene el nodo #root esperado.',
    help: ['Asegúrate de servir el index.html generado por el build de Vite.'],
  })
} else {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <App onMounted={markAppMounted} />
    </React.StrictMode>
  )
}
