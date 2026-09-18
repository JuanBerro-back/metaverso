import { create } from 'zustand'

export const useStore = create((set) => ({
  locked: false,
  target: null,
  viewing: null,
  setLocked: (locked) => set({ locked }),
  setTarget: (target) => set({ target }),
  setViewing: (viewing) => set({ viewing }),
}))