// Stylized relief: low-poly peaks along the Andes range and flat-top
// tepuis in the Gran Sabana. Decorative geometry at real coordinates —
// gives the map its Venezuelan silhouette without a heightmap.
import { useMemo } from 'react'
import { GROSOR_TERRENO } from './Terreno.jsx'

// [lon, lat, height, radius] — Andes: Táchira -> Mérida -> Trujillo
const ANDES = [
  [-72.4, 7.9, 1.6, 1.0],
  [-71.9, 8.2, 2.2, 1.2],
  [-71.4, 8.5, 3.0, 1.4], // Pico Bolívar area
  [-70.9, 8.9, 2.4, 1.2],
  [-70.4, 9.2, 1.8, 1.0],
  [-70.0, 9.5, 1.3, 0.9],
]

// Cordillera de la Costa (light hills near the Caribbean)
const COSTA = [
  [-67.6, 10.35, 1.0, 0.9],
  [-66.9, 10.35, 1.2, 0.9], // Ávila over Caracas
  [-66.2, 10.3, 0.9, 0.8],
]

// Tepuis: flat-top cylinders (Roraima, Kukenán, Auyantepui, Sarisariñama)
const TEPUYES = [
  [-60.76, 5.14, 1.7, 1.1],
  [-60.83, 5.26, 1.4, 0.9],
  [-62.54, 5.92, 1.9, 1.5], // Auyantepui (Salto Ángel)
  [-64.23, 4.55, 1.3, 1.0],
]

export function Relieve({ proyeccion }) {
  const grupos = useMemo(
    () => [
      { picos: [...ANDES, ...COSTA], tipo: 'cono', color: '#3d6b45' },
      { picos: TEPUYES, tipo: 'tepuy', color: '#356049' },
    ],
    [],
  )

  return (
    <group>
      {grupos.map(({ picos, tipo, color }) =>
        picos.map(([lon, lat, alto, radio], i) => {
          const { x, z } = proyeccion.aMundo(lon, lat)
          return (
            <mesh key={`${tipo}-${i}`} position={[x, GROSOR_TERRENO, z]} castShadow>
              {tipo === 'cono' ? (
                <coneGeometry args={[radio, alto, 6]} />
              ) : (
                <cylinderGeometry args={[radio * 0.85, radio, alto, 7]} />
              )}
              <meshStandardMaterial color={color} flatShading />
            </mesh>
          )
        }),
      )}
    </group>
  )
}
