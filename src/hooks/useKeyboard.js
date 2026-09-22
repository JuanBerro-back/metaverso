import { useEffect, useRef } from 'react'

const BINDINGS = {
  KeyW: 'forward',
  KeyS: 'backward',
  KeyA: 'left',
  KeyD: 'right',
  ArrowUp: 'forward',
  ArrowDown: 'backward',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Space: 'jump',
  ShiftLeft: 'shift',
  ShiftRight: 'shift',
}

export function useKeyboard() {
  const keys = useRef({ forward: false, backward: false, left: false, right: false, shift: false, jump: false })

  useEffect(() => {
    const down = (e) => {
      if (BINDINGS[e.code]) keys.current[BINDINGS[e.code]] = true
    }
    const up = (e) => {
      if (BINDINGS[e.code]) keys.current[BINDINGS[e.code]] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return keys
}