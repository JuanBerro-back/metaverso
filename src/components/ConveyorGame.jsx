import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../store.js'
import { look } from './PointerLock.jsx'
import { makeBelt, makeLabel } from '../game/textures.js'

const BELT_TOP = 1.0
const BELT_HALF_X = 8.0
const SPAWN_X = BELT_HALF_X - 0.75
const DROP_X = -BELT_HALF_X - 0.45
const GRAB_MAX = 7
const HOLD_DIST = 2.9
const THROW_PLANE_Y = 1.45
const THROW_APEX = 1.3

const DEST = [
  { id: 'proveedores', name: 'Proveedores', hex: '#ff6b57' },
  { id: 'restaurantes', name: 'Restaurantes', hex: '#3ee6a0' },
  { id: 'bodega', name: 'Bodega', hex: '#ffd23f' },
]

const HOPPER_SPOTS = [
  { dest: DEST[0], pos: [-7.4, 0, -4.2] },
  { dest: DEST[1], pos: [-4.0, 0, -7.8] },
  { dest: DEST[2], pos: [-0.6, 0, -4.2] },
]

const raycaster = new THREE.Raycaster()
const _front = new THREE.Vector3()
const _plane = new THREE.Plane()
const _target = new THREE.Vector3()
const _funnelPos = new THREE.Vector3()

function makeBox(id, hex) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.5, 0.55),
    new THREE.MeshStandardMaterial({ color: '#c08a4f', roughness: 0.85 })
  )
  const tape = new THREE.Mesh(
    new THREE.BoxGeometry(0.565, 0.15, 0.565),
    new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 0.3, roughness: 0.6 })
  )
  tape.position.y = 0.14
  const lid = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.06, 0.5),
    new THREE.MeshStandardMaterial({ color: '#d8a86a', roughness: 0.7 })
  )
  lid.position.y = 0.28
  g.add(body, tape, lid)
  g.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true
      o.userData.id = id
    }
  })
  g.userData.id = id
  return g
}

function disposeBox(g) {
  g.traverse((o) => {
    if (o.geometry) o.geometry.dispose()
    if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose())
      else o.material.dispose()
    }
  })
}

function Hopper({ hopper, register }) {
  const funnelRef = useRef(null)
  const labelTex = useMemo(() => makeLabel(hopper.dest.name, hopper.dest.hex), [hopper.dest.name, hopper.dest.hex])

  useEffect(() => {
    register(hopper.dest.id, funnelRef.current)
    return () => register(hopper.dest.id, null)
  }, [hopper.dest.id, register])

  return (
    <group position={hopper.pos}>
      {/* Pedestal */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.12, 1.0]} />
        <meshStandardMaterial color="#343a49" roughness={0.6} />
      </mesh>
      {/* Cuerpo metálico */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.92, 1.5, 0.92]} />
        <meshStandardMaterial color="#1f2330" roughness={0.7} />
      </mesh>
      {/* Embudo de destino */}
      <mesh ref={funnelRef} position={[0, 1.18, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.16, 0.75, 20]} />
        <meshStandardMaterial
          color={hopper.dest.hex}
          emissive={hopper.dest.hex}
          emissiveIntensity={0.22}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      {/* Anillo superior */}
      <mesh position={[0, 1.64, 0]} castShadow>
        <torusGeometry args={[0.36, 0.05, 12, 28]} />
        <meshStandardMaterial color={hopper.dest.hex} emissive={hopper.dest.hex} emissiveIntensity={0.5} roughness={0.4} />
      </mesh>
      {/* Rótulo */}
      <mesh position={[0, 2.12, 0]}>
        <planeGeometry args={[0.95, 0.34]} />
        <meshBasicMaterial map={labelTex} toneMapped={false} transparent />
      </mesh>
      {/* Luz superior */}
      <mesh position={[0, 2.32, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.24, 0.22, 6]} />
        <meshStandardMaterial color={hopper.dest.hex} emissive={hopper.dest.hex} emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}

function sfx(type) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    if (!AC._inst) AC._inst = new AC()
    const ctx = AC._inst
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const t = ctx.currentTime
    osc.type = 'sine'
    if (type === 'ok') {
      osc.frequency.setValueAtTime(520, t)
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12)
      gain.gain.setValueAtTime(0.18, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    } else if (type === 'bad') {
      osc.frequency.setValueAtTime(220, t)
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.18)
      gain.gain.setValueAtTime(0.22, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
    } else if (type === 'miss') {
      osc.frequency.setValueAtTime(160, t)
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.3)
      gain.gain.setValueAtTime(0.25, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32)
    } else if (type === 'grab') {
      osc.frequency.setValueAtTime(660, t)
      osc.frequency.exponentialRampToValueAtTime(990, t + 0.08)
      gain.gain.setValueAtTime(0.14, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    } else {
      osc.frequency.setValueAtTime(300, t)
      gain.gain.setValueAtTime(0.1, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
    }
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.4)
  } catch {
    /* audio no disponible */
  }
}

export function ConveyorGame() {
  const { camera } = useThree()
  const containerRef = useRef(null)
  const beltTexture = useMemo(() => makeBelt(), [])
  const tipRef = useRef(null)
  const flashRef = useRef({})
  const stateRef = useRef({
    boxes: [],
    nextId: 1,
    spawn: 0.7,
    carried: null,
  })
  const funnelRefs = useRef({})
  const register = useRef((id, mesh) => {
    funnelRefs.current[id] = mesh
    if (mesh) mesh.userData.destId = id
  }).current

  const inProgress = useStore((s) => s.inProgress)
  const prevRun = useRef(inProgress)

  useEffect(() => {
    const root = containerRef.current
    const was = prevRun.current
    prevRun.current = inProgress
    if (!inProgress || was) return
    const s = stateRef.current
    if (s.carried) {
      if (root) root.remove(s.carried.mesh)
      disposeBox(s.carried.mesh)
      s.carried = null
    }
    for (const b of s.boxes) {
      if (root) root.remove(b.mesh)
      disposeBox(b.mesh)
    }
    s.boxes = []
    s.spawn = 0.7
    s.carried = null
  }, [inProgress])

  function flashFx(destId, good) {
    flashRef.current[destId] = { until: performance.now() + 380, good }
  }

  useEffect(() => {
    const onDown = (e) => {
      if (e.button !== 0) return
      if (!document.pointerLockElement) return
      const st = useStore.getState()
      if (st.mode !== 'game' || st.gameOver) return
      const s = stateRef.current
      raycaster.setFromCamera({ x: 0, y: 0 }, camera)

      if (s.carried) {
        const box = s.carried
        const p0 = box.mesh.position.clone()
        raycaster.setFromCamera({ x: 0, y: 0 }, camera)
        _plane.set(new THREE.Vector3(0, 1, 0), -THROW_PLANE_Y)
        const hitPlane = raycaster.ray.intersectPlane(_plane, _target)
        let p1 = p0.clone()
        if (hitPlane) {
          p1.copy(_target)
        } else {
          p1.addScaledVector(_front.set(0, 0, -1).applyEuler(camera.rotation), 7)
        }
        if (p0.distanceTo(p1) < 1.2) {
          p1.copy(p0).addScaledVector(_front.set(0, 0, -1).applyEuler(camera.rotation), 4)
        }

        let destId = null
        for (const [id, mesh] of Object.entries(funnelRefs.current)) {
          if (!mesh) continue
          mesh.getWorldPosition(_funnelPos)
          const dx = p1.x - _funnelPos.x
          const dz = p1.z - _funnelPos.z
          if (dx * dx + dz * dz < 0.62 * 0.62) {
            destId = id
            break
          }
        }

        box.phase = 'thrown'
        box.p0 = p0
        box.p1 = p1
        box.destId = destId
        box.u = 0
        box.T = Math.max(0.55, Math.min(1.3, p0.distanceTo(p1) / 4.0))
      } else {
        const meshes = s.boxes.map((b) => b.mesh)
        const hits = raycaster.intersectObjects(meshes, true)
        if (hits.length && hits[0].distance < GRAB_MAX) {
          const id = hits[0].object.userData.id
          const box = s.boxes.find((b) => b.id === id)
          if (box) {
            box.phase = 'held'
            s.carried = box
            s.boxes = s.boxes.filter((b) => b !== box)
            sfx('grab')
          }
        }
      }
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [camera])

  useFrame((state, delta) => {
    const root = containerRef.current
    if (!root) return
    const st = useStore.getState()
    if (st.mode !== 'game' || st.gameOver || !document.pointerLockElement) return

    const s = stateRef.current
    const level = st.level
    const speed = 1.7 + (level - 1) * 0.22
    const maxOnBelt = Math.min(4 + Math.ceil(level * 0.5), 7)
    const t = state.clock.elapsedTime

    if (beltTexture && beltTexture.offset) beltTexture.offset.x -= delta * speed * 0.16

    if (s.boxes.length < maxOnBelt) {
      s.spawn -= delta
      if (s.spawn <= 0) {
        const dest = DEST[Math.floor(Math.random() * DEST.length)]
        const id = s.nextId++
        const box = {
          id,
          dest: dest.id,
          name: dest.name,
          hex: dest.hex,
          x: SPAWN_X,
          mesh: makeBox(id, dest.hex),
        }
        root.add(box.mesh)
        box.mesh.position.set(SPAWN_X, BELT_TOP + 0.3, 0)
        s.boxes.push(box)
        s.spawn = Math.max(0.85, 2.2 - level * 0.12)
      }
    }

    for (let i = s.boxes.length - 1; i >= 0; i--) {
      const b = s.boxes[i]
      b.x -= speed * delta
      b.mesh.position.x = b.x
      b.mesh.position.y = BELT_TOP + 0.3 + Math.sin(t * 3.2 + b.id * 1.7) * 0.035
      b.mesh.rotation.x = Math.sin(t * 2.4 + b.id) * 0.02
      b.mesh.rotation.z = Math.cos(t * 2.4 + b.id) * 0.02
      if (b.x < DROP_X) {
        root.remove(b.mesh)
        disposeBox(b.mesh)
        s.boxes.splice(i, 1)
        useStore.getState().loseHeart()
        sfx('miss')
      }
    }

    if (s.carried) {
      const c = s.carried
      if (c.phase === 'thrown') {
        c.u += delta / c.T
        if (c.u >= 1) {
          const destId = c.destId
          if (destId) {
            if (destId === c.dest) {
              flashFx(destId, true)
              useStore.getState().addCorrect()
              sfx('ok')
            } else {
              flashFx(destId, false)
              useStore.getState().loseHeart()
              sfx('bad')
            }
          } else {
            sfx('drop')
          }
          root.remove(c.mesh)
          disposeBox(c.mesh)
          s.carried = null
        } else {
          const u = c.u
          c.mesh.position.copy(c.p0).lerp(c.p1, u)
          c.mesh.position.y += THROW_APEX * 4 * u * (1 - u)
          c.mesh.rotation.x += delta * 6
          c.mesh.rotation.z = Math.sin(u * 7) * 0.3
          c.mesh.rotation.y = u * 6
        }
      } else {
        _front.set(0, 0, -1).applyEuler(camera.rotation)
        c.mesh.position.copy(camera.position).addScaledVector(_front, HOLD_DIST)
        c.mesh.position.y = camera.position.y + 0.15
        c.mesh.rotation.set(0, t * 2, 0)
      }
    }

    let tooltip = null
    let aimedHopper = null
    if (s.carried) {
      raycaster.setFromCamera({ x: 0, y: 0 }, camera)
      const funnels = Object.values(funnelRefs.current).filter(Boolean)
      const hits = raycaster.intersectObjects(funnels, false)
      if (hits.length && hits[0].distance < 10) {
        aimedHopper = hits[0].object.userData.destId
        const d = DEST.find((x) => x.id === aimedHopper)
        tooltip = d ? `Lanza a la tolva de ${d.name}` : 'Lanza a la tolva'
      } else {
        tooltip = 'Clic para lanzar la caja'
      }
    } else {
      raycaster.setFromCamera({ x: 0, y: 0 }, camera)
      const meshes = s.boxes.map((b) => b.mesh)
      const hits = raycaster.intersectObjects(meshes, true)
      if (hits.length && hits[0].distance < GRAB_MAX) {
        const id = hits[0].object.userData.id
        const b = s.boxes.find((box) => box.id === id)
        if (b) {
          const d = DEST.find((x) => x.id === b.dest)
          tooltip = d ? `Caja de ${d.name} — clic para levantar` : 'Clic para levantar la caja'
        }
      }
    }
    if (tipRef.current !== tooltip) {
      tipRef.current = tooltip
      useStore.getState().setTarget(tooltip ? { id: 'game', title: tooltip } : null)
    }

    for (const [id, mesh] of Object.entries(funnelRefs.current)) {
      if (!mesh) continue
      const mat = mesh.material
      let target = id === aimedHopper && s.carried ? 0.9 : 0.22
      const f = flashRef.current[id]
      if (f && performance.now() < f.until) target = f.good ? 1.6 : 0.1
      mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, target, 12, delta)
    }

    if (useStore.getState().gameOver && document.pointerLockElement) {
      document.exitPointerLock()
    }
  })

  return (
    <group>
      <group ref={containerRef} />

      {/* Estructura de la banda */}
      <group>
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[16, 0.22, 1.5]} />
          <meshStandardMaterial color="#14171f" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[15.6, 1.34]} />
          <meshBasicMaterial map={beltTexture} toneMapped={false} />
        </mesh>
        {/* Rieles laterales */}
        <mesh position={[0, 1.08, -0.78]} castShadow receiveShadow>
          <boxGeometry args={[16, 0.12, 0.06]} />
          <meshStandardMaterial color="#3a4157" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.08, 0.78]} castShadow receiveShadow>
          <boxGeometry args={[16, 0.12, 0.06]} />
          <meshStandardMaterial color="#3a4157" roughness={0.6} />
        </mesh>
        {/* Patas */}
        {[-7.2, -4.5, 4.5, 7.2].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[-0.55, 0.45, 0]} castShadow>
              <boxGeometry args={[0.12, 0.9, 0.12]} />
              <meshStandardMaterial color="#2a2e38" roughness={0.7} />
            </mesh>
            <mesh position={[0.55, 0.45, 0]} castShadow>
              <boxGeometry args={[0.12, 0.9, 0.12]} />
              <meshStandardMaterial color="#2a2e38" roughness={0.7} />
            </mesh>
          </group>
        ))}
        {/* Tambores */}
        <mesh position={[-8, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 1.62, 24]} />
          <meshStandardMaterial color="#1a1e27" roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position={[8, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 1.62, 24]} />
          <meshStandardMaterial color="#1a1e27" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* Tope de fin de banda */}
        <mesh position={[-8, 0.72, 0]}>
          <boxGeometry args={[0.18, 0.7, 1.4]} />
          <meshStandardMaterial color="#ffd23f" emissive="#ffd23f" emissiveIntensity={0.35} roughness={0.6} />
        </mesh>
      </group>

      {/* Tolvas de clasificación */}
      {HOPPER_SPOTS.map((h) => (
        <Hopper key={h.dest.id} hopper={h} register={register} />
      ))}

      {/* Guía útil junto al spawn */}
      <group position={[8, 0, 1.6]}>
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[0.06, 1.1, 0.8]} />
          <meshStandardMaterial color="#3a4157" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.25, 0]}>
          <planeGeometry args={[2.2, 1.5]} />
          <meshBasicMaterial color="#12161f" toneMapped={false} />
        </mesh>
        <mesh position={[0, 2.14, 0]}>
          <planeGeometry args={[2.0, 0.4]} />
          <meshBasicMaterial color="#3ee6a0" />
        </mesh>
      </group>

      <ambientLight intensity={0.25} />
    </group>
  )
}