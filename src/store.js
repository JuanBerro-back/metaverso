import { create } from 'zustand'

/* ------------------------------------------------------------------ *
 * Persistencia tolerante a fallos (modo privado, cuota, iframes…)     *
 * ------------------------------------------------------------------ */

const KEY_BEST = 'zupply-best'
const KEY_NICK = 'xupply-nickname'
const KEY_TOUR = 'xupply-tour-visto'

function readString(key, fallback = '') {
  try {
    const v = localStorage.getItem(key)
    return v == null ? fallback : v
  } catch {
    return fallback
  }
}

function readNumber(key, fallback = 0) {
  try {
    const n = Number(localStorage.getItem(key))
    return Number.isFinite(n) ? n : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    /* almacenamiento no disponible: seguimos en memoria */
  }
}

/* ------------------------------------------------------------------ *
 * Estado global                                                       *
 * ------------------------------------------------------------------ */

export const useStore = create((set, get) => ({
  /* ---------- Arranque / identidad ---------- */
  /** 'start' = pantalla de inicio, 'world' = dentro del metaverso */
  view: 'start',
  nickname: readString(KEY_NICK, ''),
  /** 'museum' = Museo Xupply, 'game' = minijuego de la banda logística */
  mode: 'museum',
  /** Calidad gráfica efectiva: 'baja' | 'media' | 'alta' */
  quality: 'media',
  /** Preferencia guardada: 'auto' | 'baja' | 'media' | 'alta' */
  qualityPref: 'auto',
  /** Sombras activas (se apagan en calidad baja y en gafas autónomas) */
  shadows: true,
  /** Hay backend multijugador real conectado. Siempre false en esta demo. */
  netMode: 'local',
  visitorCount: 0,

  setView: (view) => set({ view }),
  setNickname: (nickname) => {
    const clean = String(nickname || '').slice(0, 18)
    write(KEY_NICK, clean)
    set({ nickname: clean })
  },
  setMode: (mode) => set({ mode, assistant: null, gameOver: false, station: null }),
  setQualityPref: (qualityPref) => set({ qualityPref }),
  setQuality: (quality) => set({ quality }),
  setShadows: (shadows) => set({ shadows }),
  setVisitorCount: (visitorCount) => set({ visitorCount }),

  /* ---------- Cámara / control ---------- */
  locked: false,
  /** 'third' (tercera persona, por defecto) | 'first' */
  cameraMode: 'third',
  /** Controles táctiles activos (móvil / tablet) */
  touch: false,
  setLocked: (locked) => set({ locked }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setTouch: (touch) => set({ touch }),

  /* ---------- Interacción ---------- */
  /** Objeto enfocado por el rayo: { id, title, kind: 'poster'|'station'|'npc' } */
  target: null,
  /** Cartel del museo abierto (id de EXHIBITS) */
  viewing: null,
  /** Estación del museo abierta (id de STATIONS) */
  station: null,
  /** Pista contextual de interacción ("E · abrir Catálogo mayorista") */
  prompt: null,
  setTarget: (target) => set({ target }),
  setViewing: (viewing) => set({ viewing }),
  setStation: (station) => set({ station }),
  setPrompt: (prompt) => set({ prompt }),

  /** Diálogo actual del asistente (burbuja de Xuppy / Burgy) */
  assistant: null,
  setAssistant: (assistant) => set({ assistant }),

  /* ---------- Recorrido guiado ----------
   * La lista de pasos vive en `src/tour/steps.js`. Aquí solo guardamos
   * el índice actual y si el recorrido está en marcha o ya se terminó.
   */
  tour: { active: false, step: 0, done: false },
  tourSeen: readString(KEY_TOUR, '') === '1',

  startTour: () =>
    set({
      tour: { active: true, step: 0, done: false },
      station: null,
      viewing: null,
      assistant: null,
    }),
  stopTour: () =>
    set((s) => ({
      tour: { ...s.tour, active: false },
      station: null,
      viewing: null,
      assistant: null,
    })),
  /** Salta a un paso concreto (0-based). `total` acota el índice. */
  gotoStep: (step, total) =>
    set((s) => {
      const max = Math.max(0, (total || s.tourTotal || 1) - 1)
      const clamped = Math.max(0, Math.min(step, max))
      return { tour: { ...s.tour, active: true, step: clamped }, station: null, viewing: null }
    }),
  finishTour: () => {
    write(KEY_TOUR, '1')
    set((s) => ({
      tour: { ...s.tour, active: false, done: true },
      tourSeen: true,
      station: null,
      viewing: null,
      assistant: null,
    }))
  },
  /** Nº total de pasos del recorrido (lo publica el componente del recorrido). */
  tourTotal: 0,
  setTourTotal: (tourTotal) => set({ tourTotal }),

  /* ---------- WebXR ---------- */
  xrSupported: false,
  xrChecked: false,
  xrActive: false,
  /** Ficha 3D flotante visible en VR para la estación indicada */
  xrBoard: null,
  setXrSupported: (xrSupported) => set({ xrSupported, xrChecked: true }),
  setXrActive: (xrActive) => set({ xrActive }),
  setXrBoard: (xrBoard) => set({ xrBoard }),

  /* ---------- Minijuego de la banda logística ---------- */
  score: 0,
  hearts: 3,
  level: 1,
  correct: 0,
  best: readNumber(KEY_BEST, 0),
  gameOver: false,
  inProgress: false,

  startGame: () => {
    // El minijuego se desarrolla en la escena del juego.
    set({
      mode: 'game',
      score: 0,
      hearts: 3,
      level: 1,
      correct: 0,
      gameOver: false,
      inProgress: true,
      assistant: null,
      station: null,
      viewing: null,
    })
  },
  addCorrect: () =>
    set((s) => {
      const correct = s.correct + 1
      const level = 1 + Math.floor(correct / 5)
      return { correct, score: s.score + 10 * s.level, level }
    }),
  loseHeart: () =>
    set((s) => {
      const hearts = s.hearts - 1
      if (hearts <= 0) {
        const best = Math.max(s.best, s.score)
        write(KEY_BEST, best)
        return { hearts: 0, gameOver: true, inProgress: false, best }
      }
      return { hearts }
    }),

  /* ---------- Utilidades de arranque ---------- */
  /** Cierra cualquier capa abierta y vuelve al estado de exploración. */
  clearOverlays: () => set({ station: null, viewing: null, target: null, prompt: null }),
}))

/** Estado del reproductor resuelto (fuera de React para no re-renderizar). */
export const QUALITY_PRESETS = {
  baja: { pixelRatioMax: 1, shadows: false, antialias: false, shadowMapSize: 512 },
  media: { pixelRatioMax: 1.5, shadows: true, antialias: true, shadowMapSize: 1024 },
  alta: { pixelRatioMax: 2, shadows: true, antialias: true, shadowMapSize: 2048 },
}

/** Atajo para leer el estado fuera de componentes React. */
export const getState = () => useStore.getState()
