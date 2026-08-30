// First-person walking as the blue figure: drag to look, WASD/arrows to
// walk (flat — feet on the ground at eye height 1.58m), SHIFT to run.
// Simple wall collisions: the room blocks you, the door opening lets you
// through when the door is open. On exit, the figure is left standing
// where you walked to.
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore.js'

const ALTURA_OJOS = 158 // eyes above the feet
const PISO = -80
const VEL_CAMINAR = 450 // 4.5 m/s
const SENS = 0.0034
const RADIO_MUNDO = 9300

// Room box: x ±700, z -86..707. Door opening on the west wall.
const PUERTA = { z1: 224, z2: 396 }

/** Ground height under (x,z). Mirrors the stairs and mezzanine geometry
    in Cuarto.jsx. The mezzanine only counts as ground if you're already
    up high (otherwise you're walking UNDER it). */
function alturaSuelo(x, z, yPie) {
  // stairs on the south wall, east stretch (12 steps, 28.9 each).
  // The top step extends to x<500 so it hands over to the mezzanine
  // slab (x>495) with no gap to fall through.
  if (z > 592 && z < 707 && x > 58 && x < 500) {
    const i = Math.min(11, Math.floor((x - 60) / 34))
    return PISO + (i + 1) * 28.9
  }
  if (yPie > 200) {
    // east walkway + landing deck. Footprints reach the REAL walls
    // (x 700 / z -86..707) so hugging a wall up there never drops you.
    const enMezzanine =
      (x > 500 && x < 705 && z > -90 && z < 705) ||
      (x > 464 && x < 505 && z > 588 && z < 705)
    if (enMezzanine) return 267
  }
  return PISO
}

function cruza(a, b, limite) {
  return (a - limite) * (b - limite) < 0
}

/** Block wall crossings (axis-aligned), letting the open door through. */
function chocarConCuarto(prev, prox, puertaAbierta) {
  const dentroX = prox.x > -710 && prox.x < 710
  const dentroZ = prox.z > -96 && prox.z < 717
  if (dentroX) {
    if (cruza(prev.z, prox.z, -86) || cruza(prev.z, prox.z, 707)) prox.z = prev.z
  }
  if (dentroZ) {
    const porLaPuerta = puertaAbierta && prox.z > PUERTA.z1 && prox.z < PUERTA.z2
    if (cruza(prev.x, prox.x, -700) && !porLaPuerta) prox.x = prev.x
    if (cruza(prev.x, prox.x, 700)) prox.x = prev.x
  }
}

export function ControlesPOV() {
  const { camera, gl } = useThree()
  const rot = useRef({ yaw: 0, pitch: 0 })
  const teclas = useRef({})
  const drag = useRef(null) // look drag: {id, x, y}
  const mando = useRef(null) // touch walk-stick: {id, x0, y0, dx, dy}
  const mandoMirar = useRef(null) // touch look-stick: {id, x0, y0, dx, dy}

  useEffect(() => {
    // spawn at the blue figure's position, looking north
    const { escena } = useGameStore.getState()
    const inicio = escena.humano2 ?? { x: -200, z: 155 }
    camera.position.set(inicio.x, PISO + ALTURA_OJOS, inicio.z)
    rot.current.yaw = 0
    rot.current.pitch = 0
    window.__camaraLibreDebug = camera
    window.__rotDebug = rot.current // dev aid: steer the look from console

    const lienzo = gl.domElement
    const abajo = (e) => {
      if (e.button !== 0) return
      // Touch on the LEFT half = virtual walk-stick; anything else
      // (right-half touch, or any mouse press) = look drag. Each side
      // tracks its own pointerId so both thumbs work at once.
      const r = lienzo.getBoundingClientRect()
      if (e.pointerType === 'touch' && e.clientX - r.left < r.width / 2) {
        mando.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 }
        return
      }
      // Touch near the bottom-right corner = LOOK STICK: thumb tilt sets
      // turn speed, so the finger never travels toward screen edges
      // (edge swipes are iOS back/forward gestures that steal the drag).
      if (
        e.pointerType === 'touch' &&
        e.clientX - r.left > r.width - 200 &&
        e.clientY - r.top > r.height - 320
      ) {
        mandoMirar.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 }
        return
      }
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
      try {
        lienzo.setPointerCapture(e.pointerId)
      } catch {
        /* fine */
      }
    }
    const mover = (e) => {
      if (mando.current && e.pointerId === mando.current.id) {
        mando.current.dx = Math.max(-60, Math.min(60, e.clientX - mando.current.x0))
        mando.current.dy = Math.max(-60, Math.min(60, e.clientY - mando.current.y0))
        return
      }
      if (mandoMirar.current && e.pointerId === mandoMirar.current.id) {
        mandoMirar.current.dx = Math.max(-55, Math.min(55, e.clientX - mandoMirar.current.x0))
        mandoMirar.current.dy = Math.max(-55, Math.min(55, e.clientY - mandoMirar.current.y0))
        return
      }
      if (!drag.current || e.pointerId !== drag.current.id) return
      if (e.pointerType === 'mouse' && e.buttons === 0) {
        drag.current = null
        return
      }
      rot.current.yaw -= (e.clientX - drag.current.x) * SENS
      rot.current.pitch -= (e.clientY - drag.current.y) * SENS
      rot.current.pitch = Math.max(-1.4, Math.min(1.4, rot.current.pitch))
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
    }
    const arriba = (e) => {
      if (mando.current && e.pointerId === mando.current.id) mando.current = null
      if (mandoMirar.current && e.pointerId === mandoMirar.current.id) mandoMirar.current = null
      if (drag.current && e.pointerId === drag.current.id) drag.current = null
    }
    const menu = (e) => e.preventDefault()
    const tecla = (v) => (e) => {
      if (e.repeat) return
      const k = e.key.toLowerCase()
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault()
      teclas.current[k] = v
      // E: door when near it; the DESK when near it (sit down to govern
      // — swaps back to the map camera)
      if (v && k === 'e') {
        const st = useGameStore.getState()
        const cercaPuerta = Math.hypot(camera.position.x + 700, camera.position.z - 310) < 420
        const cercaMapa =
          Math.abs(camera.position.x) < 260 && Math.abs(camera.position.z) < 180
        if (cercaPuerta) st.togglePuerta()
        else if (cercaMapa) st.toggleCamaraPov()
      }
    }
    const baja = tecla(true)
    const sube = tecla(false)
    const soltarTodo = () => {
      teclas.current = {}
      drag.current = null
      mando.current = null
      mandoMirar.current = null
    }

    lienzo.addEventListener('pointerdown', abajo)
    lienzo.addEventListener('pointermove', mover)
    lienzo.addEventListener('pointerup', arriba)
    lienzo.addEventListener('pointercancel', arriba)
    lienzo.addEventListener('pointerleave', arriba)
    lienzo.addEventListener('contextmenu', menu)
    window.addEventListener('keydown', baja)
    window.addEventListener('keyup', sube)
    window.addEventListener('blur', soltarTodo)
    document.addEventListener('visibilitychange', soltarTodo)
    return () => {
      lienzo.removeEventListener('pointerdown', abajo)
      lienzo.removeEventListener('pointermove', mover)
      lienzo.removeEventListener('pointerup', arriba)
      lienzo.removeEventListener('pointercancel', arriba)
      lienzo.removeEventListener('pointerleave', arriba)
      lienzo.removeEventListener('contextmenu', menu)
      window.removeEventListener('keydown', baja)
      window.removeEventListener('keyup', sube)
      window.removeEventListener('blur', soltarTodo)
      document.removeEventListener('visibilitychange', soltarTodo)
      // leave the blue figure standing where the walk ended — but never
      // INSIDE the desk block: step him out to its south front instead
      let hx = camera.position.x
      let hz = camera.position.z
      if (Math.abs(hx) < 225 && Math.abs(hz) < 140) {
        hz = 155
        hx = Math.max(-200, Math.min(200, hx))
      }
      useGameStore.getState().setEscena({ humano2: { x: hx, z: hz } })
    }
  }, [camera, gl])

  useFrame((_, delta) => {
    if (useGameStore.getState().arrastreHumano) drag.current = null
    if (!document.hasFocus()) teclas.current = {}
    const t = teclas.current
    // look stick: thumb tilt = angular velocity (shooter-style)
    const jm = mandoMirar.current
    if (jm) {
      rot.current.yaw -= (jm.dx / 55) * 2.4 * delta
      rot.current.pitch -= (jm.dy / 55) * 1.8 * delta
      rot.current.pitch = Math.max(-1.4, Math.min(1.4, rot.current.pitch))
    }
    const { yaw, pitch } = rot.current
    camera.rotation.set(pitch, yaw, 0, 'YXZ')

    const rapida = t['shift'] ? 2.4 : 1
    const paso = VEL_CAMINAR * rapida * Math.min(delta, 0.05)
    const j = mando.current // touch stick adds analog movement
    const avance = Math.max(
      -1,
      Math.min(
        1,
        (t['w'] || t['arrowup'] ? 1 : 0) - (t['s'] || t['arrowdown'] ? 1 : 0) + (j ? -j.dy / 50 : 0),
      ),
    )
    const lado = Math.max(
      -1,
      Math.min(
        1,
        (t['d'] || t['arrowright'] ? 1 : 0) - (t['a'] || t['arrowleft'] ? 1 : 0) + (j ? j.dx / 50 : 0),
      ),
    )

    const prev = { x: camera.position.x, z: camera.position.z }
    const prox = {
      x: prev.x + (-Math.sin(yaw) * avance + Math.cos(yaw) * lado) * paso,
      z: prev.z + (-Math.cos(yaw) * avance - Math.sin(yaw) * lado) * paso,
    }

    const estado = useGameStore.getState()
    const yPieActual = camera.position.y - ALTURA_OJOS
    chocarConCuarto(prev, prox, estado.puertaAbierta)

    // The VIP rope at the stair base is solid until its padlock is opened
    // (ground level only — it must NOT ghost-block the mezzanine above)
    if (
      !estado.quest.candadoAbierto &&
      yPieActual < 150 &&
      prox.z > 588 &&
      prox.z < 707 &&
      cruza(prev.x, prox.x, 40)
    ) {
      prox.x = prev.x
    }

    // Upstairs railings are solid: the walkway's west edge, the landing
    // deck's north edge, and the stair's open north side (handrail) —
    // that last one only while you're at stair height, so ground-floor
    // walking underneath stays free.
    if (yPieActual > 200) {
      if (prox.z > -86 && prox.z < 592 && cruza(prev.x, prox.x, 495)) prox.x = prev.x
      if (prox.x > 464 && prox.x < 505 && cruza(prev.z, prox.z, 592)) prox.z = prev.z
    }
    if (
      yPieActual > -60 &&
      yPieActual < 255 &&
      prox.x > 58 &&
      prox.x < 468 &&
      cruza(prev.z, prox.z, 595)
    ) {
      prox.z = prev.z
    }

    // stay inside the sky cylinder
    const dx = prox.x
    const dz = prox.z - 310
    const dist = Math.hypot(dx, dz)
    if (dist > RADIO_MUNDO) {
      prox.x = (dx / dist) * RADIO_MUNDO
      prox.z = 310 + (dz / dist) * RADIO_MUNDO
    }

    // Vertical: climb steps (small rises), get blocked by tall ledges,
    // fall with simple gravity when stepping off an edge.
    let yPie = yPieActual
    const suelo = alturaSuelo(prox.x, prox.z, yPie)
    if (suelo > yPie + 55) {
      prox.x = prev.x
      prox.z = prev.z
    } else if (suelo >= yPie - 6) {
      yPie = suelo
    } else {
      yPie = Math.max(suelo, yPie - 1100 * Math.min(delta, 0.05))
    }

    camera.position.set(prox.x, yPie + ALTURA_OJOS, prox.z)
  })

  return null
}
