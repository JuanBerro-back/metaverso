export const HALL_HALF = 13
export const WALK_BOUND = HALL_HALF - 0.8
export const WALL_H = 6
export const PANEL_RADIUS = 6.8
export const PANEL_COUNT = 8

export function panelSpot(i) {
  const a = (i / PANEL_COUNT) * Math.PI * 2
  return {
    x: Math.sin(a) * PANEL_RADIUS,
    z: Math.cos(a) * PANEL_RADIUS,
    rotationY: Math.PI + a,
  }
}

export const PANEL_COLLIDERS = Array.from({ length: PANEL_COUNT }, (_, i) => {
  const s = panelSpot(i)
  return { x: s.x, z: s.z, hw: 1.55, hd: 1.0 }
})

export const COLUMN_COLLIDERS = [
  { x: 12.0, z: 12.0, hw: 0.7, hd: 0.7 },
  { x: -12.0, z: 12.0, hw: 0.7, hd: 0.7 },
  { x: 12.0, z: -12.0, hw: 0.7, hd: 0.7 },
  { x: -12.0, z: -12.0, hw: 0.7, hd: 0.7 },
]

export const BENCH_COLLIDERS = [
  { x: 4.2, z: -1.4, hw: 1.15, hd: 0.45 },
  { x: -4.2, z: 1.0, hw: 1.15, hd: 0.45 },
]

export const ALL_COLLIDERS = [...PANEL_COLLIDERS, ...COLUMN_COLLIDERS, ...BENCH_COLLIDERS]

export const GAME_COLLIDERS = [
  { x: 0, z: 0, hw: 8.1, hd: 0.85 },
  { x: -7.4, z: -4.2, hw: 0.55, hd: 0.55 },
  { x: -4.0, z: -7.8, hw: 0.55, hd: 0.55 },
  { x: -0.6, z: -4.2, hw: 0.55, hd: 0.55 },
  ...COLUMN_COLLIDERS,
]