// Low-poly mesh for one placed object. Shared by game and editor.
// Geometry is generated per type — no external assets.
import { TIPOS_OBJETO } from '../data/objetos.js'

export function ObjetoMesh({ objeto, seleccionado = false, ...props }) {
  const def = TIPOS_OBJETO[objeto.tipo] ?? TIPOS_OBJETO.casa
  const color = seleccionado ? '#ffd75e' : def.color

  return (
    <group
      position={[objeto.x, 0.8, objeto.z]}
      rotation={[0, objeto.rotY ?? 0, 0]}
      scale={objeto.escala ?? 1}
      {...props}
    >
      {objeto.tipo === 'casa' && (
        <>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.7, 0.5, 0.7]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
          <mesh position={[0, 0.65, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.55, 0.4, 4]} />
            <meshStandardMaterial color={seleccionado ? '#ffd75e' : '#a04b3b'} flatShading />
          </mesh>
        </>
      )}
      {objeto.tipo === 'edificio' && (
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[0.8, 1.8, 0.8]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      )}
      {objeto.tipo === 'torre' && (
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[0.5, 2.8, 0.5]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      )}
      {objeto.tipo === 'fabrica' && (
        <>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[1.4, 0.7, 0.9]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
          <mesh position={[0.45, 1.0, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 0.9, 6]} />
            <meshStandardMaterial color={seleccionado ? '#ffd75e' : '#6e6558'} flatShading />
          </mesh>
        </>
      )}
      {objeto.tipo === 'arbol' && (
        <>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.5, 5]} />
            <meshStandardMaterial color="#7a5230" flatShading />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow>
            <coneGeometry args={[0.4, 0.9, 6]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        </>
      )}
    </group>
  )
}
