// Desk-diorama fantasy: the map sits on a wooden desk, and a giant desk
// lamp turns itself on when the sun goes down. The spotlight lives INSIDE
// the lamp head, so light always comes from the bulb wherever the lamp
// is moved (position comes from the scene editor, persisted).
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'
import { cicloDia } from './Sol.jsx'
import { Ventana } from './Ventana.jsx'
import { DecoEscritorio } from './DecoEscritorio.jsx'
import { Cuarto } from './Cuarto.jsx'
import { Humano } from './Humano.jsx'
import { Mujer } from './Mujer.jsx'
import { Radio } from './Radio.jsx'
import { Exterior } from './Exterior.jsx'
import { Luces, ColocadorLuces } from './Luces.jsx'

export function Escritorio() {
  const luzRef = useRef()
  const bombilloRef = useRef()
  const lucesCuartoRef = useRef([])
  const bombillosCuartoRef = useRef([])
  const lampara = useGameStore((s) => s.escena.lampara)
  // Plane walls are inward-facing (dollhouse) for the map/fly cameras,
  // but walking OUTSIDE in first person the house must look solid.
  const camaraPov = useGameStore((s) => s.camaraPov)
  const ladoPared = camaraPov ? THREE.DoubleSide : THREE.FrontSide

  // Checkerboard floor: procedural CanvasTexture, no image files
  const pisoAjedrez = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#d6d2c6' // off-white
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = '#1c1a18' // near-black
    ctx.fillRect(0, 0, 64, 64)
    ctx.fillRect(64, 64, 64, 64)
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(35, 20) // ~20 world units per tile (floor is 1404x800)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  // Lamp switches on when the sun is low/below the horizon, with a
  // smooth ramp so it feels like a warm click-on.
  useFrame((state, delta) => {
    const { game, escena } = useGameStore.getState()
    if (!game || !luzRef.current) return
    const frac = cicloDia(escena, state.clock.elapsedTime)
    const solAltura = Math.sin(frac * Math.PI * 2)
    const intensidad = escena.lampara.intensidad ?? 220
    const modo = escena.lampara.modo ?? 'auto'
    // auto: on at night · on: always · off: never
    const objetivo =
      modo === 'on' ? intensidad : modo === 'off' ? 0 : solAltura < 0.12 ? intensidad : 0
    luzRef.current.intensity += (objetivo - luzRef.current.intensity) * Math.min(1, delta * 3)
    const prendida = luzRef.current.intensity > objetivo * 0.15 && objetivo > 0
    bombilloRef.current.material.color.set(prendida ? '#ffe9a8' : '#3a3f4a')

    // Room lighting: three ridge pendants share the panel's intensity
    const cuarto = escena.luzCuarto ?? {}
    const objetivoCuarto = (cuarto.encendida ? (cuarto.intensidad ?? 1500) : 0) / 3
    for (let i = 0; i < 3; i++) {
      const luz = lucesCuartoRef.current[i]
      const bombillo = bombillosCuartoRef.current[i]
      if (!luz) continue
      luz.intensity += (objetivoCuarto - luz.intensity) * Math.min(1, delta * 3)
      if (bombillo) bombillo.material.color.set(luz.intensity > 15 ? '#fff3c8' : '#3a3f4a')
    }
  })

  return (
    <group>
      {/* Executive desk (proportions from Marcel's reference photo):
          thick top with overhang + molding, body with dark panels, plinth */}
      {/* top — the map tray sits on this surface. Elongated executive
          proportions (~2.2:1): wide, NOT deep, so it reads as a desk */}
      <mesh position={[0, -3.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[330, 6, 150]} />
        <meshStandardMaterial color="#6e4526" flatShading />
      </mesh>
      {/* molding strip under the top */}
      <mesh position={[0, -6.9, 0]} castShadow>
        <boxGeometry args={[338, 2.2, 158]} />
        <meshStandardMaterial color="#59371e" flatShading />
      </mesh>
      {/* body (narrower: the top overhangs like the photo) */}
      <mesh position={[0, -24, 0]} castShadow>
        <boxGeometry args={[292, 34, 112]} />
        <meshStandardMaterial color="#653e22" flatShading />
      </mesh>
      {/* dark front panels */}
      {[-96, 0, 96].map((x) => (
        <mesh key={x} position={[x, -23, 57]}>
          <boxGeometry args={[64, 22, 1.6]} />
          <meshStandardMaterial color="#241a12" flatShading />
        </mesh>
      ))}
      {/* plinth */}
      <mesh position={[0, -43.5, 0]} castShadow>
        <boxGeometry args={[302, 5, 122]} />
        <meshStandardMaterial color="#4a2e19" flatShading />
      </mesh>
      {/* legs: from the plinth down to the floor */}
      {[
        [-138, -50],
        [138, -50],
        [-138, 50],
        [138, 50],
      ].map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, -63, z]} castShadow>
          <boxGeometry args={[12, 34, 12]} />
          <meshStandardMaterial color="#3f2715" flatShading />
        </mesh>
      ))}
      {/* checkerboard office floor, sized to the room (walls at ±700/-86..707) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -80, 310]} receiveShadow>
        <planeGeometry args={[1404, 800]} />
        <meshStandardMaterial map={pisoAjedrez} />
      </mesh>
      {/* room lighting: THREE pendant lamps hanging from the roof's
          ridge beam (y 584, z 310), evenly spaced along it. Each carries
          a third of the panel's intensity; bulbs glow when on. */}
      {[-450, 0, 450].map((x, i) => (
        <group key={x} position={[x, 0, 310]}>
          <mesh position={[0, 462, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 244, 6]} />
            <meshStandardMaterial color="#2c2620" flatShading />
          </mesh>
          <mesh position={[0, 344, 0]}>
            <cylinderGeometry args={[4, 9, 12, 10, 1, true]} />
            <meshStandardMaterial color="#3a332c" flatShading side={2} />
          </mesh>
          <mesh ref={(el) => (bombillosCuartoRef.current[i] = el)} position={[0, 333, 0]}>
            <sphereGeometry args={[6, 12, 12]} />
            <meshBasicMaterial color="#3a3f4a" />
          </mesh>
          <pointLight
            ref={(el) => (lucesCuartoRef.current[i] = el)}
            position={[0, 328, 0]}
            intensity={0}
            distance={900}
            decay={1.1}
            color="#f2ede2"
          />
        </group>
      ))}
      {/* white office wall with THREE real window holes (x -350, 0, +350;
          all y 10..160): a full strip above, a strip below, and columns
          between the holes — every window shows the actual sky behind */}
      {/* top strip rises to y 422 to meet the glass roof (no gap) */}
      <mesh position={[0, 291, -86]} receiveShadow>
        <boxGeometry args={[1400, 262, 8]} />
        <meshStandardMaterial color="#e6e0d2" />
      </mesh>
      <mesh position={[0, -35, -86]} receiveShadow>
        <boxGeometry args={[1400, 90, 8]} />
        <meshStandardMaterial color="#e6e0d2" />
      </mesh>
      <mesh position={[-552.5, 85, -86]} receiveShadow>
        <boxGeometry args={[295, 150, 8]} />
        <meshStandardMaterial color="#e6e0d2" />
      </mesh>
      <mesh position={[-175, 85, -86]} receiveShadow>
        <boxGeometry args={[240, 150, 8]} />
        <meshStandardMaterial color="#e6e0d2" />
      </mesh>
      <mesh position={[175, 85, -86]} receiveShadow>
        <boxGeometry args={[240, 150, 8]} />
        <meshStandardMaterial color="#e6e0d2" />
      </mesh>
      <mesh position={[552.5, 85, -86]} receiveShadow>
        <boxGeometry args={[295, 150, 8]} />
        <meshStandardMaterial color="#e6e0d2" />
      </mesh>

      {/* Side + front walls: single-sided planes facing INWARD, so the
          orbiting camera never gets blocked (dollhouse effect: invisible
          from outside thanks to backface culling). */}
      <group>
        {/* left (west) wall, in 3 pieces around the REAL door opening
            (z 224..396, y -80..205) so the open door leads outside */}
        <mesh position={[-700, 146, 69]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[310, 452]} />
          <meshStandardMaterial color="#e2dccc" side={ladoPared} />
        </mesh>
        <mesh position={[-700, 146, 551.5]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[311, 452]} />
          <meshStandardMaterial color="#e2dccc" side={ladoPared} />
        </mesh>
        <mesh position={[-700, 288.5, 310]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[172, 167]} />
          <meshStandardMaterial color="#e2dccc" side={ladoPared} />
        </mesh>
        <mesh position={[-699.5, -74, 69]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[310, 12]} />
          <meshStandardMaterial color="#3a332c" side={ladoPared} />
        </mesh>
        <mesh position={[-699.5, -74, 551.5]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[311, 12]} />
          <meshStandardMaterial color="#3a332c" side={ladoPared} />
        </mesh>
        {/* right (east) wall, in 4 pieces around its real window hole
            (z 255..365, y 10..160) */}
        <mesh position={[700, 146, 84.5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[341, 452]} />
          <meshStandardMaterial color="#e2dccc" side={ladoPared} />
        </mesh>
        <mesh position={[700, 146, 536]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[342, 452]} />
          <meshStandardMaterial color="#e2dccc" side={ladoPared} />
        </mesh>
        <mesh position={[700, 266, 310]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[110, 212]} />
          <meshStandardMaterial color="#e2dccc" side={ladoPared} />
        </mesh>
        <mesh position={[700, -35, 310]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[110, 90]} />
          <meshStandardMaterial color="#e2dccc" side={ladoPared} />
        </mesh>
        <mesh position={[699.5, -74, 307]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[800, 12]} />
          <meshStandardMaterial color="#3a332c" side={ladoPared} />
        </mesh>
        {/* front wall (behind the player's usual view) — reaches the
            glass roof at y 421 so there's no gap */}
        <mesh position={[0, 170.5, 707]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1400, 501]} />
          <meshStandardMaterial color="#e2dccc" side={ladoPared} />
        </mesh>
        <mesh position={[0, -74, 706.5]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1400, 12]} />
          <meshStandardMaterial color="#3a332c" side={ladoPared} />
        </mesh>
      </group>
      <mesh position={[0, -74, -81]}>
        <boxGeometry args={[1400, 12, 4]} />
        <meshStandardMaterial color="#2c1f15" />
      </mesh>

      {/* Window with the Ávila view (its own component) */}
      <Ventana />

      {/* Portrait, brochure and pen cup */}
      <DecoEscritorio />

      {/* Rest of the office: door, windows, furniture */}
      <Cuarto />

      {/* Scale-reference humans: vinotinto + the blue POV avatar
          (defaults = Marcel's placement, from ESCENA_DEFAULT) */}
      <Humano defaultPos={{ x: -603, z: -75 }} />
      <Humano clave="humano2" camisa="#2b4faa" defaultPos={{ x: -200, z: 155 }} />

      {/* The Cartographer NPC outside, near the west door */}
      <Mujer />

      {/* Retro radio on its table (SW corner, right of the door) */}
      <Radio />

      {/* Grass, horizon gradient, trees and cardinal boulders */}
      <Exterior />

      {/* Player-placed light sources + click-to-place handler */}
      <Luces />
      <ColocadorLuces />

      {/* In POV mode, clicking the map tray "sits you down to govern":
          an invisible pad over the desk swaps back to the map camera.
          Only mounted in POV so normal map clicks stay untouched. */}
      {camaraPov && (
        <mesh
          visible={false}
          position={[0, 1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerDown={(e) => {
            e.stopPropagation()
            useGameStore.getState().toggleCamaraPov()
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <planeGeometry args={[340, 160]} />
        </mesh>
      )}

      {/* Giant desk lamp, position/size editable from the scene panel */}
      <group
        position={[lampara.x, 0, lampara.z]}
        rotation={[0, lampara.rot, 0]}
        scale={lampara.escala ?? 1}
      >
        {/* base */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[7, 9, 3, 10]} />
          <meshStandardMaterial color="#2e333d" flatShading />
        </mesh>
        {/* arm */}
        <mesh position={[-6, 16, 0]} rotation={[0, 0, 0.42]} castShadow>
          <boxGeometry args={[2.2, 30, 2.2]} />
          <meshStandardMaterial color="#3a404c" flatShading />
        </mesh>
        {/* head (open mouth facing the map) */}
        <mesh position={[-14, 29, 0]} rotation={[0, 0, 2.2 - Math.PI]} castShadow>
          <coneGeometry args={[6, 9, 10, 1, true]} />
          <meshStandardMaterial color="#2e333d" flatShading side={2} />
        </mesh>
        {/* bulb: glows when on */}
        <mesh ref={bombilloRef} position={[-15.5, 27.5, 0]}>
          <sphereGeometry args={[2.4, 10, 10]} />
          <meshBasicMaterial color="#3a3f4a" />
        </mesh>
        {/* Warm light FROM the bulb, aimed at the map center (world origin) */}
        <spotLight
          ref={luzRef}
          position={[-15.5, 27.5, 0]}
          angle={0.85}
          penumbra={0.6}
          distance={220}
          decay={1.2}
          intensity={0}
          color="#ffd9a0"
        />
      </group>
    </group>
  )
}
