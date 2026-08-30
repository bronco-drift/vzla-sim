// Placeable light sources: floor lamp (person-height), wall sconce, and
// torch (wall or floor). Placement raycasts against LOGICAL planes (the
// floor and the four room walls) so it works from any camera mode; the
// list persists in escena.luces. Left-drag moves a light (walls included),
// right-click removes it. Torch flames flicker in one shared useFrame.
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'

const PISO_Y = -80
// wall planes: [axis, at, min/max of the other axis, y range]
const PAREDES = [
  { eje: 'x', valor: -700, zMin: -86, zMax: 707 },
  { eje: 'x', valor: 700, zMin: -86, zMax: 707 },
  { eje: 'z', valor: -86, xMin: -700, xMax: 700 },
  { eje: 'z', valor: 707, xMin: -700, xMax: 700 },
]

/** Intersect a ray with floor + walls; return the closest valid hit. */
function golpear(raycaster, tipo) {
  const hits = []
  const punto = new THREE.Vector3()

  if (tipo !== 'aplique') {
    const piso = new THREE.Plane(new THREE.Vector3(0, 1, 0), -PISO_Y)
    if (raycaster.ray.intersectPlane(piso, punto)) {
      const d = raycaster.ray.origin.distanceTo(punto)
      if (Math.hypot(punto.x, punto.z - 310) < 9200) {
        hits.push({ d, tipo: 'piso', x: punto.x, y: PISO_Y, z: punto.z })
      }
    }
  }
  if (tipo !== 'pie') {
    for (const p of PAREDES) {
      const normalHacia = raycaster.ray.origin[p.eje] > p.valor ? 1 : -1
      const normal =
        p.eje === 'x'
          ? new THREE.Vector3(normalHacia, 0, 0)
          : new THREE.Vector3(0, 0, normalHacia)
      const plano = new THREE.Plane(normal, -(p.valor * normalHacia))
      if (!raycaster.ray.intersectPlane(plano, punto)) continue
      const dentro =
        p.eje === 'x'
          ? punto.z > p.zMin && punto.z < p.zMax
          : punto.x > p.xMin && punto.x < p.xMax
      if (!dentro || punto.y < PISO_Y + 20 || punto.y > 350) continue
      hits.push({
        d: raycaster.ray.origin.distanceTo(punto),
        tipo: 'pared',
        x: punto.x,
        y: Math.min(300, Math.max(-40, punto.y)),
        z: punto.z,
        nx: p.eje === 'x' ? normalHacia : 0,
        nz: p.eje === 'z' ? normalHacia : 0,
      })
    }
  }
  hits.sort((a, b) => a.d - b.d)
  return hits[0] ?? null
}

/** Click-to-place handler (active only while colocandoLuz is set). */
export function ColocadorLuces() {
  const { camera, gl } = useThree()

  useEffect(() => {
    const lienzo = gl.domElement
    const alClick = (e) => {
      const { colocandoLuz, agregarLuz } = useGameStore.getState()
      if (!colocandoLuz || e.button !== 0) return
      const r = lienzo.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      )
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(ndc, camera)
      const hit = golpear(raycaster, colocandoLuz)
      if (!hit) return
      agregarLuz({
        tipo: colocandoLuz,
        superficie: hit.tipo,
        x: hit.x,
        y: hit.y,
        z: hit.z,
        nx: hit.nx ?? 0,
        nz: hit.nz ?? 0,
      })
    }
    lienzo.addEventListener('pointerdown', alClick)
    return () => lienzo.removeEventListener('pointerdown', alClick)
  }, [camera, gl])

  return null
}

const CREMA = '#efe6d0'
const BRONCE = '#8a6a3a'

function LamparaPie({ luz, quitar }) {
  return (
    <group position={[luz.x, PISO_Y, luz.z]} onContextMenu={quitar} onPointerDown={quitar}>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[14, 17, 6, 10]} />
        <meshStandardMaterial color={BRONCE} flatShading />
      </mesh>
      <mesh position={[0, 85, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 160, 8]} />
        <meshStandardMaterial color={BRONCE} flatShading />
      </mesh>
      <mesh position={[0, 168, 0]} castShadow>
        <cylinderGeometry args={[16, 24, 30, 10, 1, true]} />
        <meshStandardMaterial color={CREMA} flatShading side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 160, 0]}>
        <sphereGeometry args={[6, 10, 10]} />
        <meshBasicMaterial color="#ffe9a8" />
      </mesh>
      <pointLight position={[0, 158, 0]} color="#ffd9a0" intensity={520} distance={800} decay={1.3} />
    </group>
  )
}

function Aplique({ luz, quitar }) {
  const giro = Math.atan2(luz.nx, luz.nz)
  return (
    <group position={[luz.x, luz.y, luz.z]} rotation={[0, giro, 0]} onContextMenu={quitar} onPointerDown={quitar}>
      <mesh position={[0, 0, 2]}>
        <boxGeometry args={[14, 26, 4]} />
        <meshStandardMaterial color={BRONCE} flatShading />
      </mesh>
      <mesh position={[0, 8, 12]} castShadow>
        <cylinderGeometry args={[12, 5, 16, 8, 1, true]} />
        <meshStandardMaterial color={CREMA} flatShading side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 10, 12]}>
        <sphereGeometry args={[4.5, 10, 10]} />
        <meshBasicMaterial color="#ffe9a8" />
      </mesh>
      <pointLight position={[0, 14, 22]} color="#ffd9a0" intensity={400} distance={620} decay={1.3} />
    </group>
  )
}

function Antorcha({ luz, quitar, registrarLlama }) {
  const enPared = luz.superficie === 'pared'
  const giro = enPared ? Math.atan2(luz.nx, luz.nz) : 0
  return (
    <group
      position={[luz.x, luz.y, luz.z]}
      rotation={[0, giro, 0]}
      onContextMenu={quitar}
      onPointerDown={quitar}
    >
      {enPared ? (
        <group rotation={[0.5, 0, 0]}>
          <mesh position={[0, 20, 4]} castShadow>
            <cylinderGeometry args={[3, 4, 52, 7]} />
            <meshStandardMaterial color="#5d4126" flatShading />
          </mesh>
          <mesh position={[0, 44, 4]}>
            <cylinderGeometry args={[7, 5, 10, 8]} />
            <meshStandardMaterial color="#4a4f57" flatShading />
          </mesh>
          <mesh ref={registrarLlama} position={[0, 56, 4]}>
            <coneGeometry args={[7, 20, 7]} />
            <meshBasicMaterial color="#ff9a3c" />
          </mesh>
          <pointLight position={[0, 58, 8]} color="#ff8c42" intensity={430} distance={640} decay={1.4} />
        </group>
      ) : (
        <group>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[8, 10, 5, 8]} />
            <meshStandardMaterial color="#6f7278" flatShading />
          </mesh>
          <mesh position={[0, 34, 0]} castShadow>
            <cylinderGeometry args={[3, 4, 62, 7]} />
            <meshStandardMaterial color="#5d4126" flatShading />
          </mesh>
          <mesh position={[0, 66, 0]}>
            <cylinderGeometry args={[7, 5, 10, 8]} />
            <meshStandardMaterial color="#4a4f57" flatShading />
          </mesh>
          <mesh ref={registrarLlama} position={[0, 80, 0]}>
            <coneGeometry args={[7, 22, 7]} />
            <meshBasicMaterial color="#ff9a3c" />
          </mesh>
          <pointLight position={[0, 82, 0]} color="#ff8c42" intensity={430} distance={640} decay={1.4} />
        </group>
      )}
    </group>
  )
}

export function Luces() {
  const luces = useGameStore((s) => s.escena.luces) ?? []
  const quitarLuz = useGameStore((s) => s.quitarLuz)
  const moverLuz = useGameStore((s) => s.moverLuz)
  const setArrastreHumano = useGameStore((s) => s.setArrastreHumano)
  const { camera, gl, controls } = useThree()
  const arrastre = useRef(null) // { indice, tipo }
  const llamas = useRef([])

  // Drag a placed light: left-press it, move, release. Re-uses the same
  // plane raycast as placement, so lights can even hop between walls.
  useEffect(() => {
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const mover = (e) => {
      if (!arrastre.current) return
      if (e.buttons === 0) return soltar()
      const r = gl.domElement.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      const hit = golpear(raycaster, arrastre.current.tipo)
      if (!hit) return
      moverLuz(arrastre.current.indice, {
        superficie: hit.tipo,
        x: hit.x,
        y: hit.y,
        z: hit.z,
        nx: hit.nx ?? 0,
        nz: hit.nz ?? 0,
      })
    }
    const soltar = () => {
      if (!arrastre.current) return
      arrastre.current = null
      setArrastreHumano(false)
      if (controls) controls.enabled = true
      document.body.style.cursor = 'auto'
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
    return () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
    }
  }, [camera, gl, controls, moverLuz, setArrastreHumano])

  // torch flames flicker (scale + tint), each with its own phase
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    llamas.current.forEach((m, i) => {
      if (!m) return
      const f = 0.9 + 0.18 * Math.sin(t * 9 + i * 2.1) + 0.08 * Math.sin(t * 23 + i)
      m.scale.set(f, 1.6 - f * 0.5, f)
      const luzPadre = m.parent?.children.find((c) => c.isPointLight)
      if (luzPadre) luzPadre.intensity = 430 * (0.8 + 0.35 * (f - 0.85))
    })
  })

  llamas.current.length = 0
  return (
    <group>
      {luces.map((luz, i) => {
        const quitar = (e) => {
          if (e.button === 2) {
            e.stopPropagation()
            quitarLuz(i)
            return
          }
          if (e.button !== 0) return
          // left press: start dragging this light
          e.stopPropagation()
          arrastre.current = { indice: i, tipo: luz.tipo }
          setArrastreHumano(true)
          if (controls) controls.enabled = false
          document.body.style.cursor = 'grabbing'
        }
        const registrarLlama = (m) => m && llamas.current.push(m)
        if (luz.tipo === 'pie') return <LamparaPie key={i} luz={luz} quitar={quitar} />
        if (luz.tipo === 'aplique') return <Aplique key={i} luz={luz} quitar={quitar} />
        return <Antorcha key={i} luz={luz} quitar={quitar} registrarLlama={registrarLlama} />
      })}
    </group>
  )
}
