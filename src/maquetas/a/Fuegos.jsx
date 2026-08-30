// Fireworks show for the quest's ending: staggered rockets rise around
// the statue and the house, then burst into expanding, fading spheres of
// particles — flag colors (yellow, blue, red) plus gold. Runs ~16s and
// switches itself off. Pure buffer animation, no external libs.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'

const COLORES = ['#f5c518', '#3b6ff0', '#e04545', '#ffd9a0']
const N_PARTICULAS = 42
const DURACION_SHOW = 16

function crearCohetes() {
  // deterministic-ish variety is fine here; Math.random is OK at runtime
  const lanzamientos = []
  for (let i = 0; i < 10; i++) {
    lanzamientos.push({
      t0: 0.4 + i * 1.4 + Math.random() * 0.5,
      x: (Math.random() - 0.5) * 1600 + 370,
      z: 1600 + Math.random() * 1100,
      alturaPico: 700 + Math.random() * 500,
      color: new THREE.Color(COLORES[i % COLORES.length]),
      subida: 1.1 + Math.random() * 0.3,
      // burst directions: random points on a sphere
      dirs: Array.from({ length: N_PARTICULAS }, () => {
        const u = Math.random() * 2 - 1
        const ang = Math.random() * Math.PI * 2
        const r = Math.sqrt(1 - u * u)
        return [r * Math.cos(ang), u, r * Math.sin(ang)]
      }),
      vel: 260 + Math.random() * 140,
    })
  }
  return lanzamientos
}

function Cohete({ datos, reloj }) {
  const puntoRef = useRef()
  const estallidoRef = useRef()
  const geometria = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(N_PARTICULAS * 3), 3),
    )
    return g
  }, [])

  useFrame(() => {
    const t = reloj.current - datos.t0
    const punto = puntoRef.current
    const estallido = estallidoRef.current
    if (!punto || !estallido) return

    if (t < 0) {
      punto.visible = false
      estallido.visible = false
      return
    }
    if (t < datos.subida) {
      // rising streak
      const k = t / datos.subida
      punto.visible = true
      estallido.visible = false
      punto.position.set(datos.x, -80 + datos.alturaPico * k * k, datos.z)
      return
    }
    punto.visible = false
    const tv = t - datos.subida // burst age
    const VIDA = 1.9
    if (tv > VIDA) {
      estallido.visible = false
      return
    }
    estallido.visible = true
    const pos = geometria.attributes.position.array
    const radio = datos.vel * tv
    const caida = 140 * tv * tv
    for (let i = 0; i < N_PARTICULAS; i++) {
      const d = datos.dirs[i]
      pos[i * 3] = datos.x + d[0] * radio
      pos[i * 3 + 1] = -80 + datos.alturaPico + d[1] * radio - caida
      pos[i * 3 + 2] = datos.z + d[2] * radio
    }
    geometria.attributes.position.needsUpdate = true
    estallido.material.opacity = Math.max(0, 1 - tv / VIDA)
    estallido.material.size = 16 + tv * 10
  })

  return (
    <group>
      <mesh ref={puntoRef} visible={false}>
        <sphereGeometry args={[6, 8, 8]} />
        <meshBasicMaterial color={datos.color} fog={false} />
      </mesh>
      <points ref={estallidoRef} geometry={geometria} visible={false}>
        <pointsMaterial
          color={datos.color}
          size={16}
          transparent
          opacity={1}
          depthWrite={false}
          sizeAttenuation
          fog={false}
        />
      </points>
    </group>
  )
}

export function Fuegos() {
  const cohetes = useMemo(crearCohetes, [])
  const reloj = useRef(0)

  useFrame((_, delta) => {
    reloj.current += delta
    if (reloj.current > DURACION_SHOW) {
      useGameStore.getState().apagarFuegos()
    }
  })

  return (
    <group>
      {cohetes.map((c, i) => (
        <Cohete key={i} datos={c} reloj={reloj} />
      ))}
    </group>
  )
}
