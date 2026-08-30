// Free-fly camera ("levitate around the room"): drag to look, WASD or
// arrows to move toward where you look, SPACE up / C down, SHIFT = fast.
// Replaces MapControls while active. Position is clamped to the room.
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore.js'

const VEL = 160 // units per second
const SENS = 0.0034 // radians per pixel of drag
// Flight bounds: the room (14 x 7.9 m) plus ~100 m of open air on every
// side and above — the hard edge of the whole navigable map.
const LIMITES = { x: 10700, yMin: 6, yMax: 10000, zMin: -10100, zMax: 10700 }

export function ControlesLibres() {
  const { camera, gl } = useThree()
  const rot = useRef({ yaw: 0, pitch: 0 })
  const teclas = useRef({})
  const drag = useRef(null)

  useEffect(() => {
    // start from the camera's current orientation for a seamless takeoff
    camera.rotation.reorder('YXZ')
    rot.current.yaw = camera.rotation.y
    rot.current.pitch = camera.rotation.x
    window.__camaraLibreDebug = camera // dev aid: inspect from the console
    window.__rotDebug = rot.current // dev aid: steer the look from console

    const lienzo = gl.domElement
    const abajo = (e) => {
      // left button (or touch) only: right/middle clicks open menus or
      // autoscroll and their pointerup can vanish — a classic stuck drag
      if (e.button !== 0) return
      drag.current = { x: e.clientX, y: e.clientY }
      try {
        lienzo.setPointerCapture(e.pointerId)
      } catch {
        /* synthetic or stale pointers can't be captured — fine */
      }
    }
    const mover = (e) => {
      if (!drag.current) return
      // a lost pointerup would leave the camera glued to the mouse:
      // if no button is actually held anymore, stop the look-drag
      if (e.buttons === 0) {
        drag.current = null
        return
      }
      rot.current.yaw -= (e.clientX - drag.current.x) * SENS
      rot.current.pitch -= (e.clientY - drag.current.y) * SENS
      rot.current.pitch = Math.max(-1.45, Math.min(1.45, rot.current.pitch))
      drag.current = { x: e.clientX, y: e.clientY }
    }
    const arriba = () => (drag.current = null)
    const menu = (e) => e.preventDefault() // no context menu mid-flight
    const tecla = (v) => (e) => {
      if (e.repeat) return
      const k = e.key.toLowerCase()
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault()
      teclas.current[k] = v
    }
    const baja = tecla(true)
    const sube = tecla(false)
    // Focus loss eats keyup events → a key stays "pressed" forever and
    // the camera drifts on its own. Clear everything whenever focus goes.
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
    }
  }, [camera, gl])

  useFrame((_, delta) => {
    // dragging the reference human must not also spin the camera
    if (useGameStore.getState().arrastreHumano) drag.current = null
    // belt and suspenders: an unfocused page can't receive keyups, so
    // don't let held keys keep flying the camera
    if (!document.hasFocus()) teclas.current = {}
    const t = teclas.current
    const { yaw, pitch } = rot.current
    camera.rotation.set(pitch, yaw, 0, 'YXZ')

    const rapida = t['shift'] ? 3 : 1
    const paso = VEL * rapida * Math.min(delta, 0.05)
    const avance = (t['w'] || t['arrowup'] ? 1 : 0) - (t['s'] || t['arrowdown'] ? 1 : 0)
    const lado = (t['d'] || t['arrowright'] ? 1 : 0) - (t['a'] || t['arrowleft'] ? 1 : 0)
    const vertical = (t[' '] ? 1 : 0) - (t['c'] ? 1 : 0)

    // forward includes pitch (Minecraft-creative flying); strafe stays flat
    camera.position.x +=
      (-Math.sin(yaw) * Math.cos(pitch) * avance + Math.cos(yaw) * lado) * paso
    camera.position.z +=
      (-Math.cos(yaw) * Math.cos(pitch) * avance - Math.sin(yaw) * lado) * paso
    camera.position.y += (Math.sin(pitch) * avance + vertical) * paso

    camera.position.x = Math.max(-LIMITES.x, Math.min(LIMITES.x, camera.position.x))
    camera.position.y = Math.max(LIMITES.yMin, Math.min(LIMITES.yMax, camera.position.y))
    camera.position.z = Math.max(LIMITES.zMin, Math.min(LIMITES.zMax, camera.position.z))
  })

  return null
}
