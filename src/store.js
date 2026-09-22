import { create } from 'zustand'

function loadBest() {
  try {
    return Number(localStorage.getItem('zupply-best') || 0) || 0
  } catch {
    return 0
  }
}

function saveBest(v) {
  try {
    localStorage.setItem('zupply-best', String(v))
  } catch {
    /* almacenamiento no disponible */
  }
}

export const useStore = create((set) => ({
  mode: 'menu',
  locked: false,
  target: null,
  viewing: null,
  assistant: null,
  score: 0,
  hearts: 3,
  level: 1,
  correct: 0,
  best: loadBest(),
  gameOver: false,
  inProgress: false,
  setMode: (mode) => set({ mode, assistant: null, gameOver: false }),
  setLocked: (locked) => set({ locked }),
  setTarget: (target) => set({ target }),
  setViewing: (viewing) => set({ viewing }),
  setAssistant: (assistant) => set({ assistant }),
  startGame: () =>
    set({ mode: 'game', score: 0, hearts: 3, level: 1, correct: 0, gameOver: false, inProgress: true, assistant: null }),
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
        saveBest(best)
        return { hearts: 0, gameOver: true, inProgress: false, best }
      }
      return { hearts }
    }),
}))