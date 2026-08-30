// The rest of the presidential office: double door (click to open, leaves
// swing on hinges over a REAL opening in the west wall), extra windows,
// bookshelf, sofa, rug, plants and a wall clock. Everything is low-poly
// boxes in the scene's palette. The extra windows are REAL wall holes
// (cut in Escritorio.jsx) — this component is just frame + faint glass;
// the sky cylinder behind provides the actual day/night view.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'

const BLANCO = '#f0ebe0'
const MADERA = '#5d3d22'
const MADERA_CLARA = '#7a5230'

/** Window frame with real-world proportions (1.10 x 1.50 m at 1u=1cm)
    over a wall hole: white frame + a faint glass sheen. */
function VentanaSimple() {
  return (
    <group>
      <mesh>
        <planeGeometry args={[110, 150]} />
        <meshBasicMaterial color="#cfe4f0" transparent opacity={0.14} />
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

/** One door leaf, same style on BOTH faces: inset panels + golden knob. */
function HojaPuerta({ espejo = false }) {
  const lado = espejo ? -1 : 1
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[52, 168, 4]} />
        <meshStandardMaterial color={MADERA} flatShading />
      </mesh>
      {[2.2, -2.2].map((z) => (
        <group key={z}>
          <mesh position={[0, 38, z]}>
            <boxGeometry args={[36, 60, 1.2]} />
            <meshStandardMaterial color={MADERA_CLARA} flatShading />
          </mesh>
          <mesh position={[0, -38, z]}>
            <boxGeometry args={[36, 60, 1.2]} />
            <meshStandardMaterial color={MADERA_CLARA} flatShading />
          </mesh>
          <mesh position={[lado * 20, 0, z > 0 ? 3.4 : -3.4]}>
            <sphereGeometry args={[2.6, 10, 10]} />
            <meshStandardMaterial color="#c9a227" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

const LIBROS = [
  '#8c2d2d', '#2b4faa', '#c9a227', '#3a6b45', '#7a3b6b',
  '#b06030', '#365b8c', '#8c8060', '#5d3d22', '#a03838',
]

const MARMOL = '#ece5d3'

/** Roman column, floor to wall top (4.5m): plinth, fluted shaft
    (low-segment cylinder + flatShading fakes the flutes), capital. */
function ColumnaRomana() {
  return (
    <group>
      <mesh position={[0, 10, 0]} castShadow>
        <boxGeometry args={[70, 20, 70]} />
        <meshStandardMaterial color={MARMOL} flatShading />
      </mesh>
      <mesh position={[0, 26, 0]}>
        <boxGeometry args={[58, 12, 58]} />
        <meshStandardMaterial color={MARMOL} flatShading />
      </mesh>
      <mesh position={[0, 223, 0]} castShadow>
        <cylinderGeometry args={[21, 25, 382, 10]} />
        <meshStandardMaterial color={MARMOL} flatShading />
      </mesh>
      <mesh position={[0, 421, 0]}>
        <boxGeometry args={[54, 14, 54]} />
        <meshStandardMaterial color={MARMOL} flatShading />
      </mesh>
      <mesh position={[0, 435, 0]}>
        <boxGeometry args={[70, 14, 70]} />
        <meshStandardMaterial color={MARMOL} flatShading />
      </mesh>
      <mesh position={[0, 446, 0]}>
        <boxGeometry args={[76, 8, 76]} />
        <meshStandardMaterial color={MARMOL} flatShading />
      </mesh>
    </group>
  )
}

export function Cuarto() {
  // Triangular pediment shapes: big one for the west facade (base 830,
  // rise 170) and a small one over the door frame (base 250, rise 62)
  const formaFronton = useMemo(() => {
    const f = new THREE.Shape()
    f.moveTo(-415, 0)
    f.lineTo(415, 0)
    f.lineTo(0, 170)
    f.closePath()
    return f
  }, [])
  const formaFrontonPuerta = useMemo(() => {
    const f = new THREE.Shape()
    f.moveTo(-125, 0)
    f.lineTo(125, 0)
    f.lineTo(0, 62)
    f.closePath()
    return f
  }, [])

  const puertaAbierta = useGameStore((s) => s.puertaAbierta)
  const togglePuerta = useGameStore((s) => s.togglePuerta)
  const candadoAbierto = useGameStore((s) => s.quest.candadoAbierto)
  const cofreAbierto = useGameStore((s) => s.quest.cofreAbierto)
  const tieneTarjeta = useGameStore((s) => s.quest.tieneTarjeta)
  const puertaDesbloqueada = useGameStore((s) => s.quest.puertaDesbloqueada)
  const hojaIzqRef = useRef()
  const hojaDerRef = useRef()
  const tapaCofreRef = useRef()

  // Door leaves ease toward open (±105°) or closed on their hinges;
  // the chest lid swings back the same way
  useFrame((_, delta) => {
    const objetivo = puertaAbierta ? 1.83 : 0
    const k = Math.min(1, delta * 4)
    if (hojaIzqRef.current) {
      hojaIzqRef.current.rotation.y += (-objetivo - hojaIzqRef.current.rotation.y) * k
    }
    if (hojaDerRef.current) {
      hojaDerRef.current.rotation.y += (objetivo - hojaDerRef.current.rotation.y) * k
    }
    if (tapaCofreRef.current) {
      const abierto = useGameStore.getState().quest.cofreAbierto ? -1.9 : 0
      tapaCofreRef.current.rotation.x += (abierto - tapaCofreRef.current.rotation.x) * k
    }
  })

  return (
    <group>
      {/* -- Double door over the REAL opening, centered on the west wall.
             Click toggles it; each leaf swings on its outer-edge hinge -- */}
      <group
        position={[-696, 62, 310]}
        rotation={[0, Math.PI / 2, 0]}
        scale={1.6}
        onPointerDown={(e) => {
          e.stopPropagation()
          togglePuerta()
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
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
        {/* hinge groups at the outer edges; leaves offset inward */}
        <group ref={hojaIzqRef} position={[-54, 0, 0]}>
          <group position={[27, 0, 0]}>
            <HojaPuerta />
          </group>
        </group>
        <group ref={hojaDerRef} position={[54, 0, 0]}>
          <group position={[-27, 0, 0]}>
            <HojaPuerta espejo />
          </group>
        </group>
      </group>

      {/* -- Extra windows over their REAL wall holes: back wall at ±350
             (symmetric with the central Ávila window), east wall center -- */}
      <group position={[-350, 85, -81.5]}>
        <VentanaSimple />
      </group>
      <group position={[350, 85, -81.5]}>
        <VentanaSimple />
      </group>
      <group position={[698, 85, 310]} rotation={[0, -Math.PI / 2, 0]}>
        <VentanaSimple />
      </group>

      {/* -- Rug under the desk area (sized to stay INSIDE the back wall) -- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -79.4, 100]}>
        <circleGeometry args={[185, 40]} />
        <meshStandardMaterial color="#7e2a2a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -79.3, 100]}>
        <ringGeometry args={[168, 180, 40]} />
        <meshStandardMaterial color="#c9a227" />
      </mesh>

      {/* -- LIBRARY against the back wall: floor-to-near-ceiling shelves.
             One golden spine — "Cesarismo democrático" — is clickable and
             starts the quest (its modal hands over the bronze key). -- */}
      <group position={[535, -80, -70]}>
        <mesh position={[0, 190, 0]} castShadow>
          <boxGeometry args={[240, 380, 30]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        {[10, 72, 134, 196, 258, 320].map((y, fila) => (
          <group key={y}>
            <mesh position={[0, y + 52, 3]}>
              <boxGeometry args={[224, 3, 27]} />
              <meshStandardMaterial color={MADERA_CLARA} flatShading />
            </mesh>
            {Array.from({ length: 15 }, (_, i) => i).map((i) =>
              (i * 13 + fila * 7) % 5 === 4 ? null : (
                <mesh
                  key={i}
                  position={[-98 + i * 14, y + 26, 5]}
                  rotation={[0, 0, (i * 11 + fila) % 4 === 0 ? 0.07 : 0]}
                  castShadow
                >
                  <boxGeometry args={[9, 40 - ((i + fila) % 4) * 4, 18]} />
                  <meshStandardMaterial
                    color={LIBROS[(i * 3 + fila) % LIBROS.length]}
                    flatShading
                  />
                </mesh>
              ),
            )}
          </group>
        ))}
        {/* the golden book (chest height, easy to spot) + fat hitbox */}
        <mesh position={[-28, 160, 7]} castShadow>
          <boxGeometry args={[11, 38, 22]} />
          <meshStandardMaterial color="#c9a227" flatShading />
        </mesh>
        <mesh
          visible={false}
          position={[-28, 160, 10]}
          onPointerDown={(e) => {
            e.stopPropagation()
            useGameStore.getState().abrirLibro()
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <boxGeometry args={[30, 50, 30]} />
        </mesh>
      </group>

      {/* -- VIP rope + padlock guarding the stairs (click with the key) -- */}
      {!candadoAbierto && (
        <group
          position={[40, -80, 650]}
          onPointerDown={(e) => {
            e.stopPropagation()
            useGameStore.getState().abrirCandado()
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          {[
            [0, 0, -52],
            [0, 0, 52],
          ].map(([x, , z]) => (
            <group key={z} position={[x, 0, z]}>
              <mesh position={[0, 4, 0]} castShadow>
                <cylinderGeometry args={[10, 12, 8, 10]} />
                <meshStandardMaterial color="#c9a227" flatShading />
              </mesh>
              <mesh position={[0, 55, 0]} castShadow>
                <cylinderGeometry args={[2.5, 2.5, 100, 8]} />
                <meshStandardMaterial color="#c9a227" flatShading />
              </mesh>
              <mesh position={[0, 106, 0]}>
                <sphereGeometry args={[5, 10, 10]} />
                <meshStandardMaterial color="#c9a227" flatShading />
              </mesh>
            </group>
          ))}
          {/* red rope (slight sag) + padlock at center */}
          <mesh position={[0, 96, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[2.2, 2.2, 100, 8]} />
            <meshStandardMaterial color="#8c2d2d" flatShading />
          </mesh>
          <mesh position={[0, 82, 0]} castShadow>
            <boxGeometry args={[16, 18, 8]} />
            <meshStandardMaterial color="#b8952d" flatShading />
          </mesh>
          <mesh position={[0, 94, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[7, 2, 8, 12, Math.PI]} />
            <meshStandardMaterial color="#8a8f96" flatShading />
          </mesh>
        </group>
      )}

      {/* -- Chest at the FAR END of the upstairs walkway (NW corner of
             the west strip — the longest walk from the stair landing):
             lid swings open, the card inside is clickable until taken -- */}
      <group position={[-597, 267, 0]}>
        <mesh
          position={[0, 20, 0]}
          castShadow
          onPointerDown={(e) => {
            e.stopPropagation()
            useGameStore.getState().abrirCofre()
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <boxGeometry args={[76, 40, 54]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        <group ref={tapaCofreRef} position={[0, 40, -27]}>
          <mesh position={[0, 8, 27]} castShadow>
            <boxGeometry args={[76, 16, 54]} />
            <meshStandardMaterial color={MADERA_CLARA} flatShading />
          </mesh>
        </group>
        <mesh position={[0, 22, 28]}>
          <boxGeometry args={[12, 14, 4]} />
          <meshStandardMaterial color="#c9a227" flatShading />
        </mesh>
        {cofreAbierto && !tieneTarjeta && (
          <mesh
            position={[0, 42, 0]}
            rotation={[-Math.PI / 2.4, 0, 0.2]}
            onPointerDown={(e) => {
              e.stopPropagation()
              useGameStore.getState().tomarTarjeta()
            }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
          >
            <boxGeometry args={[34, 22, 2]} />
            <meshStandardMaterial color="#e8e2d0" flatShading />
          </mesh>
        )}
      </group>

      {/* -- Card sensor beside the door (west wall): red LED -> green -- */}
      <group
        position={[-694, 100, 430]}
        onPointerDown={(e) => {
          e.stopPropagation()
          useGameStore.getState().usarSensor()
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh>
          <boxGeometry args={[8, 34, 22]} />
          <meshStandardMaterial color="#4a4f57" flatShading />
        </mesh>
        <mesh position={[5, 6, 0]}>
          <sphereGeometry args={[3.2, 10, 10]} />
          <meshBasicMaterial color={puertaDesbloqueada ? '#4ade80' : '#e04545'} />
        </mesh>
        <mesh position={[5, -6, 0]}>
          <boxGeometry args={[1.5, 12, 14]} />
          <meshStandardMaterial color="#23262c" flatShading />
        </mesh>
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

      {/* -- Upper floor: U-shaped mezzanine slab at the old ceiling line
             (y 260), leaving the center open so the desk stays visible
             from the map camera. Wood slab + inner-edge railings. -- */}
      <group>
        {/* west strip (inset 6u so the slab edge never pokes outside) */}
        <mesh position={[-597, 260, 307.5]} castShadow>
          <boxGeometry args={[194, 14, 787]} />
          <meshStandardMaterial color={MADERA_CLARA} flatShading />
        </mesh>
        {/* east strip */}
        <mesh position={[597, 260, 307.5]} castShadow>
          <boxGeometry args={[194, 14, 787]} />
          <meshStandardMaterial color={MADERA_CLARA} flatShading />
        </mesh>
        {/* south strip, in 2 pieces around the STAIR OPENING (x 220..500,
            z 592..701): the hole you rise through when climbing up */}
        <mesh position={[-140, 260, 604]} castShadow>
          <boxGeometry args={[720, 14, 194]} />
          <meshStandardMaterial color={MADERA_CLARA} flatShading />
        </mesh>
        <mesh position={[360, 260, 549.5]} castShadow>
          <boxGeometry args={[280, 14, 85]} />
          <meshStandardMaterial color={MADERA_CLARA} flatShading />
        </mesh>
        {/* railings: CONTINUOUS around the central void (west edge, full
            south edge, east edge) plus one guarding the west side of the
            stair opening. The opening's NORTH side stays open — it's the
            walkway from the stair landing to the south corridor. */}
        <mesh position={[-495, 302, 210.5]}>
          <boxGeometry args={[10, 70, 593]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        <mesh position={[495, 302, 210.5]}>
          <boxGeometry args={[10, 70, 593]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        <mesh position={[0, 302, 510]}>
          <boxGeometry args={[1000, 70, 10]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        <mesh position={[215, 302, 649.5]}>
          <boxGeometry args={[10, 70, 115]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        {/* north side of the stair opening: railed EXCEPT over the top
            landing (x 434..500), where the last step meets the walkway */}
        <mesh position={[327, 302, 594]}>
          <boxGeometry args={[214, 70, 10]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        {/* landing deck: bridges the last step and the east slab */}
        <mesh position={[484, 260, 646.5]} castShadow>
          <boxGeometry args={[32, 14, 109]} />
          <meshStandardMaterial color={MADERA_CLARA} flatShading />
        </mesh>
      </group>

      {/* -- Temple-style top for the WEST (front) facade: entablature,
             denticulated cornice and triangular pediment, like a Roman
             courthouse. Sits above the wall top (y 372). -- */}
      <group>
        {/* entablature beam */}
        <mesh position={[-710, 387, 310]} castShadow>
          <boxGeometry args={[44, 30, 830]} />
          <meshStandardMaterial color={MARMOL} flatShading />
        </mesh>
        {/* denticles: little teeth under the cornice */}
        {Array.from({ length: 17 }, (_, i) => -50 + i * 45).map((z) => (
          <mesh key={z} position={[-726, 396, z + 30]}>
            <boxGeometry args={[12, 12, 16]} />
            <meshStandardMaterial color="#ddd5c2" flatShading />
          </mesh>
        ))}
        {/* cornice */}
        <mesh position={[-710, 408, 310]} castShadow>
          <boxGeometry args={[56, 12, 856]} />
          <meshStandardMaterial color={MARMOL} flatShading />
        </mesh>
        {/* triangular pediment, extruded outward from the wall */}
        <mesh position={[-700, 414, 310]} rotation={[0, -Math.PI / 2, 0]} castShadow>
          <extrudeGeometry args={[formaFronton, { depth: 40, bevelEnabled: false }]} />
          <meshStandardMaterial color={MARMOL} flatShading />
        </mesh>
        {/* tympanum medallion */}
        <mesh position={[-742, 464, 310]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[34, 34, 6, 16]} />
          <meshStandardMaterial color="#d8d0bc" flatShading />
        </mesh>

        {/* small matching pediment right above the door frame */}
        <mesh position={[-708, 222, 310]} castShadow>
          <boxGeometry args={[42, 18, 256]} />
          <meshStandardMaterial color={MARMOL} flatShading />
        </mesh>
        <mesh position={[-700, 231, 310]} rotation={[0, -Math.PI / 2, 0]} castShadow>
          <extrudeGeometry args={[formaFrontonPuerta, { depth: 38, bevelEnabled: false }]} />
          <meshStandardMaterial color={MARMOL} flatShading />
        </mesh>
      </group>

      {/* -- Solid marble stairs to the mezzanine, along the south wall's
             right (east) stretch: 12 steps from floor to slab (y 267).
             ControlesPOV.alturaSuelo mirrors these numbers to walk them. -- */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          position={[60 + 17 + i * 34, -80 + ((i + 1) * 28.9) / 2, 650]}
          castShadow
        >
          <boxGeometry args={[34, (i + 1) * 28.9, 110]} />
          <meshStandardMaterial color={MARMOL} flatShading />
        </mesh>
      ))}

      {/* -- Roman columns hugging the four corners of the house -- */}
      {[
        [-694, -80],
        [694, -80],
        [-694, 701],
        [694, 701],
      ].map(([x, z]) => (
        <group key={`${x},${z}`} position={[x, -80, z]}>
          <ColumnaRomana />
        </group>
      ))}

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
