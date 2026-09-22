import * as THREE from 'three'

const FONT = 'Segoe UI, system-ui, -apple-system, Arial, sans-serif'

export function makeTex(canvas, wrap = false) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  if (wrap) {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.magFilter = THREE.LinearFilter
  }
  return texture
}

export function makeWarehouseFloor() {
  const S = 1024
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#2a2e39'
  ctx.fillRect(0, 0, S, S)

  ctx.strokeStyle = 'rgba(15,18,24,0.55)'
  ctx.lineWidth = 12
  for (let i = 0; i <= S; i += S / 4) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, S)
    ctx.moveTo(0, i)
    ctx.lineTo(S, i)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 4
  for (let i = 0; i <= S; i += S / 8) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, S)
    ctx.moveTo(0, i)
    ctx.lineTo(S, i)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(62, 230, 160, 0.16)'
  ctx.fillRect(0, S * 0.42, S, S * 0.16)

  ctx.fillStyle = 'rgba(62, 230, 160, 0.12)'
  ctx.fillRect(S * 0.3, S * 0.42, S * 0.4, S * 0.04)

  ctx.fillStyle = '#151a22'
  ctx.font = `700 44px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText('ZONA DE CLASIFICACIÓN', S * 0.5, S * 0.2)

  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = `500 30px ${FONT}`
  ctx.fillText('Bandas Nº1 · Nº2 · Nº3 · Cargue y despacho', S * 0.5, S * 0.27)

  return makeTex(canvas, true)
}

export function makeForestFloor() {
  const S = 1024
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#3d5a33'
  ctx.fillRect(0, 0, S, S)

  for (let i = 0; i < 2800; i++) {
    const x = Math.random() * S
    const y = Math.random() * S
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(74,104,55,0.85)' : 'rgba(50,78,40,0.85)'
    ctx.fillRect(x, y, 2 + Math.random() * 5, 2 + Math.random() * 7)
  }

  for (let i = 0; i < 420; i++) {
    const x = Math.random() * S
    const y = S * 0.5 + (Math.random() - 0.5) * S * 0.56
    ctx.fillStyle = 'rgba(84,62,40,0.85)'
    ctx.fillRect(x, y, 3 + Math.random() * 8, 3 + Math.random() * 6)
  }

  for (let i = 0; i < 60; i++) {
    const x = Math.random() * S
    const y = Math.random() * S
    ctx.fillStyle = 'rgba(214,190,120,0.25)'
    ctx.beginPath()
    ctx.arc(x, y, 2 + Math.random() * 4, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.strokeStyle = 'rgba(30,20,12,0.35)'
  ctx.lineWidth = 28
  ctx.beginPath()
  ctx.moveTo(0, S * 0.5)
  ctx.lineTo(S, S * 0.5)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(40,28,18,0.2)'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(0, S * 0.42)
  ctx.lineTo(S, S * 0.42)
  ctx.moveTo(0, S * 0.58)
  ctx.lineTo(S, S * 0.58)
  ctx.stroke()

  return makeTex(canvas, true)
}

export function makeBelt() {
  const W = 512
  const H = 256
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#1c2029'
  ctx.fillRect(0, 0, W, H)

  const s = 84
  for (let x = -H; x < W + H; x += s) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + H, H)
    ctx.lineTo(x + H + 26, H)
    ctx.lineTo(x + 26, 0)
    ctx.closePath()
    ctx.fillStyle = '#262c38'
    ctx.fill()
    ctx.strokeStyle = '#303744'
    ctx.lineWidth = 3
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.fillRect(0, 0, W, 6)

  return makeTex(canvas, true)
}

export function makePortalTexture(hex = '#3ee6a0') {
  const S = 512
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  const cx = S / 2
  const cy = S / 2

  ctx.fillStyle = '#0a0e15'
  ctx.fillRect(0, 0, S, S)

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, S / 2)
  grad.addColorStop(0, 'rgba(5,8,12,1)')
  grad.addColorStop(0.5, 'rgba(10,16,24,0.85)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, S, S)

  for (let arm = 0; arm < 3; arm++) {
    ctx.strokeStyle = hex
    ctx.lineCap = 'round'
    for (let step = 0; step < 56; step++) {
      const u = step / 56
      const r = S * (0.1 + u * 0.42)
      const a0 = arm * ((Math.PI * 2) / 3) + u * 4.2
      ctx.globalAlpha = 0.62 - u * 0.45
      ctx.lineWidth = S * 0.05 - u * S * 0.03
      ctx.beginPath()
      ctx.arc(cx, cy, r, a0, a0 + 0.3, false)
      ctx.stroke()
    }
  }

  ctx.globalAlpha = 1
  for (let i = 0; i < 34; i++) {
    const a = Math.random() * Math.PI * 2
    const r = S * (0.12 + Math.random() * 0.38)
    ctx.fillStyle = hex
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.5 + Math.random() * 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  return makeTex(canvas)
}

export function makePortalLabel(text, accent) {
  const W = 512
  const H = 128
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#0c1119'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = accent
  ctx.lineWidth = 6
  ctx.strokeRect(4, 4, W - 8, H - 8)

  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = `600 22px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText('PORTAL', W / 2, 34)

  ctx.fillStyle = '#ffffff'
  ctx.font = `800 44px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText(String(text).toUpperCase(), W / 2, 96)

  return makeTex(canvas)
}

export function makeLabel(name, accent) {
  const W = 512
  const H = 128
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#0e1424'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = accent
  ctx.lineWidth = 6
  ctx.strokeRect(4, 4, W - 8, H - 8)

  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = `600 22px ${FONT}`
  ctx.textAlign = 'left'
  ctx.fillText('XUPPY · TOLVA', 24, 36)

  ctx.fillStyle = '#ffffff'
  ctx.font = `800 52px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText(name.toUpperCase(), W / 2, 92)

  return makeTex(canvas)
}

export function makeSign() {
  const W = 2048
  const H = 512
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0c111c')
  bg.addColorStop(0.55, '#141c2e')
  bg.addColorStop(1, '#0c111c')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = '#3ee6a0'
  ctx.lineWidth = 6
  ctx.strokeRect(10, 10, W - 20, H - 20)

  ctx.save()
  ctx.fillStyle = '#ffffff'
  ctx.font = `900 216px ${FONT}`
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(62,230,160,0.55)'
  ctx.shadowBlur = 46
  ctx.fillText('Z U P P L Y', W / 2, 280)
  ctx.restore()

  ctx.fillStyle = '#3ee6a0'
  ctx.font = `italic 700 62px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText('CENTRO DE CLASIFICACIÓN · BANDA LOGÍSTICA', W / 2, 380)

  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = `500 40px ${FONT}`
  ctx.fillText('Restaurantes · Proveedores · Bodegas · Bucaramanga', W / 2, 456)

  return makeTex(canvas)
}