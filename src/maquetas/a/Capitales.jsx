// Quiet dots for the state capitals: no permanent text — the name only
// appears while hovering (or tapping, on touch) a dot.
import { useState } from 'react'
import { Html } from '@react-three/drei'
import { CAPITALES } from '../../data/capitales.js'
import { GROSOR_TERRENO } from './Terreno.jsx'
import { useGameStore } from '../../store/gameStore.js'

export function Capitales({ proyeccion }) {
  const [activa, setActiva] = useState(null)
  const game = useGameStore((s) => s.game)

  // Event-gated capitals (Rupununi) hide until their event fires
  const visibles = CAPITALES.filter(
    (c) => !c.requiereEvento || !game || (game.eventosVistos ?? {})[c.requiereEvento],
  )

  return (
    <group>
      {visibles.map((c) => {
        const { x, z } = proyeccion.aMundo(c.lon, c.lat)
        const hover = activa === c.id
        return (
          <group key={c.id} position={[x, GROSOR_TERRENO, z]}>
            {/* subtle dark ring + small light dot */}
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.31, 0.31, 0.22, 12]} />
              <meshBasicMaterial color="#2c3038" transparent opacity={0.55} />
            </mesh>
            <mesh scale={hover ? 1.6 : 1}>
              <cylinderGeometry args={[0.21, 0.21, 0.3, 12]} />
              <meshBasicMaterial color={hover ? '#ffffff' : '#efe8d2'} />
            </mesh>
            {/* invisible hitbox: the dot is tiny but hovering stays easy */}
            <mesh
              visible={false}
              onPointerOver={(e) => {
                e.stopPropagation()
                setActiva(c.id)
                document.body.style.cursor = 'pointer'
              }}
              onPointerOut={() => {
                setActiva(null)
                document.body.style.cursor = 'auto'
              }}
            >
              <cylinderGeometry args={[1.3, 1.3, 1, 8]} />
            </mesh>
            {hover && (
              <Html
                position={[0, 2, 0]}
                center
                className="etiqueta"
                occlude={false}
                zIndexRange={[4, 0]}
              >
                {c.nombre}
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}
