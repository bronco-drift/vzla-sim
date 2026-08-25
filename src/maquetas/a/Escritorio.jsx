// Desk-diorama fantasy: the map sits on a wooden desk, and a giant desk
// lamp turns itself on when the sun goes down. The spotlight lives INSIDE
// the lamp head, so light always comes from the bulb wherever the lamp
// is moved (position comes from the scene editor, persisted).
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'
import { colorCielo } from './Sol.jsx'

export function Escritorio() {
  const luzRef = useRef()
  const bombilloRef = useRef()
  const luzCuartoRef = useRef()
  const vidrioRef = useRef()
  const lampara = useGameStore((s) => s.escena.lampara)

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
    tex.repeat.set(100, 100) // ~20 world units per tile
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  // Lamp switches on when the sun is low/below the horizon, with a
  // smooth ramp so it feels like a warm click-on.
  useFrame((_, delta) => {
    const { game, escena } = useGameStore.getState()
    if (!game || !luzRef.current) return
    const frac = escena.solFijo ?? (game.dias % 365) / 365
    const solAltura = Math.sin(frac * Math.PI * 2)
    const intensidad = escena.lampara.intensidad ?? 220
    const modo = escena.lampara.modo ?? 'auto'
    // auto: on at night · on: always · off: never
    const objetivo =
      modo === 'on' ? intensidad : modo === 'off' ? 0 : solAltura < 0.12 ? intensidad : 0
    luzRef.current.intensity += (objetivo - luzRef.current.intensity) * Math.min(1, delta * 3)
    const prendida = luzRef.current.intensity > objetivo * 0.15 && objetivo > 0
    bombilloRef.current.material.color.set(prendida ? '#ffe9a8' : '#3a3f4a')

    // Room ceiling light: manual on/off from the scene panel
    const cuarto = escena.luzCuarto ?? {}
    const objetivoCuarto = cuarto.encendida ? (cuarto.intensidad ?? 1500) : 0
    luzCuartoRef.current.intensity +=
      (objetivoCuarto - luzCuartoRef.current.intensity) * Math.min(1, delta * 3)

    // Window glass shows the real sky outside (day/night)
    if (vidrioRef.current) colorCielo(Math.max(0, solAltura), vidrioRef.current.material.color)
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
      {/* checkerboard office floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -80, 0]} receiveShadow>
        <planeGeometry args={[4000, 4000]} />
        <meshStandardMaterial map={pisoAjedrez} />
      </mesh>
      {/* room ceiling light: neutral white from above, no shadows (cheap) */}
      <pointLight
        ref={luzCuartoRef}
        position={[0, 150, 40]}
        intensity={0}
        distance={900}
        decay={1.1}
        color="#f2ede2"
      />
      {/* white office wall right behind the desk, with dark baseboard */}
      <mesh position={[0, 90, -86]} receiveShadow>
        <boxGeometry args={[4000, 340, 8]} />
        <meshStandardMaterial color="#e6e0d2" />
      </mesh>
      <mesh position={[0, -74, -81]}>
        <boxGeometry args={[4000, 12, 4]} />
        <meshStandardMaterial color="#2c1f15" />
      </mesh>

      {/* Window on the wall: white frame + cross, glass shows the sky */}
      <group position={[-42, 60, -81.5]}>
        {/* glass (color driven by the day/night cycle) */}
        <mesh ref={vidrioRef} position={[0, 0, -0.4]}>
          <planeGeometry args={[68, 52]} />
          <meshBasicMaterial color="#1d3a57" />
        </mesh>
        {/* frame */}
        <mesh position={[0, 27.5, 0]}>
          <boxGeometry args={[74, 3.5, 3]} />
          <meshStandardMaterial color="#f0ebe0" flatShading />
        </mesh>
        <mesh position={[0, -27.5, 0]}>
          <boxGeometry args={[74, 3.5, 3]} />
          <meshStandardMaterial color="#f0ebe0" flatShading />
        </mesh>
        <mesh position={[-35.2, 0, 0]}>
          <boxGeometry args={[3.5, 58.5, 3]} />
          <meshStandardMaterial color="#f0ebe0" flatShading />
        </mesh>
        <mesh position={[35.2, 0, 0]}>
          <boxGeometry args={[3.5, 58.5, 3]} />
          <meshStandardMaterial color="#f0ebe0" flatShading />
        </mesh>
        {/* cross bars */}
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[2, 52, 2]} />
          <meshStandardMaterial color="#f0ebe0" flatShading />
        </mesh>
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[68, 2, 2]} />
          <meshStandardMaterial color="#f0ebe0" flatShading />
        </mesh>
        {/* sill */}
        <mesh position={[0, -30.5, 1.5]}>
          <boxGeometry args={[78, 2.5, 6]} />
          <meshStandardMaterial color="#e2dccc" flatShading />
        </mesh>
      </group>

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
