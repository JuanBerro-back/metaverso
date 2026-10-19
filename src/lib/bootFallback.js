/**
 * Red de seguridad de arranque (sin React, sin CSS externo).
 *
 * Se usa si algo falla ANTES o DURANTE el montaje de React: error de sintaxis
 * del bundle, fallo al descargar un módulo, excepción no capturada…
 * Escribe el aviso directamente en el DOM con estilos en línea para que se vea
 * incluso si la hoja de estilos no llegó a cargar. Objetivo: nunca pantalla en blanco.
 */

const estiloCard = [
  'position:fixed',
  'inset:0',
  'z-index:2147483647',
  'display:flex',
  'align-items:center',
  'justify-content:center',
  'padding:24px',
  'background:radial-gradient(circle at 50% 0%,#182338 0%,#0a0e17 60%)',
  'color:#e8eefc',
  'font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif',
  'overflow:auto',
].join(';')

const estiloCaja = [
  'max-width:560px',
  'width:100%',
  'background:rgba(18,24,38,0.96)',
  'border:1px solid rgba(120,170,255,0.32)',
  'border-radius:18px',
  'padding:28px 26px',
  'box-shadow:0 24px 60px rgba(0,0,0,0.55)',
].join(';')

function escapeHtml(text) {
  return String(text == null ? '' : text).replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&#39;'
    }
  })
}

/**
 * Muestra la pantalla de recuperación de arranque.
 * @param {{title?:string,message?:string,help?:string[],error?:any}} opciones
 */
export function showBootRecovery({ title, message, help = [], error } = {}) {
  try {
    const root = document.getElementById('root') || document.body
    if (!root) return
    const detalle = error ? (error.stack || error.message || String(error)) : ''

    root.innerHTML = `
      <div style="${estiloCard}" role="alertdialog" aria-modal="true">
        <div style="${estiloCaja}">
          <p style="margin:0 0 10px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#7fb2ff">Xupply · Metaverso</p>
          <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#ffffff">${escapeHtml(title || 'No se pudo cargar el metaverso')}</h1>
          ${
            message
              ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c3cee4">${escapeHtml(message)}</p>`
              : ''
          }
          ${
            help.length
              ? `<ul style="margin:0 0 20px;padding-left:20px;color:#c3cee4;font-size:14px;line-height:1.6">${help
                  .map((h) => `<li>${escapeHtml(h)}</li>`)
                  .join('')}</ul>`
              : ''
          }
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button type="button" onclick="window.location.reload()"
              style="flex:1 1 160px;min-height:48px;padding:12px 18px;border-radius:12px;border:0;cursor:pointer;font-size:15px;font-weight:700;background:linear-gradient(135deg,#4f9dff,#2b6fe0);color:#04101f">
              Reintentar
            </button>
          </div>
          ${
            detalle
              ? `<details style="margin-top:18px"><summary style="cursor:pointer;font-size:13px;color:#8fa4c8">Detalle técnico (para soporte)</summary><pre style="white-space:pre-wrap;word-break:break-word;font-size:12px;color:#ffb4b4;background:rgba(0,0,0,.35);padding:10px;border-radius:10px;margin-top:8px">${escapeHtml(
                  detalle
                )}</pre></details>`
              : ''
          }
          <p style="margin:18px 0 0;font-size:12px;color:#7d8cab">Modo demostración local · sin backend ni conexión.</p>
        </div>
      </div>`
  } catch {
    /* si hasta esto falla, al menos el navegador mostrará algo */
  }
}

/** Elimina la pantalla de recuperación (antes de montar React). */
export function clearBootRecovery() {
  try {
    const el = document.getElementById('root')
    if (el && el.firstElementChild && el.firstElementChild.getAttribute('role') === 'alertdialog') {
      el.innerHTML = ''
    }
  } catch {
    /* noop */
  }
}
