import * as THREE from 'three'

const FONT = 'Segoe UI, system-ui, -apple-system, Arial, sans-serif'

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line ? line + ' ' + word : word
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate
    } else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

function fitFont(ctx, text, maxWidth, maxSize, weight) {
  let size = maxSize
  while (size > 26) {
    ctx.font = `${weight} ${size}px ${FONT}`
    if (ctx.measureText(text).width <= maxWidth) break
    size -= 2
  }
  return size
}

function paintPoster(canvas, { num, title, subtitle, body, accent }) {
  const W = canvas.width
  const H = canvas.height
  const ctx = canvas.getContext('2d')

  // Fondo de seguridad: siempre oscuro, nunca blanco
  ctx.fillStyle = '#10141f'
  ctx.fillRect(0, 0, W, H)

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#151b2c')
  bg.addColorStop(0.6, '#20293e')
  bg.addColorStop(1, '#10141f')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Número de agua
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.font = `800 190px ${FONT}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(num, W - 40, 210)
  ctx.restore()

  // Banda superior
  ctx.save()
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, W, 96)
  ctx.fillStyle = 'rgba(10,14,26,0.4)'
  ctx.fillRect(0, 0, W, 12)
  ctx.fillStyle = '#0e1424'
  ctx.font = `700 40px ${FONT}`
  ctx.textAlign = 'left'
  ctx.fillText('X U P P L Y · M U S E O', 52, 64)
  ctx.restore()

  // Chip con número
  ctx.save()
  ctx.fillStyle = accent
  roundRect(ctx, 52, 130, 150, 96, 18)
  ctx.fill()
  ctx.fillStyle = '#0e1424'
  ctx.font = `800 52px ${FONT}`
  ctx.textAlign = 'left'
  ctx.fillText(num, 70, 198)
  ctx.restore()

  // Título (ajustado a su tamaño real)
  const tSize = fitFont(ctx, title, W - 104, 92, 800)
  ctx.font = `800 ${tSize}px ${FONT}`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  const titleY = 320
  ctx.fillText(title, 52, titleY)

  // Subrayado
  ctx.fillStyle = accent
  ctx.fillRect(54, titleY + 22, 150, 10)

  // Subtítulo
  ctx.font = `italic 400 40px ${FONT}`
  ctx.fillStyle = '#b9c6e2'
  ctx.fillText(subtitle, 52, titleY + 92)

  // Separador
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(52, titleY + 122)
  ctx.lineTo(W - 52, titleY + 122)
  ctx.stroke()

  // Cuerpo: nunca desborda el lienzo
  ctx.font = `400 33px ${FONT}`
  ctx.fillStyle = '#e8edf7'
  const maxWidth = W - 104
  let y = titleY + 190
  const bottomLimit = H - 70
  for (const line of body) {
    if (y > bottomLimit) break
    const lines = wrapLines(ctx, line, maxWidth)
    for (const l of lines.slice(0, 3)) {
      if (y > bottomLimit) break
      ctx.fillText(l, 52, y)
      y += 48
    }
  }

  // Pie
  ctx.font = `500 28px ${FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillText('github.com/JuanBerro-back/xupply-D', 52, H - 44)
  ctx.fillStyle = accent
  ctx.textAlign = 'right'
  ctx.font = `600 28px ${FONT}`
  ctx.fillText('● clic para leer', W - 52, H - 44)
  ctx.textAlign = 'left'
}

function makeCanvasTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function makePoster({ num, title, subtitle, body, accent = '#5aa9ff' }) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768
  try {
    paintPoster(canvas, { num, title, subtitle, body, accent })
  } catch (err) {
    console.error('[póster] error al pintar:', err)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#1a2136'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.font = `700 56px ${FONT}`
    ctx.textAlign = 'left'
    ctx.fillText(title || 'XUPPY', 52, 180)
  }
  return makeCanvasTexture(canvas)
}

function paintBanner(canvas) {
  const W = canvas.width
  const H = canvas.height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#0b0f18'
  ctx.fillRect(0, 0, W, H)

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0c111e')
  bg.addColorStop(0.5, '#16203a')
  bg.addColorStop(1, '#0b0f18')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.strokeStyle = 'rgba(90,169,255,0.5)'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(W / 2, H / 2, 300, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(W / 2, H / 2, 340, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = `900 260px ${FONT}`
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(90,169,255,0.6)'
  ctx.shadowBlur = 40
  ctx.fillText('XUPPY', W / 2, 360)
  ctx.shadowBlur = 0
  ctx.font = `italic 500 76px ${FONT}`
  ctx.fillStyle = '#8fb4ff'
  ctx.fillText('Ecosistema logístico B2B para el sector gastronómico', W / 2, 480)
  ctx.font = `400 48px ${FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.fillText('Restaurantes · Proveedores mayoristas · Bucaramanga, Colombia', W / 2, 576)
  ctx.fillStyle = '#5aa9ff'
  ctx.fillText('github.com/JuanBerro-back/xupply-D', W / 2, 692)
  ctx.restore()
}

export function makeBanner() {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 768
  try {
    paintBanner(canvas)
  } catch (err) {
    console.error('[banner] error al pintar:', err)
  }
  return makeCanvasTexture(canvas)
}

export function makeFloorTexture() {
  const S = 512
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#282d3b'
  ctx.fillRect(0, 0, S, S)
  const t = S / 4

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#2c3140' : '#282d3b'
      ctx.fillRect(col * t, row * t, t, t)
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'
      ctx.lineWidth = 4
      ctx.strokeRect(col * t + 2, row * t + 2, t - 4, t - 4)
    }
  }

  const texture = makeCanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.LinearFilter
  return texture
}

/* ------------------------------------------------------------------ *
 * Estaciones del Museo Xupply                                         *
 * ------------------------------------------------------------------ */

/**
 * Cartel 3D que corona cada estación (número + nombre del módulo).
 * Se mantiene oscuro con banda de acento, en línea con los carteles del museo.
 */
export function makeStationSign({ num, title, subtitle, accent = '#5aa9ff' }) {
  const W = 1024
  const H = 256
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  try {
    ctx.fillStyle = '#0c1120'
    ctx.fillRect(0, 0, W, H)

    const bg = ctx.createLinearGradient(0, 0, W, 0)
    bg.addColorStop(0, '#141b2c')
    bg.addColorStop(0.55, '#1d2740')
    bg.addColorStop(1, '#10141f')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Banda de acento izquierda
    ctx.fillStyle = accent
    ctx.fillRect(0, 0, 22, H)

    // Chip con el número de módulo
    ctx.fillStyle = accent
    roundRect(ctx, 48, 60, 150, 136, 20)
    ctx.fill()
    ctx.fillStyle = '#0b1020'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `800 74px ${FONT}`
    ctx.fillText(num, 123, 130)

    ctx.textAlign = 'left'
    const size = fitFont(ctx, title, W - 260, 84, 800)
    ctx.font = `800 ${size}px ${FONT}`
    ctx.fillStyle = '#ffffff'
    ctx.fillText(title, 236, 118)

    // Subtítulo: se ajusta al ancho disponible para que no se corte
    const subSize = fitFont(ctx, subtitle || '', W - 238 - 40, 34, 500)
    ctx.font = `500 ${subSize}px ${FONT}`
    ctx.fillStyle = '#b9c6e2'
    ctx.fillText(subtitle || '', 238, 176)

    ctx.font = `600 26px ${FONT}`
    ctx.fillStyle = accent
    ctx.fillText('XUPPY · ESTACIÓN DEL MUSEO', 238, 222)
  } catch (err) {
    console.error('[cartel de estación] error al pintar:', err)
  }

  return makeCanvasTexture(canvas)
}

/**
 * Ficha grande de la estación: explicación + datos DEMO.
 *
 * Se usa en el panel HTML de superposición, en la pizarra 3D dentro de VR y en
 * la pantalla de cada estación del museo.
 *
 * `header: false` omite la banda superior con el número y el título: la usa la
 * estación del museo, que ya lleva ese título en su cabecera física, para que
 * el módulo tenga **un solo cartel** y no repita el nombre dos veces.
 */
export function makeStationSheet(station, { header = true } = {}) {
  const W = 1024
  const H = 768
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const accent = station?.accent || '#5aa9ff'

  try {
    ctx.fillStyle = '#10141f'
    ctx.fillRect(0, 0, W, H)
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#161d2f')
    bg.addColorStop(0.65, '#1e2739')
    bg.addColorStop(1, '#10141f')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Cabecera (solo si se pide: número de módulo + título)
    if (header) {
      ctx.fillStyle = accent
      ctx.fillRect(0, 0, W, 92)
      ctx.fillStyle = '#0b1020'
      ctx.font = `800 44px ${FONT}`
      ctx.textAlign = 'left'
      ctx.fillText(`${station?.num || ''} · ${String(station?.title || '').toUpperCase()}`, 44, 62)
    }

    // Entradilla
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = `700 40px ${FONT}`
    const y0 = header ? 150 : 74
    const lead = wrapLines(ctx, station?.pitch || '', W - 88)
    let y = y0
    for (const line of lead.slice(0, 3)) {
      ctx.fillText(line, 44, y)
      y += 48
    }

    // Puntos clave
    ctx.font = `400 30px ${FONT}`
    ctx.fillStyle = '#dbe4f5'
    y += 18
    for (const bullet of (station?.bullets || []).slice(0, 4)) {
      ctx.fillStyle = accent
      ctx.fillText('•', 44, y)
      ctx.fillStyle = '#dbe4f5'
      for (const line of wrapLines(ctx, bullet, W - 96).slice(0, 2)) {
        ctx.fillText(line, 78, y)
        y += 38
      }
      y += 6
    }

    // Tabla de datos DEMO
    const demo = station?.demo
    if (demo?.rows?.length) {
      y += 10
      ctx.font = `700 26px ${FONT}`
      ctx.fillStyle = accent
      ctx.fillText(String(demo.note || 'Datos DEMO'), 44, y)
      y += 34
      ctx.font = `500 24px ${FONT}`
      ctx.fillStyle = '#9fb0cc'
      ctx.fillText((demo.columns || []).join('   ·   '), 44, y)
      y += 32
      ctx.fillStyle = '#e8edf7'
      ctx.font = `400 24px ${FONT}`
      for (const row of demo.rows.slice(0, 4)) {
        if (y > H - 40) break
        ctx.fillText(row.join('   ·   '), 44, y)
        y += 32
      }
    }

    ctx.font = `500 22px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.textAlign = 'right'
    ctx.fillText('Datos ficticios · modo demostración local', W - 44, H - 26)
  } catch (err) {
    console.error('[ficha de estación] error al pintar:', err)
    ctx.fillStyle = '#1a2136'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#ffffff'
    ctx.font = `700 52px ${FONT}`
    ctx.textAlign = 'left'
    ctx.fillText(station?.title || 'Estación', 44, 140)
  }

  return makeCanvasTexture(canvas)
}

/* ------------------------------------------------------------------ *
 * Pizarra de ayuda de VR                                              *
 * ------------------------------------------------------------------ */

/** Contenido de la pizarra de bienvenida que se muestra al entrar en VR. */
const AYUDA_VR = {
  titulo: 'Bienvenido al Museo Xupply',
  entrada: 'Estás dentro del museo, en primera persona. No hay otros visitantes: el recorrido es solo tuyo.',
  controles: [
    ['Gatillo al suelo', 'teletransportarte donde apuntes'],
    ['Gatillo al cartel', 'abrir su ficha en esta pizarra'],
    ['Joystick izquierdo', 'avanzar y desplazarte'],
    ['Joystick derecho', 'girar 30° por pasos (sin mareo)'],
    ['Cualquier mando', 'sirve: Quest, Pico, Index, Vive…'],
  ],
}

/**
 * Pizarra de ayuda para el visor: explica los controles sin depender de la
 * interfaz HTML (que no existe dentro de VR). Mismo tamaño que la ficha de
 * estación para reutilizar el mismo plano.
 */
export function makeHelpSheet() {
  const W = 1024
  const H = 768
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const accent = '#3ee6a0'

  try {
    ctx.fillStyle = '#10141f'
    ctx.fillRect(0, 0, W, H)
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#161d2f')
    bg.addColorStop(0.65, '#1e2739')
    bg.addColorStop(1, '#10141f')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Cabecera
    ctx.fillStyle = accent
    ctx.fillRect(0, 0, W, 92)
    ctx.fillStyle = '#08110d'
    ctx.font = `800 40px ${FONT}`
    ctx.textAlign = 'left'
    ctx.fillText('VR · CÓMO MOVERTE POR EL MUSEO', 44, 62)

    // Título
    ctx.fillStyle = '#ffffff'
    const tSize = fitFont(ctx, AYUDA_VR.titulo, W - 88, 56, 800)
    ctx.font = `800 ${tSize}px ${FONT}`
    ctx.fillText(AYUDA_VR.titulo, 44, 180)

    // Entradilla
    ctx.font = `400 30px ${FONT}`
    ctx.fillStyle = '#c9d6ef'
    let y = 234
    for (const line of wrapLines(ctx, AYUDA_VR.entrada, W - 88).slice(0, 3)) {
      ctx.fillText(line, 44, y)
      y += 42
    }

    // Controles
    y += 12
    for (const [tecla, texto] of AYUDA_VR.controles) {
      ctx.font = `700 28px ${FONT}`
      const ancho = ctx.measureText(tecla).width
      roundRect(ctx, 44, y - 26, ancho + 34, 44, 12)
      ctx.fillStyle = 'rgba(62,230,160,0.16)'
      ctx.fill()
      ctx.strokeStyle = accent
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = accent
      ctx.fillText(tecla, 61, y + 4)

      ctx.font = `400 26px ${FONT}`
      ctx.fillStyle = '#e8edf7'
      ctx.fillText(texto, 44 + ancho + 62, y + 4)
      y += 68
      if (y > H - 90) break
    }

    // Pie
    ctx.font = `500 24px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.textAlign = 'left'
    ctx.fillText('Modo demostración local · datos ficticios · sin otros usuarios', 44, H - 40)
  } catch (err) {
    console.error('[ayuda de VR] error al pintar:', err)
    ctx.fillStyle = '#1a2136'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#ffffff'
    ctx.font = `700 52px ${FONT}`
    ctx.textAlign = 'left'
    ctx.fillText('VR: gatillo para teletransportarte', 44, 140)
  }

  return makeCanvasTexture(canvas)
}
