// The world outside the office: grass filling the sky cylinder's floor,
// a low horizon gradient that blends the cylinder into the ground, trees
// scattered for scale reference, four big cardinal-point boulders, and a
// tall lamppost beside each boulder that lights up at night.
// All deterministic (seeded) — no Math.random at render time.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'
import { resaltar } from '../resaltar.js'
import { cicloDia } from './Sol.jsx'

const CLAVES_PIEDRAS = ['norte', 'sur', 'este', 'oeste']
const TITULOS_CARTELES = {
  norte: ['PER ASPERA', 'AD ASTRA'],
  sur: ['ROMA NON UNO DIE', 'AEDIFICATA EST'],
  este: ['SOL INVICTUS', 'ORIENS'],
  oeste: ['ACTA', 'NON VERBA'],
}
// Combination digits for the stair padlock (1777, the Captaincy year):
// north carries the 1, the rest carry 7s.
const NUMEROS_CARTELES = { norte: '1', sur: '7', este: '7', oeste: '7' }

/** Plaque texture for the equestrian monument: short centered lines
    with generous margins so nothing touches the frame. */
function crearTexturaPlaca() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#1d2024'
  ctx.fillRect(0, 0, 512, 256)
  ctx.strokeStyle = '#c9a227'
  ctx.lineWidth = 6
  ctx.strokeRect(14, 14, 484, 228)
  ctx.fillStyle = '#e8c95c'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 44px Georgia, serif'
  ctx.fillText('LA NACIÓN', 256, 62)
  ctx.fillText('AGRADECIDA A SU', 256, 116)
  ctx.fillText('LIBERTADOR', 256, 170)
  ctx.font = '28px Georgia, serif'
  ctx.fillText('· 1874 ·', 256, 218)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const BRONCE_ESTATUA = '#59614f' // verdigris bronze, readable at night
const GRANITO = '#3a3f47'

/** Wooden sign texture: carved Latin title + its combination digit. */
function crearTexturaCartel(lineas, numero) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#9b7342'
  ctx.fillRect(0, 0, 512, 256)
  ctx.strokeStyle = '#5d4126'
  ctx.lineWidth = 14
  ctx.strokeRect(10, 10, 492, 236)
  ctx.fillStyle = '#2b1d10'
  ctx.font = 'bold 44px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lineas.forEach((linea, i) => {
    ctx.fillText(linea, 256, 118 + (i - (lineas.length - 1) / 2) * 56)
  })
  // the carved digit, bottom-right corner
  ctx.fillStyle = '#4a3018'
  ctx.font = 'bold 58px Georgia, serif'
  ctx.fillText(numero, 448, 208)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

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
  const texturaPlaca = useMemo(crearTexturaPlaca, [])
  const texturasCarteles = useMemo(() => {
    const mapa = {}
    for (const clave of CLAVES_PIEDRAS)
      mapa[clave] = crearTexturaCartel(TITULOS_CARTELES[clave], NUMEROS_CARTELES[clave])
    return mapa
  }, [])

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
  useFrame((state, delta) => {
    const { game, escena } = useGameStore.getState()
    if (!game) return
    const frac = cicloDia(escena, state.clock.elapsedTime)
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

      {/* big cardinal boulders: N, S, E, O landmarks inside the circle */}
      {PIEDRAS.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, -81 + 90, p.z]}
          scale={[1.35, 0.85, 1.05]}
          rotation={[0.1, i * 1.3, 0.08]}
        >
          <dodecahedronGeometry args={[300, 0]} />
          <meshStandardMaterial color="#7d7f84" flatShading />
        </mesh>
      ))}

      {/* wooden signs beside each boulder, facing the world's center —
          the sign is the interactive part: click it to read the plaque */}
      {PIEDRAS.map((p, i) => {
        const clave = CLAVES_PIEDRAS[i]
        const haciaCentro = Math.atan2(0 - p.x, CENTRO_Z - p.z)
        const despX = Math.sin(haciaCentro)
        const despZ = Math.cos(haciaCentro)
        return (
          <group
            key={clave}
            position={[p.x + despX * 480 + despZ * 260, -81, p.z + despZ * 480 - despX * 260]}
            rotation={[0, haciaCentro, 0]}
            onPointerDown={(e) => {
              e.stopPropagation()
              useGameStore.getState().verPiedra(clave)
            }}
            onPointerOver={(e) => resaltar(e, true)}
            onPointerOut={(e) => resaltar(e, false)}
          >
            {[-90, 90].map((dx) => (
              <mesh key={dx} position={[dx, 80, -6]} castShadow>
                <cylinderGeometry args={[9, 11, 160, 8]} />
                <meshStandardMaterial color="#5d4126" flatShading />
              </mesh>
            ))}
            <mesh position={[0, 130, 0]} castShadow>
              <boxGeometry args={[230, 115, 8]} />
              <meshStandardMaterial map={texturasCarteles[clave]} />
            </mesh>
          </group>
        )
      })}

      {/* -- Equestrian statue of Bolívar (Plaza Bolívar style): rearing
             bronze horse on a stepped granite pedestal with the plaque,
             south of the house by the path torches, facing the house -- */}
      <group
        position={[370, -81, 2220]}
        rotation={[0, Math.PI / 2, 0]}
        onPointerDown={(e) => {
          e.stopPropagation()
          useGameStore.getState().devolverHueso()
        }}
        onPointerOver={(e) => resaltar(e, true)}
        onPointerOut={(e) => resaltar(e, false)}
      >
        {/* stepped pedestal */}
        <mesh position={[0, 20, 0]} castShadow>
          <boxGeometry args={[320, 40, 220]} />
          <meshStandardMaterial color={GRANITO} flatShading />
        </mesh>
        <mesh position={[0, 55, 0]} castShadow>
          <boxGeometry args={[260, 30, 170]} />
          <meshStandardMaterial color="#2e3238" flatShading />
        </mesh>
        <mesh position={[0, 155, 0]} castShadow>
          <boxGeometry args={[200, 170, 120]} />
          <meshStandardMaterial color={GRANITO} flatShading />
        </mesh>
        <mesh position={[0, 248, 0]} castShadow>
          <boxGeometry args={[214, 16, 134]} />
          <meshStandardMaterial color="#2e3238" flatShading />
        </mesh>
        {/* plaque (faces the house) */}
        <mesh position={[101.5, 152, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[110, 55]} />
          <meshBasicMaterial map={texturaPlaca} />
        </mesh>

        {/* plaza uplights: two warm floods at the base, always on —
            they read as monument lighting at night, invisible by day */}
        {[-90, 90].map((dz) => (
          <pointLight
            key={dz}
            position={[130, 40, dz]}
            color="#ffd9a0"
            intensity={900}
            distance={620}
            decay={1.3}
          />
        ))}
        <pointLight
          position={[-120, 60, 0]}
          color="#ffd9a0"
          intensity={600}
          distance={520}
          decay={1.3}
        />

        {/* rearing horse + rider, bronze (built facing +x) */}
        <group position={[0, 256, 0]} scale={1.35}>
          {/* body, tilted up at the chest */}
          <mesh position={[0, 60, 0]} rotation={[0, 0, 0.35]} castShadow>
            <boxGeometry args={[92, 42, 36]} />
            <meshStandardMaterial color={BRONCE_ESTATUA} flatShading />
          </mesh>
          {/* neck + head */}
          <mesh position={[42, 96, 0]} rotation={[0, 0, 0.85]} castShadow>
            <boxGeometry args={[26, 40, 22]} />
            <meshStandardMaterial color={BRONCE_ESTATUA} flatShading />
          </mesh>
          <mesh position={[58, 116, 0]} rotation={[0, 0, 0.35]}>
            <boxGeometry args={[30, 15, 18]} />
            <meshStandardMaterial color={BRONCE_ESTATUA} flatShading />
          </mesh>
          {[-6, 6].map((dz) => (
            <mesh key={dz} position={[50, 128, dz]}>
              <boxGeometry args={[6, 10, 4]} />
              <meshStandardMaterial color={BRONCE_ESTATUA} flatShading />
            </mesh>
          ))}
          {/* hind legs planted on the pedestal */}
          {[-11, 11].map((dz) => (
            <mesh key={dz} position={[-32, 22, dz]} rotation={[0, 0, -0.15]} castShadow>
              <boxGeometry args={[12, 52, 11]} />
              <meshStandardMaterial color={BRONCE_ESTATUA} flatShading />
            </mesh>
          ))}
          {/* forelegs curled in the air */}
          {[-9, 9].map((dz) => (
            <mesh key={dz} position={[38, 58, dz]} rotation={[0, 0, 1.15]} castShadow>
              <boxGeometry args={[10, 38, 9]} />
              <meshStandardMaterial color={BRONCE_ESTATUA} flatShading />
            </mesh>
          ))}
          {/* tail sweeping down */}
          <mesh position={[-52, 42, 0]} rotation={[0, 0, -0.8]} castShadow>
            <boxGeometry args={[12, 44, 10]} />
            <meshStandardMaterial color={BRONCE_ESTATUA} flatShading />
          </mesh>
          {/* Bolívar: torso, cape, head, pointing arm */}
          <mesh position={[-4, 100, 0]} rotation={[0, 0, 0.15]} castShadow>
            <boxGeometry args={[20, 34, 17]} />
            <meshStandardMaterial color="#2f3430" flatShading />
          </mesh>
          <mesh position={[-15, 96, 0]} rotation={[0, 0, -0.25]}>
            <boxGeometry args={[8, 36, 22]} />
            <meshStandardMaterial color="#262b27" flatShading />
          </mesh>
          <mesh position={[0, 124, 0]}>
            <boxGeometry args={[12, 14, 12]} />
            <meshStandardMaterial color={BRONCE_ESTATUA} flatShading />
          </mesh>
          <mesh position={[16, 112, 5]} rotation={[0, 0, -0.5]}>
            <boxGeometry args={[26, 7, 7]} />
            <meshStandardMaterial color="#2f3430" flatShading />
          </mesh>
          {/* legs astride */}
          {[-11.5, 11.5].map((dz) => (
            <mesh key={dz} position={[2, 76, dz]} rotation={[0, 0, 0.4]}>
              <boxGeometry args={[9, 26, 6]} />
              <meshStandardMaterial color="#2f3430" flatShading />
            </mesh>
          ))}
        </group>
      </group>

      {/* -- The looted tomb: a dug-open grave beside the monument, with
             a broken headstone, dirt piles and an abandoned shovel.
             Click it to read the plundering notice (future quest hook) -- */}
      <group
        position={[680, -81, 2420]}
        rotation={[0, 0.4, 0]}
        onPointerDown={(e) => {
          e.stopPropagation()
          useGameStore.getState().verTumba()
        }}
        onPointerOver={(e) => resaltar(e, true)}
        onPointerOut={(e) => resaltar(e, false)}
      >
        {/* dark pit (sunken floor) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -26, 0]}>
          <planeGeometry args={[92, 52]} />
          <meshStandardMaterial color="#12100c" />
        </mesh>
        {/* pit walls */}
        {[
          [0, -13, -26, 92, 26, 4],
          [0, -13, 26, 92, 26, 4],
          [-46, -13, 0, 4, 26, 52],
          [46, -13, 0, 4, 26, 52],
        ].map(([x, y, z, w, h, d], i) => (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#3a2c1a" flatShading />
          </mesh>
        ))}
        {/* raised dirt rim */}
        {[
          [0, 3, -30, 100, 8, 8],
          [0, 3, 30, 100, 8, 8],
          [-50, 3, 0, 8, 8, 60],
          [50, 3, 0, 8, 8, 60],
        ].map(([x, y, z, w, h, d], i) => (
          <mesh key={`r${i}`} position={[x, y, z]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#4a3a22" flatShading />
          </mesh>
        ))}
        {/* dirt piles */}
        <mesh position={[74, 8, -18]} scale={[1.4, 0.6, 1.1]}>
          <icosahedronGeometry args={[18, 0]} />
          <meshStandardMaterial color="#4a3a22" flatShading />
        </mesh>
        <mesh position={[66, 5, 22]} scale={[1, 0.5, 0.9]}>
          <icosahedronGeometry args={[14, 0]} />
          <meshStandardMaterial color="#54422a" flatShading />
        </mesh>
        {/* broken headstone: standing half + fallen half */}
        <mesh position={[-58, 22, 0]} rotation={[0, Math.PI / 2, 0.12]} castShadow>
          <boxGeometry args={[40, 44, 8]} />
          <meshStandardMaterial color="#6f7278" flatShading />
        </mesh>
        <mesh position={[-40, 3, 30]} rotation={[0.3, 0.9, 1.45]} castShadow>
          <boxGeometry args={[34, 26, 8]} />
          <meshStandardMaterial color="#7d8085" flatShading />
        </mesh>
        {/* abandoned shovel leaning on the rim */}
        <group position={[36, 0, 34]} rotation={[0.5, 0.3, -0.35]}>
          <mesh position={[0, 30, 0]}>
            <cylinderGeometry args={[1.8, 1.8, 60, 6]} />
            <meshStandardMaterial color="#5d4126" flatShading />
          </mesh>
          <mesh position={[0, -2, 0]}>
            <boxGeometry args={[12, 16, 2.5]} />
            <meshStandardMaterial color="#8a8f96" flatShading />
          </mesh>
        </group>
      </group>

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
