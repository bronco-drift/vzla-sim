// The world outside the office: grass filling the sky cylinder's floor,
// a low horizon gradient that blends the cylinder into the ground, trees
// scattered for scale reference, four big cardinal-point boulders, and a
// tall lamppost beside each boulder that lights up at night.
// All deterministic (seeded) — no Math.random at render time.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'

const CLAVES_PIEDRAS = ['norte', 'sur', 'este', 'oeste']

const CENTRO_Z = 310 // the sky cylinder's center
const RADIO_CESPED = 9520

/** Vertical gradient texture: grass-brown at the bottom, transparent up. */
function crearGradienteHorizonte() {
  const c = document.createElement('canvas')
  c.width = 8
  c.height = 256
  const ctx = c.getContext('2d')
  const grad = ctx.createLinearGradient(0, 256, 0, 0)
  grad.addColorStop(0, 'rgba(93, 122, 78, 0.95)') // greenish brown
  grad.addColorStop(0.45, 'rgba(93, 122, 78, 0.45)')
  grad.addColorStop(1, 'rgba(93, 122, 78, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 8, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function Exterior() {
  const gradiente = useMemo(crearGradienteHorizonte, [])

  // Seeded scatter of trees on the grass ring (outside the room)
  const arboles = useMemo(() => {
    let semilla = 7
    const azar = () => {
      semilla = (semilla * 16807) % 2147483647
      return semilla / 2147483647
    }
    const lista = []
    for (let i = 0; i < 42; i++) {
      const ang = azar() * Math.PI * 2
      const r = 1500 + azar() * 7000
      const x = Math.cos(ang) * r
      const z = CENTRO_Z + Math.sin(ang) * r
      const escala = 0.7 + azar() * 1.1
      lista.push({ x, z, escala, pino: azar() < 0.45, giro: azar() * Math.PI })
    }
    return lista
  }, [])

  const PIEDRAS = [
    { x: 0, z: CENTRO_Z - 8800 }, // north
    { x: 0, z: CENTRO_Z + 8800 }, // south
    { x: 8800, z: CENTRO_Z },     // east
    { x: -8800, z: CENTRO_Z },    // west
  ]
  // Lampposts sit beside their boulder (offset sideways)
  const POSTES = PIEDRAS.map((p, i) =>
    i < 2 ? { x: p.x + 450, z: p.z } : { x: p.x, z: p.z + 450 },
  )
  const lucesRef = useRef([])
  const focosRef = useRef([])

  // Lamppost bulbs follow the day/night cycle (on at night, soft ramp)
  useFrame((_, delta) => {
    const { game, escena } = useGameStore.getState()
    if (!game) return
    const frac = escena.solFijo ?? (game.dias % 365) / 365
    const solAltura = Math.sin(frac * Math.PI * 2)
    const objetivo = solAltura < 0.12 ? 2200 : 0
    for (let i = 0; i < 4; i++) {
      const luz = lucesRef.current[i]
      const foco = focosRef.current[i]
      if (!luz) continue
      luz.intensity += (objetivo - luz.intensity) * Math.min(1, delta * 3)
      if (foco) foco.material.color.set(luz.intensity > 100 ? '#ffe9a8' : '#3a3f4a')
    }
  })

  return (
    <group>
      {/* grass disc filling the sky cylinder's floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -81, CENTRO_Z]}>
        <circleGeometry args={[RADIO_CESPED, 48]} />
        <meshStandardMaterial color="#4d8a54" />
      </mesh>

      {/* horizon gradient: camouflages where the sky meets the ground */}
      <mesh position={[0, -81 + 400, CENTRO_Z]}>
        <cylinderGeometry args={[9470, 9470, 800, 64, 1, true]} />
        <meshStandardMaterial
          map={gradiente}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* reference trees (6-12m tall at 1u=1cm) */}
      {arboles.map((a, i) => (
        <group key={i} position={[a.x, -81, a.z]} scale={a.escala} rotation={[0, a.giro, 0]}>
          <mesh position={[0, 200, 0]}>
            <cylinderGeometry args={[28, 42, 400, 7]} />
            <meshStandardMaterial color="#5d4126" flatShading />
          </mesh>
          {a.pino ? (
            <mesh position={[0, 640, 0]}>
              <coneGeometry args={[240, 620, 8]} />
              <meshStandardMaterial color="#35663f" flatShading />
            </mesh>
          ) : (
            <>
              <mesh position={[0, 560, 0]}>
                <icosahedronGeometry args={[260, 0]} />
                <meshStandardMaterial color="#4a8050" flatShading />
              </mesh>
              <mesh position={[150, 700, 60]}>
                <icosahedronGeometry args={[150, 0]} />
                <meshStandardMaterial color="#578f5c" flatShading />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* big cardinal boulders: N, S, E, O landmarks inside the circle.
          Click one to read its Roman-Venezuelan inscription. */}
      {PIEDRAS.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, -81 + 90, p.z]}
          scale={[1.35, 0.85, 1.05]}
          rotation={[0.1, i * 1.3, 0.08]}
          onPointerDown={(e) => {
            e.stopPropagation()
            useGameStore.getState().verPiedra(CLAVES_PIEDRAS[i])
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <dodecahedronGeometry args={[300, 0]} />
          <meshStandardMaterial color="#7d7f84" flatShading />
        </mesh>
      ))}

      {/* tall lampposts (6m) beside each boulder, lit at night */}
      {POSTES.map((p, i) => (
        <group key={i} position={[p.x, -81, p.z]}>
          <mesh position={[0, 30, 0]}>
            <cylinderGeometry args={[50, 65, 60, 8]} />
            <meshStandardMaterial color="#2f333a" flatShading />
          </mesh>
          <mesh position={[0, 310, 0]}>
            <cylinderGeometry args={[20, 26, 520, 8]} />
            <meshStandardMaterial color="#3a3f47" flatShading />
          </mesh>
          {/* lamp head: cap + glowing globe */}
          <mesh position={[0, 610, 0]}>
            <coneGeometry args={[70, 60, 8]} />
            <meshStandardMaterial color="#2f333a" flatShading />
          </mesh>
          <mesh ref={(el) => (focosRef.current[i] = el)} position={[0, 565, 0]}>
            <sphereGeometry args={[42, 12, 12]} />
            <meshBasicMaterial color="#3a3f4a" />
          </mesh>
          <pointLight
            ref={(el) => (lucesRef.current[i] = el)}
            position={[0, 555, 0]}
            intensity={0}
            distance={2600}
            decay={1.2}
            color="#ffd9a0"
          />
        </group>
      ))}
    </group>
  )
}
