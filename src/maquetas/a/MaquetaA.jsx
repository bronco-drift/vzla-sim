// Maqueta A: low-poly diorama with a free map camera.
// Real Venezuela terrain from GeoJSON, clickable places, and a sun that
// orbits once per simulated year (time speed made visible).
import { Canvas } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { Mundo } from './Mundo.jsx'
import { Sol } from './Sol.jsx'
import { ResetVista } from '../ResetVista.jsx'
import { ControlesLibres } from '../ControlesLibres.jsx'
import { ControlesPOV } from '../ControlesPOV.jsx'
import { VueloCamara } from '../VueloCamara.jsx'
import { useGameStore } from '../../store/gameStore.js'

export function MaquetaA() {
  const seleccionarLugar = useGameStore((s) => s.seleccionarLugar)
  const mundoGlobal = useGameStore((s) => s.mundoGlobal)
  const camaraLibre = useGameStore((s) => s.camaraLibre)
  const camaraPov = useGameStore((s) => s.camaraPov)
  const transicion = useGameStore((s) => s.transicion)

  // shadows="soft" = PCFSoftShadowMap: smooth shadow edges
  return (
    <Canvas
      // near: 1 (not the 0.1 default) keeps the depth buffer precise at
      // world-view distances — kills z-fighting shimmer far away
      camera={{ position: [0, 34, 26], fov: 45, near: 1, far: 20000 }}
      shadows="soft"
      onPointerMissed={() => seleccionarLugar(null)}
    >
      <color attach="background" args={['#101722']} />
      {/* World view needs a much deeper fog so the planet doesn't vanish.
          Desk mode: fog far enough that the room reads from 100m up. */}
      <fog attach="fog" args={mundoGlobal ? ['#101722', 300, 1400] : ['#101722', 600, 12000]} />

      <Sol />
      <Mundo />
      <ResetVista posicion={[0, 34, 26]} target={[0, 0, -4]} />

      {/* Map camera by default; fly or first-person walk when toggled.
          Mode switches ride a short cinematic flight first. */}
      {transicion ? (
        <VueloCamara />
      ) : camaraPov ? (
        <ControlesPOV />
      ) : camaraLibre ? (
        <ControlesLibres />
      ) : (
        <MapControls
          makeDefault
          target={[0, 0, -4]}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.4}
          minDistance={8}
          maxDistance={mundoGlobal ? 500 : 320}
        />
      )}
    </Canvas>
  )
}
