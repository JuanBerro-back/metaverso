/**
 * Colisiones 2D (cajas alineadas a los ejes) contra una lista de colisionadores.
 *
 * El museo es una planta rectangular; resolver las colisiones en el plano XZ
 * con cajas es suficiente, barato y estable. Devuelve la posición corregida.
 */

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

/**
 * @param {number} x posición propuesta en X
 * @param {number} z posición propuesta en Z
 * @param {number} radius radio del avatar
 * @param {{x:number,z:number,hw:number,hd:number}[]} colliders cajas (hw/hd = semiancho/semilargo)
 * @param {number} bound límite del recinto (cuadrado centrado en el origen)
 */
export function resolveColliders(x, z, radius, colliders, bound) {
  for (const c of colliders) {
    // Punto de la caja más cercano al avatar.
    const dx = clamp(x - c.x, -c.hw, c.hw)
    const dz = clamp(z - c.z, -c.hd, c.hd)
    const vx = x - c.x - dx
    const vz = z - c.z - dz
    const dist = Math.hypot(vx, vz)

    if (dist < radius) {
      if (dist < 1e-4) {
        // Centro del avatar dentro de la caja: lo empujamos al borde más cercano.
        const outX = c.hw + radius - Math.abs(x - c.x)
        const outZ = c.hd + radius - Math.abs(z - c.z)
        if (outX < outZ) x += Math.sign(x - c.x || 1) * outX
        else z += Math.sign(z - c.z || 1) * outZ
      } else {
        const push = (radius - dist) / dist
        x += vx * push
        z += vz * push
      }
    }
  }
  return [clamp(x, -bound, bound), clamp(z, -bound, bound)]
}
