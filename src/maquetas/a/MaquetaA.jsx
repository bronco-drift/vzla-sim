// Maqueta A: low-poly diorama with a free map camera.
// Real Venezuela terrain from GeoJSON, clickable places, and a sun that
// orbits once per simulated year (time speed made visible).
import { Canvas } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { Mundo } from './Mundo.jsx'
import { Sol } from './Sol.jsx'
import { useGameStore } from '../../store/gameStore.js'

export function MaquetaA() {
  const seleccionarLugar = useGameStore((s) => s.seleccionarLugar)
  const mundoGlobal = useGameStore((s) => s.mundoGlobal)

  // shadows="soft" = PCFSoftShadowMap: smooth shadow edges
  return (
    <Canvas
      camera={{ position: [0, 34, 26], fov: 45 }}
      shadows="soft"
      onPointerMissed={() => seleccionarLugar(null)}
    >
      <color attach="background" args={['#101722']} />
      {/* World view needs a much deeper fog so the planet doesn't vanish */}
      <fog attach="fog" args={mundoGlobal ? ['#101722', 300, 1400] : ['#101722', 100, 330]} />

      <Sol />
      <Mundo />

      {/* Free camera: drag/arrows to pan, wheel/pinch to zoom, angle capped */}
      <MapControls
        makeDefault
        target={[0, 0, -4]}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.4}
        minDistance={8}
        maxDistance={mundoGlobal ? 500 : 115}
      />
    </Canvas>
  )
}
