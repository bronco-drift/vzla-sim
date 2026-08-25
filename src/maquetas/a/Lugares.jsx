// City / site markers on the map: clickable, with floating name labels.
// Completed measures spawn small buildings around their place — the map
// physically shows the country improving. Selection lives in the store.
import { Html } from '@react-three/drei'
import { LUGARES } from '../../data/lugares.js'
import { medidasDeLugar } from '../../data/medidas.js'
import { estadoMedida } from '../../core/medidas.js'
import { ObjetoMesh } from '../../mundo/ObjetoMesh.jsx'
import { useGameStore } from '../../store/gameStore.js'
import { GROSOR_TERRENO } from './Terreno.jsx'

// Deterministic offsets around a place for spawned progress buildings
const OFFSETS = [
  [1.5, 0.4], [-1.5, 0.7], [0.9, -1.4], [-1.0, -1.2], [2.1, -0.6], [-2.2, -0.2],
]
const TIPOS_PROGRESO = ['edificio', 'fabrica', 'casa', 'torre']

// etiquetasFijas: fixed-pixel labels for orthographic cameras, where
// drei's distanceFactor misbehaves (giant text).
export function Lugares({ proyeccion, etiquetasFijas = false }) {
  const seleccionado = useGameStore((s) => s.lugarSeleccionado)
  const seleccionarLugar = useGameStore((s) => s.seleccionarLugar)

  return (
    <group>
      {LUGARES.map((lugar) => {
        const { x, z } = proyeccion.aMundo(lugar.lon, lugar.lat)
        const activo = seleccionado === lugar.id
        const esCiudad = lugar.tipo === 'ciudad'
        return (
          <group key={lugar.id} position={[x, GROSOR_TERRENO, z]}>
            <mesh
              position={[0, 0.45, 0]}
              castShadow
              onClick={(e) => {
                e.stopPropagation()
                seleccionarLugar(activo ? null : lugar.id)
              }}
              onPointerOver={(e) => (document.body.style.cursor = 'pointer')}
              onPointerOut={(e) => (document.body.style.cursor = 'auto')}
            >
              {esCiudad ? (
                <boxGeometry args={[1.1, 0.9, 1.1]} />
              ) : (
                <cylinderGeometry args={[0.55, 0.75, 0.9, 6]} />
              )}
              <meshStandardMaterial
                color={activo ? '#ffd75e' : esCiudad ? '#d8a13a' : '#8a94a6'}
                flatShading
              />
            </mesh>
            <Html
              position={[0, 1.5, 0]}
              center
              {...(etiquetasFijas ? {} : { distanceFactor: 28 })}
              className={activo ? 'etiqueta activa' : 'etiqueta'}
              occlude={false}
            >
              {lugar.nombre}
            </Html>
            <ProgresoLugar lugarId={lugar.id} />
          </group>
        )
      })}
    </group>
  )
}

/** Small buildings that appear as the place's measures reach full effect. */
function ProgresoLugar({ lugarId }) {
  const game = useGameStore((s) => s.game)
  if (!game) return null // editor renders Lugares without a running game

  const plenas = medidasDeLugar(lugarId).filter(
    (m) => estadoMedida(m, game.medidas[m.id], game.dias).fase === 'pleno',
  )

  return plenas.map((m, i) => {
    const [dx, dz] = OFFSETS[i % OFFSETS.length]
    return (
      <ObjetoMesh
        key={m.id}
        objeto={{
          id: m.id,
          tipo: TIPOS_PROGRESO[i % TIPOS_PROGRESO.length],
          x: dx,
          z: dz,
          rotY: (i * Math.PI) / 3,
          escala: 0.7,
        }}
        position={[dx, 0, dz]}
      />
    )
  })
}
