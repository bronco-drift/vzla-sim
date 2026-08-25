// Maqueta B: "Tablero" — straight-down orthographic view, board-game
// feel. Same engine, same world components, different camera language.
import { Canvas } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { Mundo } from '../a/Mundo.jsx'
import { Sol } from '../a/Sol.jsx'
import { ResetVista } from '../ResetVista.jsx'
import { useGameStore } from '../../store/gameStore.js'

export function MaquetaB() {
  const seleccionarLugar = useGameStore((s) => s.seleccionarLugar)
  const mundoGlobal = useGameStore((s) => s.mundoGlobal)

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 60, 0], zoom: 13, up: [0, 0, -1], near: 1, far: 200 }}
      shadows="soft"
      onPointerMissed={() => seleccionarLugar(null)}
    >
      <color attach="background" args={['#0d141d']} />
      <fog attach="fog" args={mundoGlobal ? ['#0d141d', 400, 2000] : ['#0d141d', 90, 220]} />
      <Sol />
      <Mundo etiquetasFijas />
      <ResetVista posicion={[0, 60, 0]} target={[0, 0, 0]} zoom={13} />
      {/* Pan and zoom only: the board never tilts */}
      <MapControls makeDefault enableRotate={false} minZoom={mundoGlobal ? 0.5 : 7} maxZoom={60} />
    </Canvas>
  )
}
