// The Cartographer: an NPC standing outside near the west door. Click
// her and she points the player toward the four cardinal stones (the
// combination hint). Minecraft-style build with skirt and long hair.
import { useGameStore } from '../../store/gameStore.js'
import { resaltar } from '../resaltar.js'

const PIEL = '#c9a077'
const PELO = '#17110c'
const BLUSA = '#e8e2d0'
const FALDA = '#a03838'

export function Mujer() {
  const verMujer = useGameStore((s) => s.verMujer)

  return (
    <group
      position={[-1050, -80, 430]}
      rotation={[0, Math.PI / 2 + 0.3, 0]}
      onPointerDown={(e) => {
        e.stopPropagation()
        verMujer()
      }}
      onPointerOver={(e) => resaltar(e, true)}
      onPointerOut={(e) => resaltar(e, false)}
    >
      {/* legs peeking under the skirt */}
      <mesh position={[-9, 8, 0]}>
        <boxGeometry args={[13, 16, 16]} />
        <meshStandardMaterial color={PIEL} flatShading />
      </mesh>
      <mesh position={[9, 8, 0]}>
        <boxGeometry args={[13, 16, 16]} />
        <meshStandardMaterial color={PIEL} flatShading />
      </mesh>
      {/* skirt (slightly flared) */}
      <mesh position={[0, 36, 0]} castShadow>
        <boxGeometry args={[48, 44, 30]} />
        <meshStandardMaterial color={FALDA} flatShading />
      </mesh>
      {/* torso */}
      <mesh position={[0, 84, 0]} castShadow>
        <boxGeometry args={[42, 52, 24]} />
        <meshStandardMaterial color={BLUSA} flatShading />
      </mesh>
      {/* arms */}
      <mesh position={[-29, 88, 0]} castShadow>
        <boxGeometry args={[14, 50, 20]} />
        <meshStandardMaterial color={BLUSA} flatShading />
      </mesh>
      <mesh position={[29, 88, 0]} castShadow>
        <boxGeometry args={[14, 50, 20]} />
        <meshStandardMaterial color={BLUSA} flatShading />
      </mesh>
      <mesh position={[-29, 56, 0]}>
        <boxGeometry args={[14, 14, 20]} />
        <meshStandardMaterial color={PIEL} flatShading />
      </mesh>
      <mesh position={[29, 56, 0]}>
        <boxGeometry args={[14, 14, 20]} />
        <meshStandardMaterial color={PIEL} flatShading />
      </mesh>
      {/* head */}
      <mesh position={[0, 132, 0]} castShadow>
        <boxGeometry args={[40, 42, 40]} />
        <meshStandardMaterial color={PIEL} flatShading />
      </mesh>
      {/* long hair: crown + back fall */}
      <mesh position={[0, 148, -2]}>
        <boxGeometry args={[42, 14, 42]} />
        <meshStandardMaterial color={PELO} flatShading />
      </mesh>
      <mesh position={[0, 110, -19]}>
        <boxGeometry args={[42, 66, 8]} />
        <meshStandardMaterial color={PELO} flatShading />
      </mesh>
      {/* flower in her hair */}
      <mesh position={[17, 150, 12]}>
        <sphereGeometry args={[5, 8, 8]} />
        <meshStandardMaterial color="#f5c518" flatShading />
      </mesh>
      {/* eyes */}
      <mesh position={[-8, 132, 20.2]}>
        <boxGeometry args={[5.5, 5.5, 1]} />
        <meshStandardMaterial color="#2c3038" />
      </mesh>
      <mesh position={[8, 132, 20.2]}>
        <boxGeometry args={[5.5, 5.5, 1]} />
        <meshStandardMaterial color="#2c3038" />
      </mesh>
    </group>
  )
}
