import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../store.js'
import { burgerState, catState } from '../game/cat.js'
import { WALK_BOUND } from '../museum/config.js'

const GREETING = '¡Hola! Soy Xuppy, tu asistente de la banda. Clasifica las cajas antes de que caigan al suelo.'

const PUNCH_LINES = [
  '¡Auch! ¿Eso fue por mi culpa?',
  '¡Ojo! Soy el asistente, no un saco de boxear.',
  '¡Auch! Buena pegada, pero volvamos al trabajo.',
  '¡Vale, vale! Sigo dándote consejos igual.',
  '¡Auch! Eso descolocó mi OVNI.',
  '¡Auch! ¡Vale, vale, me aparto! Aunque esa hamburguesita… ¡ñam, qué buena pinta!',
]

const BITE_LINES = [
  '¡Ñam ñam! ¡Esa hamburguesita tiene pinta buenísima!',
  '¡Ñam! Casi te doy un mordisco… ¡estás de rechupete!',
  '¡Ñam ñam ñam! ¡No puedo resistir esas capitas tan ricas!',
]

const CHASE_LINES = [
  '¡Sigo con hambre! ¡Vuelve aquí, hamburguesita!',
  '¡Ñam! ¡Esa hamburguesita se me escapa! ¡A la caza!',
  'Sé que eres mi amiga, hamburguesita, pero… ¡ñam! ¡No puedo controlarme!',
]

const STUN_LINES = [
  '¡Auch! Vale, vale, tranquilo… no me la como. ¡Por ahora!',
  '¡Uy, perdón! Se me fue el hambre por un momento. Somos amigos otra vez.',
  '¡Eso duele! Está bien, está bien… ni un mordisco más. Aplauso por el golpe.',
]

const PRAISES = [
  '¡Bravo! Esa era la tolva correcta.',
  '¡Perfecto! Sigue así.',
  '¡Gran clasificación! Punto sumado.',
  '¡Excelente, lo clavaste!',
  '¡Muy bien! Así se trabaja en Xupply.',
  '¡Vas genial, punto perfecto!',
]

const GAME_TIPS = [
  'Lanza las cajas como en baloncesto: el clic de suelta hace un tiro en arcada.',
  'Levanta una caja con clic y encesta la tolva del mismo color.',
  'Rojo = Proveedores · Verde = Restaurantes · Amarillo = Bodega.',
  'Mira la cinta de color de cada caja antes de que llegue al final de la banda.',
  'Cada 5 cajas bien clasificadas subes de nivel y todo va más rápido.',
  'Si la caja cae por el final de la banda, pierdes un corazón.',
  'Puedes correr con Shift para alcanzar las cajas más lejanas.',
  'Encesta la caja en la tolva correcta: apunta bien al embudo antes de lanzar.',
  'A niveles altos la banda va más rápido y salen más cajas: no pierdas tiempo.',
  'El arco del lanzamiento llega hasta donde apuntas: útil para tolvas lejanas.',
]

const MUSEUM_TIPS = [
  'Hola, soy Xuppy. Recorre las 8 obras del museo de Xupply.',
  'Mira cada obra y haz clic para abrir su explicación.',
  'Las obras están numeradas: van de la 01 a la 08.',
  'La última obra incluye el video final del proyecto.',
  'Si me ves hambriento persiguiendo a la hamburguesita, pégame con clic para que la deje tranquila.',
]

const BOUND = WALK_BOUND - 0.6
const BITE_RANGE = 1.9
const STUN_TIME = 6000
const STUN_RETREAT = 4.6
const HEAD_OFFSET = new THREE.Vector3(0, 1.95, 0)
const BODY_CENTER = new THREE.Vector3(0, 0.9, 0)

const _tmp = new THREE.Vector3()
const _ray = new THREE.Raycaster()

function punchSfx() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    if (!AC._inst) AC._inst = new AC()
    const ctx = AC._inst
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(160, t)
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.12)
    gain.gain.setValueAtTime(0.25, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.2)
  } catch {
    /* audio no disponible */
  }
}

function biteSfx() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    if (!AC._inst) AC._inst = new AC()
    const ctx = AC._inst
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const t0 = t + i * 0.16
      osc.type = 'square'
      osc.frequency.setValueAtTime(230, t0)
      osc.frequency.exponentialRampToValueAtTime(70, t0 + 0.14)
      gain.gain.setValueAtTime(0.18, t0)
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0)
      osc.stop(t0 + 0.18)
    }
  } catch {
    /* audio no disponible */
  }
}

export function ZuppyBot({ position }) {
  const { camera } = useThree()
  const groupRef = useRef(null)
  const hlL = useRef(null)
  const hlR = useRef(null)
  const rimGroup = useRef(null)
  const bubbleApi = useRef(null)
  const lastTipRef = useRef(null)
  const tipTimer = useRef(0)
  const prevLevel = useRef(null)
  const prevHearts = useRef(null)
  const prevScore = useRef(null)
  const praiseIdx = useRef(0)
  const wasLocked = useRef(false)
  const hitRef = useRef(null)
  const lastHit = useRef(-10)
  const chaseAnnounced = useRef(false)
  const stunAnnounced = useRef(false)
  const biteTimer = useRef(1.5)
  const lungeRef = useRef(null)
  const torusRef = useRef(null)
  const coreRef = useRef(null)

  useEffect(() => {
    const el = document.createElement('div')
    el.className = 'assistant assistant-3d hidden'
    const badge = document.createElement('span')
    badge.className = 'assistant-badge'
    badge.textContent = 'XUPPY'
    const p = document.createElement('p')
    el.appendChild(badge)
    el.appendChild(p)
    document.body.appendChild(el)
    bubbleApi.current = { el, p }
    return () => {
      el.remove()
      bubbleApi.current = null
    }
  }, [])

  useEffect(() => {
    const onDown = () => {
      if (!document.pointerLockElement) return
      const st = useStore.getState()
      if (st.gameOver) return
      const now = performance.now()
      if (now - lastHit.current < 1000) return
      const g = groupRef.current
      if (!g) return
      const center = _tmp.copy(g.position).add(BODY_CENTER)
      _ray.setFromCamera({ x: 0, y: 0 }, camera)
      const dist = _ray.ray.distanceToPoint(center)
      if (dist < 0.95 && center.distanceTo(camera.position) < 8) {
        lastHit.current = now
        const dir = new THREE.Vector3(center.x - camera.position.x, 0, center.z - camera.position.z).normalize()
        hitRef.current = { start: now, dir }
        catState.stunnedUntil = now + STUN_TIME
        stunAnnounced.current = false
        chaseAnnounced.current = false
        announce(PUNCH_LINES[Math.floor(Math.random() * PUNCH_LINES.length)])
        punchSfx()
      }
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [camera])

  function announce(text) {
    if (lastTipRef.current === text) return
    lastTipRef.current = text
    useStore.getState().setAssistant(text)
  }

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const g = groupRef.current
    if (!g) return

    const now = performance.now()
    const cam = state.camera.position
    const locked = document.pointerLockElement
    const hungry = locked && now >= catState.stunnedUntil

    if (locked) {
      if (!wasLocked.current) {
        wasLocked.current = true
        lungeRef.current = null
        catState.biting = false
        chaseAnnounced.current = false
      }

      if (hungry) {
        catState.chasing = true
        if (!chaseAnnounced.current) {
          chaseAnnounced.current = true
          announce(CHASE_LINES[Math.floor(Math.random() * CHASE_LINES.length)])
        }
        g.position.x = Math.max(-BOUND, Math.min(BOUND, g.position.x))
        g.position.z = Math.max(-BOUND, Math.min(BOUND, g.position.z))
        const dx = burgerState.x - g.position.x
        const dz = burgerState.z - g.position.z
        const d = Math.hypot(dx, dz)

        if (d > BITE_RANGE) {
          const k = 1 - Math.exp(-1.5 * delta)
          g.position.x += dx * k
          g.position.z += dz * k
        } else {
          const ang = Math.atan2(dx, dz)
          const oa = ang + t * 0.9
          const ox = burgerState.x + Math.sin(oa) * BITE_RANGE
          const oz = burgerState.z + Math.cos(oa) * BITE_RANGE
          const k = 1 - Math.exp(-2.4 * delta)
          g.position.x += (ox - g.position.x) * k
          g.position.z += (oz - g.position.z) * k

          biteTimer.current -= delta
          if (biteTimer.current <= 0) {
            biteTimer.current = 3.6
            lungeRef.current = { start: now, dir: new THREE.Vector3(dx, 0, dz).normalize() }
            catState.biting = true
            announce(BITE_LINES[Math.floor(Math.random() * BITE_LINES.length)])
            biteSfx()
          }
        }
        g.position.x = Math.max(-BOUND, Math.min(BOUND, g.position.x))
        g.position.z = Math.max(-BOUND, Math.min(BOUND, g.position.z))
      } else {
        catState.chasing = false
        if (!stunAnnounced.current) {
          stunAnnounced.current = true
          announce(STUN_LINES[Math.floor(Math.random() * STUN_LINES.length)])
        }
        const dx = g.position.x - burgerState.x
        const dz = g.position.z - burgerState.z
        const d = Math.hypot(dx, dz)
        if (d < STUN_RETREAT) {
          const nx = dx / (d || 1)
          const nz = dz / (d || 1)
          g.position.x += nx * 1.9 * delta
          g.position.z += nz * 1.9 * delta
          g.position.x = Math.max(-BOUND, Math.min(BOUND, g.position.x))
          g.position.z = Math.max(-BOUND, Math.min(BOUND, g.position.z))
        }
      }
    } else {
      catState.chasing = false
      catState.biting = false
      if (wasLocked.current) {
        wasLocked.current = false
        stunAnnounced.current = false
        chaseAnnounced.current = false
        useStore.getState().setAssistant(null)
      }
    }

    g.position.y = Math.sin(t * (hungry ? 3.4 : 1.8)) * 0.06
    g.rotation.z = Math.sin(t * (hungry ? 1.4 : 0.7)) * (hungry ? 0.08 : 0.035)

    const aim = Math.atan2(burgerState.x - g.position.x, burgerState.z - g.position.z)
    let dy = aim - g.rotation.y
    while (dy > Math.PI) dy -= Math.PI * 2
    while (dy < -Math.PI) dy += Math.PI * 2
    g.rotation.y += dy * (1 - Math.exp(-5 * delta))

    const hit = hitRef.current
    if (hit) {
      const age = (performance.now() - hit.start) / 1000
      if (age > 1.1) {
        hitRef.current = null
      } else {
        const k = Math.exp(-3.2 * age)
        g.position.x += hit.dir.x * 0.6 * k
        g.position.z += hit.dir.z * 0.6 * k
        g.position.y += k * 0.4 - age * 0.15
        const p = Math.sin(Math.min(age / 0.45, 1) * Math.PI)
        const sq = p * (1 - age * 0.25) * 0.3
        g.scale.set(1 + sq, 1 - sq * 1.5, 1 + sq)
        g.rotation.x = hit.dir.x * -0.35 * k
        g.rotation.z = hit.dir.x * 0.25 * k
      }
    } else {
      const lunge = lungeRef.current
      if (lunge) {
        const age = (now - lunge.start) / 1000
        if (age > 0.7) {
          lungeRef.current = null
          catState.biting = false
        } else {
          const k = Math.exp(-3.5 * age)
          g.position.x += lunge.dir.x * 0.95 * k
          g.position.z += lunge.dir.z * 0.95 * k
          g.scale.set(1 + 0.22 * k, 1 - 0.22 * k, 1 + 0.22 * k)
          g.rotation.x = lunge.dir.x * 0.5 * k
          g.rotation.z = -lunge.dir.z * 0.5 * k
        }
      } else {
        g.scale.x = THREE.MathUtils.damp(g.scale.x, 1, 10, delta)
        g.scale.y = THREE.MathUtils.damp(g.scale.y, 1, 10, delta)
        g.scale.z = THREE.MathUtils.damp(g.scale.z, 1, 10, delta)
      }
    }

    catState.x = g.position.x
    catState.z = g.position.z

    g.updateMatrixWorld()

    _tmp.copy(cam)
    g.worldToLocal(_tmp)
    const hx = Math.max(-0.035, Math.min(0.035, _tmp.x * 0.16))
    const hy = Math.max(-0.025, Math.min(0.035, (_tmp.y - 1.0) * 0.16))
    if (hlL.current) {
      hlL.current.position.x = -0.105 + hx
      hlL.current.position.y = 0.015 + hy
      hlR.current.position.x = 0.105 + hx
      hlR.current.position.y = 0.015 + hy
    }

    if (rimGroup.current) {
      for (let i = 0; i < rimGroup.current.children.length; i++) {
        const m = rimGroup.current.children[i]
        m.material.emissive.set(hungry ? '#ff3b30' : '#3ee6a0')
        m.material.emissiveIntensity = 0.7 + 0.5 * Math.sin(t * (hungry ? 8 : 3.2) + i * 1.2)
      }
    }

    if (torusRef.current) {
      const mat = torusRef.current.material
      const col = hungry ? '#ff5a3c' : '#3ee6a0'
      mat.color.set(col)
      mat.emissive.set(col)
      mat.emissiveIntensity = hungry ? 0.95 + 0.3 * Math.sin(t * 9) : 0.8
    }
    if (coreRef.current) {
      const mat = coreRef.current.material
      const col = hungry ? '#ff2d20' : '#3ee6a0'
      mat.color.set(col)
      mat.emissive.set(col)
      mat.emissiveIntensity = hungry ? 2.4 : 1.6
    }

    const bubble = bubbleApi.current
    if (bubble) {
      const msg = useStore.getState().assistant
      if (msg) {
        _tmp.copy(g.position).add(HEAD_OFFSET).project(state.camera)
        bubble.p.textContent = msg
        bubble.el.style.left = `${(_tmp.x * 0.5 + 0.5) * window.innerWidth}px`
        bubble.el.style.top = `${(-_tmp.y * 0.5 + 0.5) * window.innerHeight}px`
        bubble.el.classList.remove('hidden')
      } else {
        bubble.el.classList.add('hidden')
      }
    }

    const st = useStore.getState()
    if (!locked || st.gameOver) return
    if (st.mode !== 'game' && st.mode !== 'museum') return

    tipTimer.current += delta

    if (st.mode === 'game') {
      if (prevLevel.current === null) {
        prevLevel.current = st.level
        prevHearts.current = st.hearts
        prevScore.current = st.score
        announce(GREETING)
        return
      }

      const gained = st.score > prevScore.current
      if (gained) prevScore.current = st.score

      if (st.level > prevLevel.current) {
        prevLevel.current = st.level
        tipTimer.current = 0
        announce(`¡Felicidades! Subimos al nivel ${st.level}: la banda va más rápido.`)
        return
      }
      if (gained) {
        tipTimer.current = 0
        announce(PRAISES[praiseIdx.current % PRAISES.length])
        praiseIdx.current += 1
        return
      }
      if (st.hearts < prevHearts.current) {
        prevHearts.current = st.hearts
        tipTimer.current = 0
        if (st.hearts <= 0) {
          announce('Se vació el almacén… vuelve a intentarlo cuando quieras.')
        } else {
          announce('Se escapó una caja: perdiste un corazón. ¡Ojo con el color de la cinta!')
        }
        return
      }
      if (tipTimer.current > 6) {
        tipTimer.current = 0
        announce(GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)])
      }
    } else if (tipTimer.current > 8) {
      tipTimer.current = 0
      announce(MUSEUM_TIPS[Math.floor(Math.random() * MUSEUM_TIPS.length)])
    }
  })

  return (
    <>
      <group ref={groupRef} position={position}>
        {/* ===== OVNI debajo ===== */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.56, 0.46, 0.1, 28]} />
          <meshStandardMaterial color="#20262f" roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh ref={torusRef} position={[0, 0.32, 0]} castShadow>
          <torusGeometry args={[0.5, 0.035, 10, 32]} />
          <meshStandardMaterial color="#3ee6a0" emissive="#3ee6a0" emissiveIntensity={0.8} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.37, 0]} castShadow>
          <sphereGeometry args={[0.26, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#3ee6a0"
            emissive="#3ee6a0"
            emissiveIntensity={0.35}
            transparent
            opacity={0.5}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>
        <mesh ref={coreRef} position={[0, 0.37, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#eafff5" emissive="#3ee6a0" emissiveIntensity={1.6} />
        </mesh>
        <group ref={rimGroup}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 0.5, 0.31, Math.sin(a) * 0.5]}>
                <sphereGeometry args={[0.028, 10, 10]} />
                <meshStandardMaterial color="#8fffd6" emissive="#3ee6a0" emissiveIntensity={0.7} />
              </mesh>
            )
          })}
        </group>

        {/* Rayo de luz hacia el suelo */}
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.4, 0.85, 20, 1, true]} />
          <meshBasicMaterial color="#3ee6a0" transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.42, 32]} />
          <meshBasicMaterial color="#3ee6a0" transparent opacity={0.4} depthWrite={false} />
        </mesh>

        {/* ===== Caja gato ===== */}
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.6, 0.72]} />
          <meshStandardMaterial color="#c79156" roughness={0.85} />
        </mesh>
        {/* Cinta Zupply */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.735, 0.13, 0.735]} />
          <meshStandardMaterial color="#3ee6a0" emissive="#3ee6a0" emissiveIntensity={0.3} roughness={0.6} />
        </mesh>
        {/* Tapa */}
        <mesh position={[0, 1.36, 0]} castShadow>
          <boxGeometry args={[0.66, 0.07, 0.66]} />
          <meshStandardMaterial color="#d8a86a" roughness={0.7} />
        </mesh>
        {/* Orejas de gato */}
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, 1.44, 0]} rotation={[0, 0, x * 2.0]}>
            <coneGeometry args={[0.11, 0.16, 3]} />
            <meshStandardMaterial color="#c79156" roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {/* Antena */}
        <mesh position={[0, 1.58, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
          <meshStandardMaterial color="#2a2e38" roughness={0.5} metalness={0.6} />
        </mesh>
        <mesh position={[0, 1.68, 0]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#3ee6a0" emissive="#3ee6a0" emissiveIntensity={2} />
        </mesh>

        {/* Carita kawaii (cara frontal +Z) */}
        <mesh position={[-0.15, 0.95, 0.363]}>
          <circleGeometry args={[0.088, 28]} />
          <meshBasicMaterial color="#141920" />
        </mesh>
        <mesh position={[0.15, 0.95, 0.363]}>
          <circleGeometry args={[0.088, 28]} />
          <meshBasicMaterial color="#141920" />
        </mesh>
        <mesh ref={hlL} position={[-0.105, 0.965, 0.373]}>
          <circleGeometry args={[0.027, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh ref={hlR} position={[0.105, 0.965, 0.373]}>
          <circleGeometry args={[0.027, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.885, 0.372]}>
          <circleGeometry args={[0.02, 12]} />
          <meshBasicMaterial color="#ff8fa8" />
        </mesh>
        <mesh position={[-0.045, 0.845, 0.372]}>
          <torusGeometry args={[0.032, 0.011, 8, 18, Math.PI, Math.PI]} />
          <meshBasicMaterial color="#2c1d12" />
        </mesh>
        <mesh position={[0.045, 0.845, 0.372]}>
          <torusGeometry args={[0.032, 0.011, 8, 18, Math.PI, Math.PI]} />
          <meshBasicMaterial color="#2c1d12" />
        </mesh>
        <mesh position={[-0.27, 0.9, 0.361]}>
          <circleGeometry args={[0.038, 20]} />
          <meshBasicMaterial color="#ff9cb0" transparent opacity={0.75} />
        </mesh>
        <mesh position={[0.27, 0.9, 0.361]}>
          <circleGeometry args={[0.038, 20]} />
          <meshBasicMaterial color="#ff9cb0" transparent opacity={0.75} />
        </mesh>
        {[
          { x: -0.34, y: 1.0 },
          { x: -0.37, y: 0.93 },
          { x: -0.34, y: 0.86 },
          { x: 0.34, y: 1.0 },
          { x: 0.37, y: 0.93 },
          { x: 0.34, y: 0.86 },
        ].map((w, i) => (
          <mesh key={i} position={[w.x, w.y, 0.362]}>
            <boxGeometry args={[0.16, 0.012, 0.01]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
          </mesh>
        ))}
      </group>
    </>
  )
}