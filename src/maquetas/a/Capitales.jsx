// Quiet dots for the state capitals: no permanent text — the name only
// appears while hovering (or tapping, on touch) a dot.
import { useState } from 'react'
import { Html } from '@react-three/drei'
import { CAPITALES } from '../../data/capitales.js'
import { GROSOR_TERRENO } from './Terreno.jsx'

export function Capitales({ proyeccion }) {
  const [activa, setActiva] = useState(null)

  return (
    <group>
      {CAPITALES.map((c) => {
        const { x, z } = proyeccion.aMundo(c.lon, c.lat)
        const hover = activa === c.id
        return (
          <group key={c.id} position={[x, GROSOR_TERRENO, z]}>
            {/* subtle dark ring + small light dot */}
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.62, 0.62, 0.22, 12]} />
              <meshBasicMaterial color="#2c3038" transparent opacity={0.55} />
            </mesh>
            <mesh
              scale={hover ? 1.6 : 1}
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
              <cylinderGeometry args={[0.42, 0.42, 0.3, 12]} />
              <meshBasicMaterial color={hover ? '#ffffff' : '#efe8d2'} />
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
