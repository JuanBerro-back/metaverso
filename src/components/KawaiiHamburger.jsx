import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store.js'
import { burgerState, catState } from '../game/cat.js'
import { WALK_BOUND, ALL_COLLIDERS, GAME_COLLIDERS } from '../museum/config.js'

const RADIUS = 0.42
const FLEE_RANGE = 7.0
const FLEE_SPEED = 3.2
const WANDER_SPEED = 1.15

const FRINGE = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2
  return [Math.cos(a) * 0.41, Math.sin(a) * 0.41]
})

const BURGY = {
  idle: [
    '¡Ñam! Hoy el metaverso huele a papitas.',
    'Soy Burgy, la hamburguesa voladora de Xupply.',
    '¿Vacaciones en el museo? ¡Me apunto!',
    'Cuidado con la mantequilla, el piso es de queso.',
    'Mi platito rosa es la mejor nave del espacio.',
  ],
  near: [
    '¡Hola, amiguito! Soy Burgy. Y eso es todo amigos… digo, es todo.',
    'Si el gato-ovni me persigue, hazle clic para calmarlo.',
    'Pásame la salsa y seremos inseparables.',
    '¿Viste qué lindo es mi platito volador? ¡Vuela solo!',
  ],
  scared: [
    '¡Ay, no! ¡El gato-ovni me quiere comer!',
    '¡Socorrooo! ¡Que alguien le dé un clic!',
    '¡Uy, mejor aprieto el turbo del OVNI!',
    '¡Cucu agua fresca! Sin ketchup, por favor.',
  ],
  bitten: [
    '¡Ayyy! ¡El travieso me dio un mordisco!',
    '¡Ouch! Eso estuvo cerca de ser almuerzo.',
    '¡Ño! ¡Me mordió el gato hambriento!',
  ],
  friends: [
    '¡Uf! Menos mal, somos amigos otra vez.',
    '¡Así me gusta! Amigos, no merienda.',
    '¡No más mordiscos, por favor!',
    '¡Corazones! Qué lindo es el gato… desde lejos.',
  ],
}

function pick(lines, exclude) {
  const pool = lines.filter((l) => l !== exclude)
  return pool[Math.floor(Math.random() * pool.length)] ?? lines[0]
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

function resolveColliders(x, z, colliders) {
  for (const c of colliders) {
    const dx = clamp(x - c.x, -c.hw, c.hw)
    const dz = clamp(z - c.z, -c.hd, c.hd)
    let vx = x - c.x - dx
    let vz = z - c.z - dz
    const l = Math.hypot(vx, vz)
    if (l < RADIUS) {
      const push = (RADIUS - l) / (l || 1)
      x += vx * push
      z += vz * push
    }
  }
  return [clamp(x, -WALK_BOUND, WALK_BOUND), clamp(z, -WALK_BOUND, WALK_BOUND)]
}

export function KawaiiHamburger({ position = [0, 0, 0] }) {
  const root = useRef(null)
  const eyesOpen = useRef(null)
  const eyesHappy = useRef(null)
  const mouthSmile = useRef(null)
  const mouthOh = useRef(null)
  const brow = useRef(null)
  const sweat = useRef(null)
  const armL = useRef(null)
  const armR = useRef(null)
  const star = useRef(null)
  const rim = useRef(null)
  const beamCone = useRef(null)
  const groundRef = useRef(null)
  const wanderTarget = useRef(new THREE.Vector3())
  const wanderTimer = useRef(0)
  const heading = useRef(0)
  const faceGoal = useRef(0)
  const hopY = useRef(0)
  const heartTimer = useRef(0)
  const hearts = useRef([])
  const bubbleApi = useRef(null)
  const prevScared = useRef(false)
  const prevFriends = useRef(false)
  const prevBiting = useRef(false)
  const lastSpeak = useRef(-Infinity)
  const lastText = useRef(null)
  const _dc = new THREE.Vector3()
  const _proj = new THREE.Vector3()

  useEffect(() => {
    const g = root.current
    if (!g) return
    g.position.set(position[0], 0, position[2])
    burgerState.x = position[0]
    burgerState.z = position[2]
  }, [position])

  useEffect(() => {
    const el = document.createElement('div')
    el.className = 'assistant assistant-3d burger hidden'
    const badge = document.createElement('span')
    badge.className = 'assistant-badge'
    badge.textContent = 'BURGY'
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

  useFrame((state, delta) => {
    const g = root.current
    if (!g) return
    const t = state.clock.elapsedTime
    const mode = useStore.getState().mode
    const colliders = mode === 'game' ? GAME_COLLIDERS : ALL_COLLIDERS

    _dc.set(g.position.x - catState.x, 0, g.position.z - catState.z)
    const d = _dc.length()
    const fleeing = catState.chasing && d < FLEE_RANGE

    let vx = 0
    let vz = 0
    if (fleeing) {
      const n = Math.max(d, 0.001)
      vx = (_dc.x / n) * FLEE_SPEED
      vz = (_dc.z / n) * FLEE_SPEED
      faceGoal.current = Math.atan2(_dc.x, _dc.z)
    } else {
      wanderTimer.current -= delta
      const wn = Math.hypot(wanderTarget.current.x - g.position.x, wanderTarget.current.z - g.position.z)
      if (wanderTimer.current <= 0 || wn < 0.45) {
        wanderTimer.current = 3 + Math.random() * 4
        const a = Math.random() * Math.PI * 2
        const r = 3 + Math.random() * 4
        wanderTarget.current.set(g.position.x + Math.cos(a) * r, 0, g.position.z + Math.sin(a) * r)
      }
      if (wn > 0.3) {
        vx = ((wanderTarget.current.x - g.position.x) / wn) * WANDER_SPEED
        vz = ((wanderTarget.current.z - g.position.z) / wn) * WANDER_SPEED
        faceGoal.current = Math.atan2(wanderTarget.current.x - g.position.x, wanderTarget.current.z - g.position.z)
      }
    }

    ;[g.position.x, g.position.z] = resolveColliders(g.position.x + vx * delta, g.position.z + vz * delta, colliders)
    burgerState.x = g.position.x
    burgerState.z = g.position.z

    let dy = faceGoal.current - heading.current
    while (dy > Math.PI) dy -= Math.PI * 2
    while (dy < -Math.PI) dy += Math.PI * 2
    heading.current += dy * (1 - Math.exp(-(fleeing ? 9 : 6) * delta))
    g.rotation.y = heading.current
    g.rotation.z = Math.sin(t * 0.9) * 0.03
    const sp = Math.hypot(vx, vz)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, fleeing ? 0.18 : sp > 0.05 ? 0.08 : 0, 6, delta)

    const scared = catState.chasing && d < 3.2
    const friends = !catState.chasing && d < 5.0

    if (catState.biting && d < 2.6 && hopY.current <= 0) hopY.current = 0.5
    if (hopY.current > 0) hopY.current = Math.max(0, hopY.current - delta * 3.2)
    const hover = scared ? 1.0 : 0.72
    g.position.y = hover + Math.sin(t * (scared ? 3.4 : 2.4)) * 0.025 + hopY.current

    if (star.current) {
      star.current.rotation.y += delta * 2.4
      star.current.rotation.z = Math.sin(t * 2.2) * 0.35
    }

    if (rim.current) {
      for (let i = 0; i < rim.current.children.length; i++) {
        const m = rim.current.children[i]
        m.material.emissiveIntensity = 0.8 + 0.6 * Math.sin(t * (scared ? 12 : 4.5) + i * 1.1)
      }
    }

    const beamLen = Math.max(0.1, g.position.y - 0.46)
    if (beamCone.current) {
      beamCone.current.scale.y = beamLen
      beamCone.current.position.y = -0.46 - beamLen / 2
      beamCone.current.material.opacity = 0.12 + 0.05 * Math.sin(t * 5)
    }
    if (groundRef.current) {
      groundRef.current.position.y = -g.position.y + 0.008
      groundRef.current.material.opacity = 0.3 + 0.1 * Math.sin(t * 5 + 1)
    }

    if (eyesOpen.current) {
      eyesOpen.current.visible = !friends
      const target = scared ? 1.42 : 1
      eyesOpen.current.scale.x = THREE.MathUtils.damp(eyesOpen.current.scale.x, target, 8, delta)
      eyesOpen.current.scale.y = THREE.MathUtils.damp(eyesOpen.current.scale.y, target, 8, delta)
    }
    if (eyesHappy.current) eyesHappy.current.visible = friends
    if (mouthSmile.current) mouthSmile.current.visible = !scared
    if (mouthOh.current) mouthOh.current.visible = scared
    if (brow.current) brow.current.visible = scared
    if (sweat.current) sweat.current.visible = scared

    if (scared) {
      const s = 1 + 0.12 * Math.sin(t * 34)
      g.scale.set(s, 1 / s, s)
    } else {
      g.scale.x = THREE.MathUtils.damp(g.scale.x, 1, 8, delta)
      g.scale.y = THREE.MathUtils.damp(g.scale.y, 1, 8, delta)
      g.scale.z = THREE.MathUtils.damp(g.scale.z, 1, 8, delta)
    }

    if (armL.current) {
      const sway = Math.sin(t * 2.6) * 0.28
      armL.current.rotation.z = sway + (scared ? 0.7 : 0)
      armR.current.rotation.z = -sway - (scared ? 0.7 : 0)
    }

    for (const h of hearts.current) {
      if (h.active) {
        h.t += delta
        if (h.t < 1.7) {
          h.mesh.position.set(h.base.x, h.base.y + h.t * 0.55, h.base.z)
          h.mesh.scale.setScalar(Math.sin(Math.min(h.t / 0.9, 1) * Math.PI) * 0.65)
          h.mesh.material.opacity = Math.max(0, 1 - h.t / 1.8)
        } else {
          h.active = false
          h.mesh.visible = false
        }
      }
    }
    if (friends) {
      heartTimer.current += delta
      if (heartTimer.current > 0.5) {
        heartTimer.current = 0
        const h = hearts.current.find((x) => !x.active)
        if (h) {
          h.active = true
          h.t = 0
          h.base.set((Math.random() - 0.5) * 0.4, 0.95 + Math.random() * 0.15, (Math.random() - 0.5) * 0.3)
          h.mesh.visible = true
        }
      }
    }

    // ===== Diálogos de Burgy (burbuja) =====
    const bubble = bubbleApi.current
    if (bubble) {
      const now = performance.now()
      const biting = catState.biting && d < 2.6
      const toCam = g.position.distanceTo(state.camera.position)
      let text = null

      if (!prevBiting.current && biting) {
        text = pick(BURGY.bitten, lastText.current)
      } else if (!prevScared.current && scared) {
        text = pick(BURGY.scared, lastText.current)
      } else if (!prevFriends.current && friends) {
        text = pick(BURGY.friends, lastText.current)
      } else if (now - lastSpeak.current > 5500) {
        if (scared) text = pick(BURGY.scared, lastText.current)
        else if (friends) text = pick(BURGY.friends, lastText.current)
        else if (toCam < 4.5) text = pick(BURGY.near, lastText.current)
        else text = pick(BURGY.idle, lastText.current)
      }

      prevScared.current = scared
      prevFriends.current = friends
      prevBiting.current = biting

      if (text) {
        lastSpeak.current = now
        lastText.current = text
        bubble.p.textContent = text
        _proj.copy(g.position).add(0, 1.05, 0).project(state.camera)
        if (_proj.z < 1) {
          bubble.el.style.left = `${(_proj.x * 0.5 + 0.5) * window.innerWidth}px`
          bubble.el.style.top = `${(-_proj.y * 0.5 + 0.5) * window.innerHeight}px`
          bubble.el.classList.remove('hidden')
        } else {
          bubble.el.classList.add('hidden')
        }
      } else {
        bubble.el.classList.add('hidden')
      }
    }
  })

  return (
    <group ref={root} position={[0, 0, 0]}>
      {/* ===== Pan base ===== */}
      <mesh position={[0, -0.18, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.38, 36, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#ef9f46" roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.028, 8, 36]} />
        <meshStandardMaterial color="#ca7f2e" roughness={0.7} />
      </mesh>

      {/* ===== OVNI kawaii debajo ===== */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.51, 0.46, 0.08, 30]} />
        <meshStandardMaterial color="#ffc9e4" roughness={0.3} metalness={0.55} />
      </mesh>
      <mesh position={[0, -0.56, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.3, 0.1, 26]} />
        <meshStandardMaterial color="#e9a5d8" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <torusGeometry args={[0.49, 0.026, 8, 34]} />
        <meshStandardMaterial color="#ff7bd0" emissive="#ff7bd0" emissiveIntensity={1.1} roughness={0.4} />
      </mesh>
      <group ref={rim}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.46, -0.52, Math.sin(a) * 0.46]}>
              <sphereGeometry args={[0.032, 10, 10]} />
              <meshStandardMaterial color="#ffbfe5" emissive="#ff7bd0" emissiveIntensity={0.9} />
            </mesh>
          )
        })}
      </group>
      {/* Corazón frontal */}
      <group position={[0, -0.49, 0.47]} rotation={[0, 0, 0]}>
        <mesh position={[-0.022, 0.005, 0]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <meshStandardMaterial color="#ff5fa3" emissive="#ff5fa3" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0.022, 0.005, 0]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <meshStandardMaterial color="#ff5fa3" emissive="#ff5fa3" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, -0.022, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.032, 0.05, 3]} />
          <meshStandardMaterial color="#ff5fa3" emissive="#ff5fa3" emissiveIntensity={0.25} />
        </mesh>
      </group>
      {/* Rayo de luz hacia el suelo */}
      <mesh ref={beamCone} position={[0, -0.46, 0]}>
        <cylinderGeometry args={[0.06, 0.46, 1, 18, 1, true]} />
        <meshBasicMaterial color="#ff9ad2" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={groundRef} position={[0, 0.002, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.47, 32]} />
        <meshBasicMaterial color="#ff9ad2" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* ===== Carne ===== */}
      <mesh position={[0, -0.02, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.395, 0.14, 28]} />
        <meshStandardMaterial color="#6b3a1c" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.02, 8, 32]} />
        <meshStandardMaterial color="#8a4a22" roughness={0.65} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.34, -0.02, Math.sin(a) * 0.34]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshStandardMaterial color="#57301a" roughness={1} />
          </mesh>
        )
      })}

      {/* ===== Queso con chorrete ===== */}
      <mesh position={[0, 0.065, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[0.47, 0.05, 0.47]} />
        <meshStandardMaterial color="#ffd23f" roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 0.035, 0.2]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#ffcf3f" roughness={0.6} />
      </mesh>

      {/* ===== Tomate en dos tonos ===== */}
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.37, 0.04, 26]} />
        <meshStandardMaterial color="#ff7878" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.145, 0]} castShadow>
        <cylinderGeometry args={[0.33, 0.33, 0.035, 26]} />
        <meshStandardMaterial color="#ff4d3f" roughness={0.45} />
      </mesh>

      {/* ===== Lechuga con ondas ===== */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.38, 0.05, 8, 30]} />
        <meshStandardMaterial color="#5cc93a" roughness={0.7} />
      </mesh>
      {FRINGE.map(([fx, fz], i) => (
        <mesh key={i} position={[fx, 0.21, fz]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#7ddc5a" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.21, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.02, 26]} />
        <meshStandardMaterial color="#8ae063" roughness={0.65} />
      </mesh>

      {/* ===== Pan superior (oro y tostado) ===== */}
      <mesh position={[0, 0.38, 0]} scale={[1, 0.8, 1]} castShadow>
        <sphereGeometry args={[0.42, 36, 22]} />
        <meshStandardMaterial color="#f7a64e" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.405, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.415, 0.03, 8, 36]} />
        <meshStandardMaterial color="#d78a2e" roughness={0.7} />
      </mesh>
      {/* Brillo de glaseado */}
      <mesh position={[-0.16, 0.58, 0.22]} rotation={[0.4, 0, -0.6]}>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.28} depthWrite={false} />
      </mesh>

      {/* Semillas de sésamo */}
      {[
        [0.0, 0.76, 0.12],
        [-0.17, 0.72, -0.08],
        [0.17, 0.72, 0.02],
        [-0.31, 0.64, 0.06],
        [0.31, 0.64, -0.04],
        [-0.1, 0.76, -0.12],
        [0.12, 0.66, -0.18],
      ].map((p, i) => (
        <mesh key={i} position={p} rotation={[0, i * 0.9, i * 0.4]} scale={[0.78, 0.5, 0.78]}>
          <sphereGeometry args={[0.047, 10, 10]} />
          <meshStandardMaterial color="#fff3cf" roughness={0.5} />
        </mesh>
      ))}

      {/* ===== Antena con estrellita giratoria ===== */}
      <mesh position={[0, 0.66, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.022, 0.2, 8]} />
        <meshStandardMaterial color="#ef5aa8" emissive="#ef5aa8" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={star} position={[0, 0.83, 0]}>
        <octahedronGeometry args={[0.058, 0]} />
        <meshStandardMaterial color="#ffa9dc" emissive="#ff5fb0" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0, 0.83, 0]}>
        <sphereGeometry args={[0.02, 10, 10]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* ===== Carita kawaii (frente +Z) ===== */}
      <group ref={eyesOpen} position={[0, 0.43, 0.415]}>
        {[-0.15, 0.15].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh>
              <circleGeometry args={[0.085, 28]} />
              <meshBasicMaterial color="#221812" />
            </mesh>
            <mesh position={[0, 0, 0.012]}>
              <circleGeometry args={[0.05, 22]} />
              <meshBasicMaterial color="#5a3b1a" />
            </mesh>
            <mesh position={[0, 0, 0.024]}>
              <circleGeometry args={[0.044, 20]} />
              <meshBasicMaterial color="#221812" />
            </mesh>
            <mesh position={[-0.02, 0.024, 0.03]}>
              <circleGeometry args={[0.026, 14]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.022, -0.018, 0.03]}>
              <circleGeometry args={[0.012, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
        {/* Cejitas de susto */}
        <group ref={brow} position={[0, 0.14, 0.01]}>
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.12, 0.026, 0.012]} />
            <meshBasicMaterial color="#2a1c10" />
          </mesh>
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.12, 0.026, 0.012]} />
            <meshBasicMaterial color="#2a1c10" />
          </mesh>
        </group>
      </group>

      {/* Ojos felices */}
      <group ref={eyesHappy} position={[0, 0.43, 0.42]} visible={false}>
        <mesh position={[-0.14, 0, 0]}>
          <torusGeometry args={[0.05, 0.02, 8, 18, Math.PI]} />
          <meshBasicMaterial color="#221812" />
        </mesh>
        <mesh position={[0.14, 0, 0]}>
          <torusGeometry args={[0.05, 0.02, 8, 18, Math.PI]} />
          <meshBasicMaterial color="#221812" />
        </mesh>
      </group>

      {/* Sonrisa con lengua */}
      <group ref={mouthSmile} position={[0, 0.3, 0.425]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <torusGeometry args={[0.052, 0.016, 8, 18, Math.PI]} />
          <meshBasicMaterial color="#2c1d12" />
        </mesh>
        <mesh position={[0, -0.035, 0.02]}>
          <sphereGeometry args={[0.026, 12, 12]} />
          <meshBasicMaterial color="#f2688c" />
        </mesh>
      </group>
      <mesh ref={mouthOh} position={[0, 0.36, 0.425]} visible={false}>
        <circleGeometry args={[0.05, 18]} />
        <meshBasicMaterial color="#2c1d12" />
      </mesh>

      {/* Mejillas */}
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.33, 0.42]}>
          <circleGeometry args={[0.055, 20]} />
          <meshBasicMaterial color="#ff8fb1" transparent opacity={0.9} />
        </mesh>
      ))}

      {/* Gotitas de sudor */}
      <group ref={sweat} position={[0, 0, 0]} visible={false}>
        {[
          [-0.3, 0.6],
          [0.3, 0.52],
          [-0.14, 0.72],
        ].map((p, i) => (
          <mesh key={i} position={p} scale={[1, 0.7, 1]}>
            <sphereGeometry args={[0.036, 10, 10]} />
            <meshStandardMaterial color="#9ad7ff" emissive="#6ec6ff" emissiveIntensity={0.4} transparent opacity={0.9} />
          </mesh>
        ))}
      </group>

      {/* ===== Bracitos ===== */}
      <group ref={armL} position={[-0.52, 0.12, 0]} rotation={[0, 0, 0.25]}>
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.2, 10]} />
          <meshStandardMaterial color="#f7a64e" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <sphereGeometry args={[0.064, 12, 12]} />
          <meshStandardMaterial color="#f7a64e" />
        </mesh>
      </group>
      <group ref={armR} position={[0.52, 0.12, 0]} rotation={[0, 0, -0.25]}>
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.2, 10]} />
          <meshStandardMaterial color="#f7a64e" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <sphereGeometry args={[0.064, 12, 12]} />
          <meshStandardMaterial color="#f7a64e" />
        </mesh>
      </group>

      {/* ===== Patitas ===== */}
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, -0.38, 0.05]} scale={[1, 0.62, 1]}>
          <sphereGeometry args={[0.095, 12, 12]} />
          <meshStandardMaterial color="#ef9f46" roughness={0.9} />
        </mesh>
      ))}

      {/* ===== Corazoncitos ===== */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          visible={false}
          ref={(m) => {
            if (m) hearts.current[i] = { mesh: m, active: false, t: 0, base: new THREE.Vector3() }
          }}
        >
          <octahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial color="#ff6fb8" emissive="#ff3f9e" emissiveIntensity={1.6} transparent />
        </mesh>
      ))}
    </group>
  )
}