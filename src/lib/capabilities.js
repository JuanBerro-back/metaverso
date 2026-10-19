/**
 * Detección de capacidades del navegador y banderas de funcionalidad.
 *
 * Todo es tolerante a fallos: si una comprobación lanza una excepción
 * (navegadores antiguos, políticas enterprise, iframes restringidos…)
 * devolvemos un resultado "no disponible" en lugar de propagar el error.
 */

/** ¿Está habilitada la capa WebXR? Se puede desactivar con VITE_ENABLE_XR=false o con ?xr=0 */
export const XR_ENABLED = (() => {
  try {
    const fromEnv = String(import.meta.env.VITE_ENABLE_XR ?? 'true').toLowerCase()
    if (fromEnv === 'false' || fromEnv === '0') return false
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('xr')
      if (q === '0' || q === 'false') return false
    }
    return true
  } catch {
    return true
  }
})()

/** URL del backend multijugador opcional. Vacío = modo demostración local. */
export const WS_URL = (() => {
  try {
    return String(import.meta.env.VITE_WS_URL || '').trim()
  } catch {
    return ''
  }
})()

/**
 * Prueba real de WebGL: intenta crear un contexto con el mismo perfil que usará
 * Three.js. Devuelve { ok, reason, renderer }.
 */
export function detectWebGL() {
  if (typeof document === 'undefined') return { ok: false, reason: 'sin-documento' }
  try {
    const canvas = document.createElement('canvas')
    const attributes = {
      alpha: true,
      depth: true,
      stencil: true,
      antialias: false,
      powerPreference: 'default',
      failIfMajorPerformanceCaveat: false,
    }
    const gl =
      canvas.getContext('webgl2', attributes) ||
      canvas.getContext('webgl', attributes) ||
      canvas.getContext('experimental-webgl', attributes)

    if (!gl) return { ok: false, reason: 'contexto-no-creado' }

    let renderer = ''
    try {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info')
      renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER))
    } catch {
      renderer = 'desconocido'
    }

    // Libera el contexto de prueba para no consumir uno de los limitados del navegador.
    try {
      const lose = gl.getExtension('WEBGL_lose_context')
      if (lose) lose.loseContext()
    } catch {
      /* opcional */
    }

    return { ok: true, renderer, version: gl instanceof WebGL2RenderingContext ? 'webgl2' : 'webgl1' }
  } catch (err) {
    return { ok: false, reason: 'excepcion', error: err?.message || String(err) }
  }
}

/** ¿Soporta el dispositivo WebXR inmersivo (gafas)? Nunca lanza. */
export async function detectWebXR() {
  if (!XR_ENABLED) return { supported: false, reason: 'desactivado' }
  try {
    if (typeof navigator === 'undefined' || !navigator.xr) {
      return { supported: false, reason: 'sin-navigator-xr' }
    }
    const supported = await navigator.xr.isSessionSupported('immersive-vr')
    return { supported: Boolean(supported), reason: supported ? 'ok' : 'sin-immersive-vr' }
  } catch (err) {
    return { supported: false, reason: 'excepcion', error: err?.message || String(err) }
  }
}

/** Detección simple de dispositivo táctil / móvil. */
export function isTouchDevice() {
  try {
    if (typeof window === 'undefined') return false
    const mm = window.matchMedia
    if (mm) {
      // Puntero principal grueso (dedo) → modo táctil.
      if (mm('(pointer: coarse)').matches) return true
      // Puntero principal fino (ratón/trackpad): portátil con pantalla táctil,
      // se usa el modo escritorio normal. El modo táctil queda a mano en el menú.
      if (mm('(any-pointer: fine)').matches) return false
      if (mm('(any-pointer: coarse)').matches) return true
    }
    return 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0
  } catch {
    return false
  }
}

/** Preferencia de movimiento reducido (accesibilidad). */
export function prefersReducedMotion() {
  try {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  } catch {
    return false
  }
}

/** devicePixelRatio acotado: protege gafas autónomas y móviles de gama baja. */
export function clampedPixelRatio(max = 2) {
  try {
    return Math.min(Math.max(window.devicePixelRatio || 1, 1), max)
  } catch {
    return 1
  }
}

/**
 * Mensaje de ayuda accionable según el motivo del fallo de WebGL.
 * Se usa en la pantalla de recuperación.
 */
export function webglHelp(reason) {
  switch (reason) {
    case 'contexto-no-creado':
      return [
        'Activa la aceleración por hardware en tu navegador (Ajustes → Sistema → "Usar aceleración gráfica cuando esté disponible") y reinícialo.',
        'Si estás en un equipo remoto, en una máquina virtual o por Escritorio Remoto, prueba en el equipo local.',
        'Comprueba si hay una política de empresa que bloquee WebGL: visita chrome://gpu y busca "WebGL".',
        'Actualiza los controladores de la tarjeta gráfica.',
      ]
    case 'excepcion':
      return [
        'Recarga la página con Ctrl + F5 para descartar un fallo puntual de inicialización.',
        'Cierra otras pestañas con contenido 3D pesado y vuelve a intentarlo.',
        'Prueba con otro navegador actualizado (Chrome, Edge o Firefox recientes).',
      ]
    default:
      return [
        'Recarga la página para volver a intentarlo.',
        'Prueba con un navegador actualizado con aceleración por hardware activada.',
      ]
  }
}
