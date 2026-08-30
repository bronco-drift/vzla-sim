// Central office window: a REAL hole in the wall (the wall is built
// around it in Escritorio.jsx) showing the sky cylinder behind. This
// file also owns the sky itself: the giant cylinder around the world,
// plus the night-star layers. (The Ávila photo backdrop was removed for
// now — Marcel's call; public/textures/avila.webp stays for later.)
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'
import { colorVidrio, cicloDia } from './Sol.jsx'

/** Canvas of scattered stars on transparency (shared by night layers). */
function crearCanvasEstrellas() {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 512
  const ctx = c.getContext('2d')
  let semilla = 42
  const azar = () => {
    semilla = (semilla * 16807) % 2147483647
    return semilla / 2147483647
  }
  for (let i = 0; i < 320; i++) {
    const x = azar() * 1024
    const y = azar() * 512
    const r = azar() < 0.85 ? 0.8 + azar() * 0.8 : 1.6 + azar() * 1.2
    ctx.fillStyle = azar() < 0.8 ? '#ffffff' : '#cfe4f0'
    ctx.globalAlpha = 0.5 + azar() * 0.5
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  return c
}

export function Ventana() {
  const cieloRef = useRef()

  // Star textures: one wrapped around the cylinder, one for the dome cap
  const [texEstrellasLado, texEstrellasTapa] = useMemo(() => {
    const canvas = crearCanvasEstrellas()
    const lado = new THREE.CanvasTexture(canvas)
    lado.wrapS = lado.wrapT = THREE.RepeatWrapping
    lado.repeat.set(5, 1)
    const tapa = new THREE.CanvasTexture(canvas)
    tapa.wrapS = tapa.wrapT = THREE.RepeatWrapping
    tapa.repeat.set(3, 3)
    return [lado, tapa]
  }, [])
  const estrellasLadoRef = useRef()
  const estrellasTapaRef = useRef()

  // Sky follows the day/night cycle; stars fade in only at night
  useFrame((state) => {
    const { game, escena } = useGameStore.getState()
    if (!game || !cieloRef.current) return
    const frac = cicloDia(escena, state.clock.elapsedTime)
    const dia = Math.max(0, Math.sin(frac * Math.PI * 2))
    colorVidrio(dia, cieloRef.current.material.color)
    const noche = Math.max(0, 1 - dia * 3) // stars only in real darkness
    if (estrellasLadoRef.current) estrellasLadoRef.current.material.opacity = noche
    if (estrellasTapaRef.current) estrellasTapaRef.current.material.opacity = noche
  })

  return (
    <group>
      {/* Frame + cross + sill around the wall hole. Same size as every
          window (1.10 x 1.50 m), centered: hole x -55..55, y 10..160 */}
      <group position={[0, 85, -80.8]}>
        <mesh position={[0, 0, 0.2]}>
          <boxGeometry args={[3, 150, 1.4]} />
          <meshStandardMaterial color="#f0ebe0" flatShading />
        </mesh>
        <mesh position={[0, 0, 0.25]}>
          <boxGeometry args={[110, 3, 1.4]} />
          <meshStandardMaterial color="#f0ebe0" flatShading />
        </mesh>
        <mesh position={[0, 77, 0.9]}>
          <boxGeometry args={[124, 7, 3]} />
          <meshStandardMaterial color="#f0ebe0" flatShading />
        </mesh>
        <mesh position={[0, -77, 0.9]}>
          <boxGeometry args={[124, 7, 3]} />
          <meshStandardMaterial color="#f0ebe0" flatShading />
        </mesh>
        <mesh position={[-58, 0, 0.9]}>
          <boxGeometry args={[7, 161, 3]} />
          <meshStandardMaterial color="#f0ebe0" flatShading />
        </mesh>
        <mesh position={[58, 0, 0.9]}>
          <boxGeometry args={[7, 161, 3]} />
          <meshStandardMaterial color="#f0ebe0" flatShading />
        </mesh>
        <mesh position={[0, -82, 2]}>
          <boxGeometry args={[132, 5, 9]} />
          <meshStandardMaterial color="#e2dccc" flatShading />
        </mesh>
      </group>

      {/* Sky: a giant cylinder wrapped around the whole room (radius 95m,
          just inside the 100m flight bounds), seen from the inside and
          colored by the day/night cycle. Replaces the old flat backdrop. */}
      <mesh ref={cieloRef} position={[0, 5500, 310]}>
        <cylinderGeometry args={[9500, 9500, 13000, 64, 1, true]} />
        <meshBasicMaterial color="#1d3a57" fog={false} side={THREE.BackSide} />
      </mesh>

      {/* Stars: an inner cylinder + a dome cap, fading in at night */}
      <mesh ref={estrellasLadoRef} position={[0, 5500, 310]}>
        <cylinderGeometry args={[9350, 9350, 13000, 64, 1, true]} />
        <meshBasicMaterial
          map={texEstrellasLado}
          transparent
          opacity={0}
          depthWrite={false}
          fog={false}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh ref={estrellasTapaRef} position={[0, 11800, 310]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9600, 48]} />
        <meshBasicMaterial
          map={texEstrellasTapa}
          transparent
          opacity={0}
          depthWrite={false}
          fog={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* (grass, trees and cardinal boulders live in Exterior.jsx) */}
    </group>
  )
}
