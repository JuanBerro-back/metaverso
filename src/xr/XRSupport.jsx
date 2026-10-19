import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { XR_ENABLED } from '../lib/capabilities.js'
import { useStore } from '../store.js'
import { playerState } from '../player/state.js'
import { WALK_BOUND } from '../museum/config.js'
import { STATION_REGISTRY, REGISTRY } from '../museum/registry.js'
import { XRInfoBoard } from '../components/XRInfoBoard.jsx'
import { look } from '../components/PointerLock.jsx'

/** Velocidad del desplazamiento continuo con el joystick (m/s). */
const MOVE_SPEED = 2.4
/** Zona muerta del joystick para el movimiento. */
const AXIS_DEADZONE = 0.18
/** Umbral mínimo para decidir qué par de ejes del mando usar. */
const STICK_MIN = 0.05
/** Giro por pasos: umbral, ángulo y espera entre pasos (segundos). */
const TURN_THRESHOLD = 0.65
const TURN_STEP = Math.PI / 6 // 30° por paso
const TURN_COOLDOWN = 0.3

const _headPos = new THREE.Vector3()
const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _destino = new THREE.Vector3()

/**
 * Lee el joystick de un mando WebXR.
 *
 * Se admite cualquier mando: el mapa estándar (`xr-standard`) expone el
 * joystick en los ejes 2 y 3 y el touchpad en los ejes 0 y 1, pero algunos
 * mandos solo publican dos ejes. Se prefiere el par que esté en uso.
 *
 * @returns {{x:number,y:number}|null} `null` si el mando no trae ejes.
 */
function leerStick(gamepad) {
  try {
    const axes = gamepad?.axes
    if (!axes || axes.length < 2) return null
    if (axes.length >= 4) {
      const x = axes[2] || 0
      const y = axes[3] || 0
      if (Math.abs(x) > STICK_MIN || Math.abs(y) > STICK_MIN) return { x, y }
    }
    return { x: axes[0] || 0, y: axes[1] || 0 }
  } catch {
    return null
  }
}

/** Vibración corta en el mando que hizo la acción (si el mando la soporta). */
function vibrar(gamepad, intensidad = 0.35, ms = 70) {
  try {
    const actuador = gamepad?.hapticActuators?.[0]
    if (actuador && typeof actuador.pulse === 'function') actuador.pulse(intensidad, ms)
  } catch {
    /* algunos mandos no exponen háptica */
  }
}

/**
 * Soporte WebXR.
 *
 * - Activa `renderer.xr` y añade el `VRButton` oficial de Three.js.
 * - R3F pasa automáticamente el bucle a `renderer.setAnimationLoop` al entrar
 *   en sesión XR (ver @react-three/fiber: `gl.xr.setAnimationLoop(...)`).
 * - Locomoción: teletransporte apuntando con el gatillo + desplazamiento
 *   continuo y giro por pasos con el joystick, con **cualquier mando** que
 *   siga el mapa estándar de WebXR.
 * - Interacción: el rayo del mando abre la ficha de una estación/cartel en una
 *   pizarra 3D (`XRInfoBoard`), porque los paneles HTML no se ven en VR.
 *
 * Todas las operaciones están protegidas: si el dispositivo no soporta WebXR o
 * algo falla, el modo escritorio sigue funcionando exactamente igual.
 */
export function XRSupport() {
  const { gl, scene, camera } = useThree()
  const rigRef = useRef(null)
  const controllersRef = useRef([])
  const markerRef = useRef(null)
  const giroRef = useRef({ espera: 0 })
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const floorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])

  useEffect(() => {
    if (!XR_ENABLED) return undefined
    if (typeof navigator === 'undefined' || !navigator.xr) return undefined

    const creados = []
    let button = null

    try {
      /* ---------------- Rig del jugador ---------------- */
      // El rig es el suelo del jugador: moverlo = desplazarse.
      const rig = new THREE.Group()
      rig.name = 'xr-rig'
      scene.add(rig)
      // La cámara de R3F se cuelga del rig para que su transformación se aplique.
      rig.add(camera)
      rigRef.current = rig

      /* ---------------- Mandos ---------------- */
      for (let i = 0; i < 2; i++) {
        const controller = gl.xr.getController(i)
        controller.name = `xr-controller-${i}`

        const geometria = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -1),
        ])
        const rayo = new THREE.Line(geometria, new THREE.LineBasicMaterial({ color: '#7fd8ff', transparent: true, opacity: 0.8 }))
        rayo.name = 'xr-ray'
        rayo.scale.z = 4
        controller.add(rayo)

        const punta = new THREE.Mesh(
          new THREE.SphereGeometry(0.012, 10, 10),
          new THREE.MeshBasicMaterial({ color: '#ffffff' })
        )
        punta.position.z = -0.01
        controller.add(punta)

        const onSelect = () => manejarSelect(controller, i)
        controller.addEventListener('selectstart', onSelect)
        controller.userData.onSelect = onSelect

        rig.add(controller) // comparte el espacio del rig, como la cámara
        creados.push(controller)
        controllersRef.current[i] = controller
      }

      /* ---------------- Marca de teletransporte ---------------- */
      const marker = new THREE.Mesh(
        new THREE.RingGeometry(0.16, 0.24, 28),
        new THREE.MeshBasicMaterial({ color: '#3ee6a0', transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide })
      )
      marker.rotation.x = -Math.PI / 2
      marker.position.y = 0.02
      marker.visible = false
      scene.add(marker)
      markerRef.current = marker

      /* ---------------- Botón VR oficial ---------------- */
      const previo = document.getElementById('VRButton')
      if (previo) previo.remove()
      button = VRButton.createButton(gl)
      button.id = 'VRButton'
      document.body.appendChild(button)
    } catch (err) {
      console.warn('[Xupply][XR] no se pudo preparar WebXR:', err)
      return undefined
    }

    /** Mando del índice indicado dentro de la sesión (para la vibración). */
    function mandoDe(indice) {
      try {
        return gl.xr.getSession()?.inputSources?.[indice]?.gamepad || null
      } catch {
        return null
      }
    }

    function manejarSelect(controller, indice) {
      try {
        raycaster.setFromXRController(controller)
        const interactivos = [...STATION_REGISTRY.values(), ...REGISTRY.values()]
        const hits = interactivos.length ? raycaster.intersectObjects(interactivos, false) : []
        const info = hits.length ? hits[0].object.userData.interact : null

        if (info && info.kind === 'station') {
          vibrar(mandoDe(indice))
          useStore.getState().setXrBoard({ kind: 'station', id: info.id })
          return
        }
        if (info && info.kind === 'poster') {
          vibrar(mandoDe(indice))
          useStore.getState().setXrBoard({ kind: 'poster', id: info.id })
          return
        }

        // Sin objetivo interactivo: teletransporte al punto del suelo.
        if (raycaster.ray.intersectPlane(floorPlane, _destino)) {
          const rig = rigRef.current
          if (!rig) return
          rig.position.x = Math.max(-WALK_BOUND, Math.min(WALK_BOUND, _destino.x))
          rig.position.z = Math.max(-WALK_BOUND, Math.min(WALK_BOUND, _destino.z))
          playerState.x = rig.position.x
          playerState.z = rig.position.z
          useStore.getState().setXrBoard(null)
          vibrar(mandoDe(indice), 0.5, 90)
        }
      } catch (err) {
        console.warn('[Xupply][XR] error al seleccionar:', err)
      }
    }

    /* ---------------- Ciclo de sesión ---------------- */
    const onSessionStart = () => {
      const st = useStore.getState()
      // En VR: sin sombras pesadas y sin interfaz HTML; cuidamos el rendimiento.
      st.setXrActive(true)
      st.setShadows(false)

      const rig = rigRef.current
      if (rig) {
        // Al salir de una sesión anterior la cámara queda suelta: se vuelve a
        // colgar del rig para que el desplazamiento la arrastre.
        if (camera.parent !== rig) rig.add(camera)
        rig.position.set(playerState.x, 0, playerState.z)
        // Se entra mirando hacia donde miraba el jugador en el escritorio.
        rig.rotation.set(0, look.yaw || 0, 0)
      }

      // Pizarra de ayuda con los controles, para que nadie se pierda dentro.
      st.setXrBoard({ kind: 'help' })
      console.info('[Xupply][XR] sesión inmersiva iniciada')
    }

    const onSessionEnd = () => {
      const st = useStore.getState()
      st.setXrActive(false)
      st.setXrBoard(null)
      // Recupera las sombras del modo escritorio según la calidad elegida.
      st.setShadows(st.quality !== 'baja')

      const rig = rigRef.current
      if (rig) {
        playerState.x = rig.position.x
        playerState.z = rig.position.z
        playerState.yaw = rig.rotation.y
        // El escritorio retoma la cámara desde donde quedó el visor.
        look.yaw = rig.rotation.y
        rig.remove(camera)
        rig.position.set(0, 0, 0)
        rig.rotation.set(0, 0, 0)
      }
      console.info('[Xupply][XR] sesión inmersiva terminada')
    }

    gl.xr.addEventListener('sessionstart', onSessionStart)
    gl.xr.addEventListener('sessionend', onSessionEnd)

    /* ---------------- Limpieza ---------------- */
    return () => {
      try {
        gl.xr.removeEventListener('sessionstart', onSessionStart)
        gl.xr.removeEventListener('sessionend', onSessionEnd)
        for (const c of creados) {
          if (c.userData.onSelect) c.removeEventListener('selectstart', c.userData.onSelect)
          c.parent?.remove(c)
        }
        if (markerRef.current) {
          scene.remove(markerRef.current)
          markerRef.current.geometry.dispose()
          markerRef.current.material.dispose()
          markerRef.current = null
        }
        if (rigRef.current) {
          rigRef.current.remove(camera)
          scene.remove(rigRef.current)
          rigRef.current = null
        }
        if (button) button.remove()
        controllersRef.current = []
      } catch (err) {
        console.warn('[Xupply][XR] limpieza incompleta:', err)
      }
    }
  }, [gl, scene, camera, raycaster, floorPlane])

  /* ---------------- Por fotograma: locomoción y puntería ---------------- */
  useFrame((_, delta) => {
    const gl2 = gl
    if (!gl2.xr.isPresenting) {
      if (markerRef.current?.visible) markerRef.current.visible = false
      return
    }

    const rig = rigRef.current
    if (!rig) return
    const d = Math.min(delta, 0.05)

    /* Mandos: desplazamiento continuo y giro por pasos relativos a la mirada */
    try {
      const session = gl2.xr.getSession()
      if (session?.inputSources) {
        camera.getWorldPosition(_headPos)
        _forward.set(_headPos.x - rig.position.x, 0, _headPos.z - rig.position.z)
        if (_forward.lengthSq() < 1e-6) _forward.set(0, 0, -1)
        _forward.normalize()
        _right.set(-_forward.z, 0, _forward.x)

        const fuentes = []
        for (const src of session.inputSources) {
          const stick = leerStick(src.gamepad)
          if (stick) fuentes.push({ src, stick })
        }
        // Si solo hay un mando (o ninguno se declara como izquierdo), ese mando
        // también puede caminar: nunca se queda sin poder moverse.
        const hayIzquierda = fuentes.some((f) => f.src.handedness !== 'right')

        const giro = giroRef.current
        giro.espera = Math.max(0, giro.espera - d)

        for (const { src, stick } of fuentes) {
          const esGiro = src.handedness === 'right' && hayIzquierda

          if (esGiro) {
            // Giro por pasos: más cómodo y sin mareo que el giro continuo.
            if (giro.espera === 0 && Math.abs(stick.x) > TURN_THRESHOLD) {
              rig.rotation.y -= Math.sign(stick.x) * TURN_STEP
              giro.espera = TURN_COOLDOWN
            }
            continue
          }

          const x = Math.abs(stick.x) < AXIS_DEADZONE ? 0 : stick.x
          const y = Math.abs(stick.y) < AXIS_DEADZONE ? 0 : stick.y
          if (x === 0 && y === 0) continue

          rig.position.x += (_right.x * x + _forward.x * -y) * MOVE_SPEED * d
          rig.position.z += (_right.z * x + _forward.z * -y) * MOVE_SPEED * d

          // Al empezar a caminar se retira la pizarra de ayuda.
          if (useStore.getState().xrBoard?.kind === 'help') useStore.getState().setXrBoard(null)
        }

        rig.position.x = Math.max(-WALK_BOUND, Math.min(WALK_BOUND, rig.position.x))
        rig.position.z = Math.max(-WALK_BOUND, Math.min(WALK_BOUND, rig.position.z))
        rig.position.y = 0
      }
    } catch {
      /* el mando puede no exponer gamepad */
    }

    /* Mantener el avatar de escritorio en el mismo sitio al salir de VR */
    playerState.x = rig.position.x
    playerState.z = rig.position.z

    /* Marca de teletransporte bajo el rayo del mando */
    const marker = markerRef.current
    if (marker) {
      let visible = false
      for (const c of controllersRef.current) {
        if (!c) continue
        try {
          raycaster.setFromXRController(c)
          if (raycaster.ray.intersectPlane(floorPlane, _destino)) {
            marker.position.set(_destino.x, 0.02, _destino.z)
            marker.visible = true
            visible = true
            break
          }
        } catch {
          /* noop */
        }
      }
      if (!visible) marker.visible = false
    }
  })

  return <XRInfoBoard />
}

/** Indica si WebXR está disponible en este navegador/dispositivo. */
export function xrDisponibleEnNavegador() {
  return Boolean(XR_ENABLED && typeof navigator !== 'undefined' && navigator.xr)
}
