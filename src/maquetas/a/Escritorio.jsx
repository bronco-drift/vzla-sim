// Desk-diorama fantasy: the map sits on a wooden desk, and a giant desk
// lamp turns itself on when the sun goes down. The spotlight lives INSIDE
// the lamp head, so light always comes from the bulb wherever the lamp
// is moved (position comes from the scene editor, persisted).
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../../store/gameStore.js'

export function Escritorio() {
  const luzRef = useRef()
  const bombilloRef = useRef()
  const lampara = useGameStore((s) => s.escena.lampara)

  // Lamp switches on when the sun is low/below the horizon, with a
  // smooth ramp so it feels like a warm click-on.
  useFrame((_, delta) => {
    const { game, escena } = useGameStore.getState()
    if (!game || !luzRef.current) return
    const frac = escena.solFijo ?? (game.dias % 365) / 365
    const solAltura = Math.sin(frac * Math.PI * 2)
    const objetivo = solAltura < 0.12 ? 220 : 0
    luzRef.current.intensity += (objetivo - luzRef.current.intensity) * Math.min(1, delta * 3)
    const prendida = luzRef.current.intensity > 30
    bombilloRef.current.material.color.set(prendida ? '#ffe9a8' : '#3a3f4a')
  })

  return (
    <group>
      {/* Wooden desk under everything */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[4000, 4000]} />
        <meshStandardMaterial color="#5c4028" />
      </mesh>

      {/* Giant desk lamp, position editable from the scene panel */}
      <group position={[lampara.x, 0, lampara.z]} rotation={[0, lampara.rot, 0]}>
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
