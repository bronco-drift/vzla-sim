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
    // exact slab footprints (west strip, east strip, south piece west of
    // the stair opening, and the narrow piece north of it)
    const enMezzanine =
      (x > -694 && x < -500 && z > -86 && z < 701) ||
      (x > 500 && x < 694 && z > -86 && z < 701) ||
      (x > -500 && x < 220 && z > 507 && z < 701) ||
      (x > 220 && x < 500 && z > 507 && z < 592)
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
  const drag = useRef(null)

  useEffect(() => {
    // spawn at the blue figure's position, looking north
    const { escena } = useGameStore.getState()
    const inicio = escena.humano2 ?? { x: -500, z: 310 }
    camera.position.set(inicio.x, PISO + ALTURA_OJOS, inicio.z)
    rot.current.yaw = 0
    rot.current.pitch = 0
    window.__camaraLibreDebug = camera
    window.__rotDebug = rot.current // dev aid: steer the look from console

    const lienzo = gl.domElement
    const abajo = (e) => {
      if (e.button !== 0) return
      drag.current = { x: e.clientX, y: e.clientY }
      try {
        lienzo.setPointerCapture(e.pointerId)
      } catch {
        /* fine */
      }
    }
    const mover = (e) => {
      if (!drag.current) return
      if (e.buttons === 0) {
        drag.current = null
        return
      }
      rot.current.yaw -= (e.clientX - drag.current.x) * SENS
      rot.current.pitch -= (e.clientY - drag.current.y) * SENS
      rot.current.pitch = Math.max(-1.4, Math.min(1.4, rot.current.pitch))
      drag.current = { x: e.clientX, y: e.clientY }
    }
    const arriba = () => (drag.current = null)
    const menu = (e) => e.preventDefault()
    const tecla = (v) => (e) => {
      if (e.repeat) return
      const k = e.key.toLowerCase()
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault()
      teclas.current[k] = v
      // E: open/close the door when standing near it (either side)
      if (v && k === 'e') {
        const cerca = Math.hypot(camera.position.x + 700, camera.position.z - 310) < 420
        if (cerca) useGameStore.getState().togglePuerta()
      }
    }
    const baja = tecla(true)
    const sube = tecla(false)
    const soltarTodo = () => {
      teclas.current = {}
      drag.current = null
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
      // leave the blue figure standing where the walk ended
      useGameStore
        .getState()
        .setEscena({ humano2: { x: camera.position.x, z: camera.position.z } })
    }
  }, [camera, gl])

  useFrame((_, delta) => {
    if (useGameStore.getState().arrastreHumano) drag.current = null
    if (!document.hasFocus()) teclas.current = {}
    const t = teclas.current
    const { yaw, pitch } = rot.current
    camera.rotation.set(pitch, yaw, 0, 'YXZ')

    const rapida = t['shift'] ? 2.4 : 1
    const paso = VEL_CAMINAR * rapida * Math.min(delta, 0.05)
    const avance = (t['w'] || t['arrowup'] ? 1 : 0) - (t['s'] || t['arrowdown'] ? 1 : 0)
    const lado = (t['d'] || t['arrowright'] ? 1 : 0) - (t['a'] || t['arrowleft'] ? 1 : 0)

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

    // Mezzanine railings are solid while you're up there
    if (yPieActual > 200) {
      if (prox.z > -86 && prox.z < 593 && cruza(prev.x, prox.x, -495)) prox.x = prev.x
      if (prox.z > -86 && prox.z < 592 && cruza(prev.x, prox.x, 495)) prox.x = prev.x
      if (prox.x > -500 && prox.x < 220 && cruza(prev.z, prox.z, 512)) prox.z = prev.z
      if (prox.z > 592 && prox.z < 707 && cruza(prev.x, prox.x, 215)) prox.x = prev.x
      if (prox.x > 220 && prox.x < 500 && cruza(prev.z, prox.z, 597)) prox.z = prev.z
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
