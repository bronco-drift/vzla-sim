// Retro radio on a corner table (SW corner, right of the door as you
// walk in). Click toggles it; while ON, the music's volume follows the
// camera's distance — walk closer and it swells. Audio file expected at
// public/audio/radio.mp3 (Marcel supplies it).
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../../store/gameStore.js'

const POSICION = [-673, -80, 560]
const ROTACION = Math.PI / 2 // flat against the west wall, facing the room
const ALCANCE = 900 // distance at which the music fades to silence

export function Radio() {
  const encendido = useGameStore((s) => s.radioEncendido)
  const toggleRadio = useGameStore((s) => s.toggleRadio)
  const { camera } = useThree()
  const audioRef = useRef(null)
  const acumulador = useRef(0)

  useEffect(() => {
    const audio = new Audio('/audio/radio.mp3')
    audio.loop = true
    audio.volume = 0
    audioRef.current = audio
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  // play/pause follows the switch (the click IS the user gesture the
  // browser needs to allow playback)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (encendido) {
      audio.play().catch(() => {
        /* file missing or blocked: stay silent */
      })
    } else {
      audio.pause()
    }
  }, [encendido])

  // distance-based volume, updated a few times per second
  useFrame((_, delta) => {
    acumulador.current += delta
    if (acumulador.current < 0.2) return
    acumulador.current = 0
    const audio = audioRef.current
    if (!audio || !encendido) return
    const dx = camera.position.x - POSICION[0]
    const dy = camera.position.y - (POSICION[1] + 80)
    const dz = camera.position.z - POSICION[2]
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const vol = Math.max(0, 1 - dist / ALCANCE)
    audio.volume = Math.pow(vol, 1.6)
  })

  return (
    <group position={POSICION} rotation={[0, ROTACION, 0]}>
      {/* side table */}
      <mesh position={[0, 62, 0]} castShadow>
        <boxGeometry args={[70, 6, 46]} />
        <meshStandardMaterial color="#5d3d22" flatShading />
      </mesh>
      {[
        [-28, -17],
        [28, -17],
        [-28, 17],
        [28, 17],
      ].map(([lx, lz]) => (
        <mesh key={`${lx},${lz}`} position={[lx, 29, lz]}>
          <boxGeometry args={[6, 60, 6]} />
          <meshStandardMaterial color="#5d3d22" flatShading />
        </mesh>
      ))}

      {/* the radio (clickable) */}
      <group
        position={[0, 65, 0]}
        rotation={[0, 0.15, 0]}
        onPointerDown={(e) => {
          e.stopPropagation()
          toggleRadio()
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh position={[0, 13, 0]} castShadow>
          <boxGeometry args={[44, 26, 18]} />
          <meshStandardMaterial color="#8c4a2d" flatShading />
        </mesh>
        {/* speaker grille */}
        <mesh position={[-9, 13, 9.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[8.5, 8.5, 1, 14]} />
          <meshStandardMaterial color="#3a2c1c" flatShading />
        </mesh>
        {/* dial + knobs */}
        <mesh position={[10, 17, 9.2]}>
          <boxGeometry args={[14, 6, 1]} />
          <meshStandardMaterial color="#e8dcb8" flatShading />
        </mesh>
        {[5, 15].map((dx) => (
          <mesh key={dx} position={[dx, 7, 9.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[2.4, 2.4, 1.4, 8]} />
            <meshStandardMaterial color="#2c2018" flatShading />
          </mesh>
        ))}
        {/* antenna */}
        <mesh position={[16, 34, -4]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.7, 0.7, 26, 6]} />
          <meshStandardMaterial color="#8a8f96" flatShading />
        </mesh>
        {/* power LED */}
        <mesh position={[19, 17, 9.4]}>
          <sphereGeometry args={[1.6, 8, 8]} />
          <meshBasicMaterial color={encendido ? '#4ade80' : '#5a2020'} />
        </mesh>
      </group>
    </group>
  )
}
