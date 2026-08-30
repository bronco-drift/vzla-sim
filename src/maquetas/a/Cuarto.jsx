// The rest of the presidential office: double door, extra windows,
// bookshelf, sofa, flag, rug, plants and a wall clock. Everything is
// low-poly boxes in the scene's palette. Extra windows share one
// useFrame that tints all their glass panes with the day/night sky.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../../store/gameStore.js'
import { colorVidrio } from './Sol.jsx'

const BLANCO = '#f0ebe0'
const MADERA = '#5d3d22'
const MADERA_CLARA = '#7a5230'

/** Simple window with real-world proportions (1.10 x 1.50 m at 1u=1cm):
    white frame + dynamic glass (no photo view). */
function VentanaSimple({ registrarVidrio }) {
  return (
    <group>
      <mesh ref={registrarVidrio}>
        <planeGeometry args={[110, 150]} />
        <meshBasicMaterial color="#1d3a57" />
      </mesh>
      <mesh position={[0, 0, 0.5]}>
        <boxGeometry args={[3, 150, 1.4]} />
        <meshStandardMaterial color={BLANCO} flatShading />
      </mesh>
      <mesh position={[0, 0, 0.55]}>
        <boxGeometry args={[110, 3, 1.4]} />
        <meshStandardMaterial color={BLANCO} flatShading />
      </mesh>
      <mesh position={[0, 77, 0.9]}>
        <boxGeometry args={[124, 6, 3]} />
        <meshStandardMaterial color={BLANCO} flatShading />
      </mesh>
      <mesh position={[0, -77, 0.9]}>
        <boxGeometry args={[124, 6, 3]} />
        <meshStandardMaterial color={BLANCO} flatShading />
      </mesh>
      <mesh position={[-58, 0, 0.9]}>
        <boxGeometry args={[6, 160, 3]} />
        <meshStandardMaterial color={BLANCO} flatShading />
      </mesh>
      <mesh position={[58, 0, 0.9]}>
        <boxGeometry args={[6, 160, 3]} />
        <meshStandardMaterial color={BLANCO} flatShading />
      </mesh>
      {/* sill */}
      <mesh position={[0, -81, 2]}>
        <boxGeometry args={[130, 4, 7]} />
        <meshStandardMaterial color="#e2dccc" flatShading />
      </mesh>
    </group>
  )
}

/** One door leaf with inset panels and a golden knob. */
function HojaPuerta({ espejo = false }) {
  const lado = espejo ? -1 : 1
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[52, 168, 4]} />
        <meshStandardMaterial color={MADERA} flatShading />
      </mesh>
      <mesh position={[0, 38, 2.2]}>
        <boxGeometry args={[36, 60, 1.2]} />
        <meshStandardMaterial color={MADERA_CLARA} flatShading />
      </mesh>
      <mesh position={[0, -38, 2.2]}>
        <boxGeometry args={[36, 60, 1.2]} />
        <meshStandardMaterial color={MADERA_CLARA} flatShading />
      </mesh>
      <mesh position={[lado * 20, 0, 3.4]}>
        <sphereGeometry args={[2.6, 10, 10]} />
        <meshStandardMaterial color="#c9a227" flatShading />
      </mesh>
    </group>
  )
}

const LIBROS = [
  '#8c2d2d', '#2b4faa', '#c9a227', '#3a6b45', '#7a3b6b',
  '#b06030', '#365b8c', '#8c8060', '#5d3d22', '#a03838',
]

export function Cuarto() {
  const vidrios = useRef([])
  const registrar = (m) => m && !vidrios.current.includes(m) && vidrios.current.push(m)

  useFrame(() => {
    const { game, escena } = useGameStore.getState()
    if (!game) return
    const frac = escena.solFijo ?? (game.dias % 365) / 365
    const dia = Math.max(0, Math.sin(frac * Math.PI * 2))
    for (const v of vidrios.current) colorVidrio(dia, v.material.color)
  })

  return (
    <group>
      {/* -- Double door, centered on the left wall (60% larger: 2.85m tall) -- */}
      <group position={[-696, 62, 310]} rotation={[0, Math.PI / 2, 0]} scale={1.6}>
        {/* frame */}
        <mesh position={[0, 89, -1]}>
          <boxGeometry args={[122, 8, 8]} />
          <meshStandardMaterial color={BLANCO} flatShading />
        </mesh>
        <mesh position={[-59, 0, -1]}>
          <boxGeometry args={[8, 178, 8]} />
          <meshStandardMaterial color={BLANCO} flatShading />
        </mesh>
        <mesh position={[59, 0, -1]}>
          <boxGeometry args={[8, 178, 8]} />
          <meshStandardMaterial color={BLANCO} flatShading />
        </mesh>
        <group position={[-27, 0, 0]}>
          <HojaPuerta />
        </group>
        <group position={[27, 0, 0]}>
          <HojaPuerta espejo />
        </group>
      </group>

      {/* -- Extra windows, symmetric with the central Ávila window:
             back wall at ±350, plus one centered on the east wall -- */}
      <group position={[-350, 85, -81.5]}>
        <VentanaSimple registrarVidrio={registrar} />
      </group>
      <group position={[350, 85, -81.5]}>
        <VentanaSimple registrarVidrio={registrar} />
      </group>
      <group position={[698, 85, 310]} rotation={[0, -Math.PI / 2, 0]}>
        <VentanaSimple registrarVidrio={registrar} />
      </group>

      {/* -- Rug under the desk area -- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -79.4, 60]}>
        <circleGeometry args={[290, 40]} />
        <meshStandardMaterial color="#7e2a2a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -79.3, 60]}>
        <ringGeometry args={[270, 284, 40]} />
        <meshStandardMaterial color="#c9a227" />
      </mesh>

      {/* -- Bookshelf against the back wall -- */}
      <group position={[550, -80, -75]}>
        <mesh position={[0, 80, 0]} castShadow>
          <boxGeometry args={[120, 160, 26]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        {[36, 76, 116].map((y) => (
          <group key={y}>
            <mesh position={[0, y + 16, 2]}>
              <boxGeometry args={[108, 2.5, 24]} />
              <meshStandardMaterial color={MADERA_CLARA} flatShading />
            </mesh>
            {LIBROS.slice(0, 8).map((color, i) => (
              <mesh
                key={i}
                position={[-44 + i * 12.5, y + 30, 4]}
                rotation={[0, 0, (i * 7 + y) % 3 === 0 ? 0.08 : 0]}
                castShadow
              >
                <boxGeometry args={[8, 24 - ((i + y) % 3) * 3, 16]} />
                <meshStandardMaterial color={LIBROS[(i + y) % LIBROS.length]} flatShading />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* -- Sofa + low table against the right wall, under its window -- */}
      <group position={[620, -80, 310]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 16, 0]} castShadow>
          <boxGeometry args={[170, 32, 60]} />
          <meshStandardMaterial color="#6d3535" flatShading />
        </mesh>
        <mesh position={[0, 46, -22]} castShadow>
          <boxGeometry args={[170, 44, 16]} />
          <meshStandardMaterial color="#7e3d3d" flatShading />
        </mesh>
        <mesh position={[-79, 34, 0]} castShadow>
          <boxGeometry args={[14, 36, 60]} />
          <meshStandardMaterial color="#7e3d3d" flatShading />
        </mesh>
        <mesh position={[79, 34, 0]} castShadow>
          <boxGeometry args={[14, 36, 60]} />
          <meshStandardMaterial color="#7e3d3d" flatShading />
        </mesh>
        {/* cushions */}
        <mesh position={[-40, 36, 4]}>
          <boxGeometry args={[70, 10, 48]} />
          <meshStandardMaterial color="#8c4747" flatShading />
        </mesh>
        <mesh position={[40, 36, 4]}>
          <boxGeometry args={[70, 10, 48]} />
          <meshStandardMaterial color="#8c4747" flatShading />
        </mesh>
        <mesh position={[0, 12, 78]} castShadow>
          <boxGeometry args={[110, 24, 40]} />
          <meshStandardMaterial color={MADERA_CLARA} flatShading />
        </mesh>
      </group>

      {/* -- Wall clock on the back wall (cylinder rotated to face the room) -- */}
      <group position={[-250, 130, -81]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[16, 16, 2, 24]} />
          <meshStandardMaterial color={BLANCO} flatShading />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.2]}>
          <ringGeometry args={[14.5, 16.5, 24]} />
          <meshStandardMaterial color={MADERA} />
        </mesh>
        <mesh position={[0, 4, 1.4]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.4, 9, 0.6]} />
          <meshStandardMaterial color="#1d1a14" />
        </mesh>
        <mesh position={[3, 1, 1.4]} rotation={[0, 0, -1.1]}>
          <boxGeometry args={[1.2, 7, 0.6]} />
          <meshStandardMaterial color="#1d1a14" />
        </mesh>
      </group>

      {/* -- Plants in two corners -- */}
      {[
        [-640, -30],
        [650, 640],
      ].map(([x, z]) => (
        <group key={`${x},${z}`} position={[x, -80, z]}>
          <mesh position={[0, 12, 0]} castShadow>
            <cylinderGeometry args={[13, 10, 24, 10]} />
            <meshStandardMaterial color="#a05a35" flatShading />
          </mesh>
          <mesh position={[0, 40, 0]} castShadow>
            <icosahedronGeometry args={[20, 0]} />
            <meshStandardMaterial color="#3a6b45" flatShading />
          </mesh>
          <mesh position={[8, 58, 4]} castShadow>
            <icosahedronGeometry args={[12, 0]} />
            <meshStandardMaterial color="#457a50" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}
