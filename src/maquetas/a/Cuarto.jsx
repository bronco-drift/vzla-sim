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

/** Roman column, true temple order: plinth, fluted shaft, capital
    topping out at y≈413 — right where the pediment's triangle begins
    (the entablature/cornice band, 372..414), like real Roman fronts. */
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
      <mesh position={[0, 203, 0]} castShadow>
        <cylinderGeometry args={[21, 25, 342, 10]} />
        <meshStandardMaterial color={MARMOL} flatShading />
      </mesh>
      <mesh position={[0, 381, 0]}>
        <boxGeometry args={[54, 14, 54]} />
        <meshStandardMaterial color={MARMOL} flatShading />
      </mesh>
      <mesh position={[0, 395, 0]}>
        <boxGeometry args={[70, 14, 70]} />
        <meshStandardMaterial color={MARMOL} flatShading />
      </mesh>
      <mesh position={[0, 408, 0]}>
        <boxGeometry args={[76, 9, 76]} />
        <meshStandardMaterial color={MARMOL} flatShading />
      </mesh>
    </group>
  )
}

export function Cuarto() {
  // Book population for the hollow library: deterministic mix of standing
  // books (varied heights/widths/tilts, some with a label band), lying
  // stacks, and gaps. The golden quest book keeps a reserved slot.
  const librosEstantes = useMemo(() => {
    let semilla = 31
    const azar = () => {
      semilla = (semilla * 16807) % 2147483647
      return semilla / 2147483647
    }
    const estantes = []
    const filasY = [10, 72, 134, 196, 258, 320]
    filasY.forEach((yBase, fila) => {
      const items = []
      let x = -104
      while (x < 100) {
        // reserved gap for the golden book on row 2
        if (fila === 2 && x > -44 && x < -8) {
          x = -6
          continue
        }
        const r = azar()
        if (r < 0.12) {
          x += 10 + azar() * 16 // gap
        } else if (r < 0.3) {
          // lying stack of 2-3 books
          const n = 2 + Math.floor(azar() * 2)
          for (let j = 0; j < n; j++) {
            items.push({
              tipo: 'acostado',
              x: x + 14,
              y: yBase + 4 + j * 7.5,
              ancho: 26 + azar() * 6,
              color: LIBROS[Math.floor(azar() * LIBROS.length)],
            })
          }
          x += 34
        } else {
          const ancho = 6 + azar() * 6
          items.push({
            tipo: 'parado',
            x: x + ancho / 2,
            y: yBase,
            ancho,
            alto: 28 + azar() * 14,
            tilt: azar() < 0.18 ? (azar() - 0.5) * 0.3 : 0,
            etiqueta: azar() < 0.28,
            color: LIBROS[Math.floor(azar() * LIBROS.length)],
          })
          x += ancho + 1.5
        }
      }
      estantes.push({ yBase, items })
    })
    return estantes
  }, [])

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
  const finJuego = useGameStore((s) => s.quest.finJuego)
  const hojaIzqRef = useRef()
  const hojaDerRef = useRef()
  const tapaCofreRef = useRef()
  const tapaCofrecitoRef = useRef()

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
    if (tapaCofrecitoRef.current) {
      const abierto = useGameStore.getState().quest.finJuego ? -1.9 : 0
      tapaCofrecitoRef.current.rotation.x +=
        (abierto - tapaCofrecitoRef.current.rotation.x) * k
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

      {/* -- LIBRARY against the back wall: a HOLLOW case (back panel,
             sides, top/bottom, real shelves) filled with shaped books —
             standing spines, tilted ones, lying stacks and gaps. The
             golden "Cesarismo democrático" starts the quest. -- */}
      <group position={[535, -80, -70]}>
        {/* back panel against the wall */}
        <mesh position={[0, 190, -12]}>
          <boxGeometry args={[240, 380, 4]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        {/* sides, top, bottom plinth */}
        <mesh position={[-117, 190, 2]} castShadow>
          <boxGeometry args={[6, 380, 32]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        <mesh position={[117, 190, 2]} castShadow>
          <boxGeometry args={[6, 380, 32]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        <mesh position={[0, 377, 2]} castShadow>
          <boxGeometry args={[240, 8, 34]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        <mesh position={[0, 5, 2]}>
          <boxGeometry args={[240, 12, 34]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        {/* shelves + their book population */}
        {librosEstantes.map(({ yBase, items }) => (
          <group key={yBase}>
            <mesh position={[0, yBase - 2, 1]}>
              <boxGeometry args={[228, 4, 28]} />
              <meshStandardMaterial color={MADERA_CLARA} flatShading />
            </mesh>
            {items.map((l, i) =>
              l.tipo === 'acostado' ? (
                <mesh key={i} position={[l.x, l.y, 0]} rotation={[0, 0.06, 0]}>
                  <boxGeometry args={[l.ancho, 7, 19]} />
                  <meshStandardMaterial color={l.color} flatShading />
                </mesh>
              ) : (
                <group
                  key={i}
                  position={[l.x, l.y + l.alto / 2, 0]}
                  rotation={[0, 0, l.tilt]}
                >
                  <mesh>
                    <boxGeometry args={[l.ancho, l.alto, 19]} />
                    <meshStandardMaterial color={l.color} flatShading />
                  </mesh>
                  {l.etiqueta && (
                    <mesh position={[0, l.alto * 0.22, 9.6]}>
                      <boxGeometry args={[l.ancho * 0.7, 4, 0.6]} />
                      <meshStandardMaterial color="#e8e2d0" />
                    </mesh>
                  )}
                </group>
              ),
            )}
          </group>
        ))}
        {/* the golden quest book in its reserved slot (row 2) + hitbox */}
        <mesh position={[-26, 153, 1]} castShadow>
          <boxGeometry args={[11, 38, 21]} />
          <meshStandardMaterial color="#c9a227" flatShading />
        </mesh>
        <mesh position={[-26, 141, 11]}>
          <boxGeometry args={[9, 3, 1]} />
          <meshStandardMaterial color="#f5c518" />
        </mesh>
        <mesh
          visible={false}
          position={[-26, 153, 8]}
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

      {/* -- Chest at the FAR (north) END of the east walkway: lid swings
             open, the card inside is clickable until taken -- */}
      <group position={[597, 267, -30]}>
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
          <group
            position={[0, 42, 0]}
            rotation={[-Math.PI / 2.4, 0, 0.2]}
            onPointerDown={(e) => {
              e.stopPropagation()
              useGameStore.getState().tomarTarjeta()
            }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
          >
            <mesh>
              <boxGeometry args={[34, 22, 2]} />
              <meshStandardMaterial color="#e8e2d0" flatShading />
            </mesh>
            {/* magnetic stripe */}
            <mesh position={[0, 6, 1.2]}>
              <boxGeometry args={[34, 5, 0.4]} />
              <meshStandardMaterial color="#1d1a14" />
            </mesh>
          </group>
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

      {/* -- Upper floor: ONE east balcony (Marcel's layout) — the stairs
             climb the south wall and land on a single walkway running
             north along the east wall to the chest at its far end. -- */}
      <group>
        {/* east walkway */}
        <mesh position={[597, 260, 307.5]} castShadow>
          <boxGeometry args={[194, 14, 787]} />
          <meshStandardMaterial color={MADERA_CLARA} flatShading />
        </mesh>
        {/* landing deck: bridges the last step and the walkway */}
        <mesh position={[484, 260, 646.5]} castShadow>
          <boxGeometry args={[32, 14, 109]} />
          <meshStandardMaterial color={MADERA_CLARA} flatShading />
        </mesh>
        {/* railing along the walkway's full open (west) edge */}
        <mesh position={[495, 302, 253]}>
          <boxGeometry args={[10, 70, 678]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        {/* railing on the landing deck's north edge */}
        <mesh position={[484, 302, 594]}>
          <boxGeometry args={[32, 70, 10]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        {/* stair handrail: slanted beam along the open north side */}
        <mesh position={[264, 120, 592]} rotation={[0, 0, 0.705]}>
          <boxGeometry args={[540, 9, 9]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
      </group>

      {/* -- Temple-style tops on BOTH gable ends (west front + east
             back): entablature, denticulated cornice, triangular
             pediment. The glass roof spans between their peaks. -- */}
      {[-1, 1].map((lado) => (
        <group key={lado}>
          <mesh position={[710 * lado, 387, 310]} castShadow>
            <boxGeometry args={[44, 30, 830]} />
            <meshStandardMaterial color={MARMOL} flatShading />
          </mesh>
          {Array.from({ length: 17 }, (_, i) => -50 + i * 45).map((z) => (
            <mesh key={z} position={[726 * lado, 396, z + 30]}>
              <boxGeometry args={[12, 12, 16]} />
              <meshStandardMaterial color="#ddd5c2" flatShading />
            </mesh>
          ))}
          <mesh position={[710 * lado, 408, 310]} castShadow>
            <boxGeometry args={[56, 12, 856]} />
            <meshStandardMaterial color={MARMOL} flatShading />
          </mesh>
          <mesh
            position={[700 * lado, 414, 310]}
            rotation={[0, (-Math.PI / 2) * lado, 0]}
            castShadow
          >
            <extrudeGeometry args={[formaFronton, { depth: 40, bevelEnabled: false }]} />
            <meshStandardMaterial color={MARMOL} flatShading />
          </mesh>
          <mesh position={[742 * lado, 464, 310]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[34, 34, 6, 16]} />
            <meshStandardMaterial color="#d8d0bc" flatShading />
          </mesh>
        </group>
      ))}

      {/* small matching pediment right above the door frame (west only) */}
      <mesh position={[-708, 222, 310]} castShadow>
        <boxGeometry args={[42, 18, 256]} />
        <meshStandardMaterial color={MARMOL} flatShading />
      </mesh>
      <mesh position={[-700, 231, 310]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <extrudeGeometry args={[formaFrontonPuerta, { depth: 38, bevelEnabled: false }]} />
        <meshStandardMaterial color={MARMOL} flatShading />
      </mesh>

      {/* -- GLASS gable roof: two panes following the pediments' inverted
             V (ridge y 584 at z 310, eaves y 414 at z -105/725). The map
             camera keeps seeing the board through it, and meshes without
             handlers never steal clicks. -- */}
      <group>
        <mesh position={[0, 499, 102.5]} rotation={[1.182, 0, 0]}>
          <planeGeometry args={[1400, 449]} />
          <meshStandardMaterial
            color="#bfe0f0"
            transparent
            opacity={0.16}
            roughness={0.15}
            metalness={0.1}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 499, 517.5]} rotation={[-1.182, 0, 0]}>
          <planeGeometry args={[1400, 449]} />
          <meshStandardMaterial
            color="#bfe0f0"
            transparent
            opacity={0.16}
            roughness={0.15}
            metalness={0.1}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        {/* ridge beam + eave trims */}
        <mesh position={[0, 584, 310]} castShadow>
          <boxGeometry args={[1400, 12, 16]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        <mesh position={[0, 414, -105]}>
          <boxGeometry args={[1400, 8, 10]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        <mesh position={[0, 414, 725]}>
          <boxGeometry args={[1400, 8, 10]} />
          <meshStandardMaterial color={MADERA} flatShading />
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
        <group key={`${x},${z}`} position={[x, -80, z]} scale={[1, 1.1, 1]}>
          <ColumnaRomana />
        </group>
      ))}

      {/* -- Corner console table (SE, by the stairs) with the FINAL
             coffer on top: a small combination chest holding the
             founders' letter — the quest's ending (code 1777). -- */}
      <group position={[590, -80, 648]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 72, 0]} castShadow>
          <boxGeometry args={[92, 7, 50]} />
          <meshStandardMaterial color={MADERA} flatShading />
        </mesh>
        {[
          [-40, -19],
          [40, -19],
          [-40, 19],
          [40, 19],
        ].map(([lx, lz]) => (
          <mesh key={`${lx},${lz}`} position={[lx, 34, lz]} castShadow>
            <boxGeometry args={[7, 68, 7]} />
            <meshStandardMaterial color={MADERA} flatShading />
          </mesh>
        ))}
        <mesh position={[0, 58, 0]}>
          <boxGeometry args={[84, 22, 44]} />
          <meshStandardMaterial color={MADERA_CLARA} flatShading />
        </mesh>

        {/* the combination coffer (clickable) */}
        <group
          position={[0, 75.5, 0]}
          onPointerDown={(e) => {
            e.stopPropagation()
            useGameStore.getState().abrirCofrecito()
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <mesh position={[0, 9, 0]} castShadow>
            <boxGeometry args={[36, 18, 24]} />
            <meshStandardMaterial color={MADERA} flatShading />
          </mesh>
          <group ref={tapaCofrecitoRef} position={[0, 18, -12]}>
            <mesh position={[0, 3.5, 12]} castShadow>
              <boxGeometry args={[36, 7, 24]} />
              <meshStandardMaterial color={MADERA_CLARA} flatShading />
            </mesh>
          </group>
          {/* combination dials hint on the front */}
          {[-9, -3, 3, 9].map((dx) => (
            <mesh key={dx} position={[dx, 8, 12.4]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2, 2, 1.4, 8]} />
              <meshStandardMaterial color="#c9a227" flatShading />
            </mesh>
          ))}
          {/* the letter inside, revealed when open */}
          {finJuego && (
            <mesh position={[0, 18.5, 0]} rotation={[-Math.PI / 2, 0, 0.1]}>
              <planeGeometry args={[24, 15]} />
              <meshStandardMaterial color="#e8e2d0" side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>
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
