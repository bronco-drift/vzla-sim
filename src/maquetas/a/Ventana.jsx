// Office window: a REAL hole in the wall (the wall is built around it in
// Escritorio.jsx). The Ávila view hangs far behind the hole and the sky
// plane even farther, so camera movement produces true 3D parallax —
// the mountain moves like something distant, because it IS distant.
//
// Sky removal: hand-traced ridge silhouette over the photo (a per-pixel
// heuristic failed on clouds and foreground branches), plus a crop that
// drops the leafy corners of the original shot.
import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'
import { colorVidrio } from './Sol.jsx'

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

const NOCHE_VISTA = new THREE.Color('#39415a') // mountain tint at night
const DIA_VISTA = new THREE.Color('#ffffff')

// Crop of the source photo (1024x768): drops sky headroom and the
// foreground branches on both upper corners.
const CROP = { x: 100, y: 150, ancho: 800, alto: 618 }

// Hand-traced Ávila ridge line in CROPPED coordinates [x, y].
// Everything above the line (minus a small safety margin) becomes sky.
const CRESTA = [
  [0, 60], [100, 88], [180, 58], [240, 38], [320, 52],
  [400, 82], [500, 122], [600, 152], [700, 164], [800, 174],
]

/** Linear interpolation of the ridge height at column x. */
function alturaCresta(x) {
  for (let i = 1; i < CRESTA.length; i++) {
    const [x0, y0] = CRESTA[i - 1]
    const [x1, y1] = CRESTA[i]
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
  }
  return CRESTA[CRESTA.length - 1][1]
}

export function Ventana() {
  const cieloRef = useRef()
  const vistaRef = useRef()
  const [texturaVista, setTexturaVista] = useState(null)

  useEffect(() => {
    const img = new Image()
    img.src = '/textures/avila.webp'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = CROP.ancho
      c.height = CROP.alto
      const ctx = c.getContext('2d')
      ctx.drawImage(img, CROP.x, CROP.y, CROP.ancho, CROP.alto, 0, 0, CROP.ancho, CROP.alto)
      const datos = ctx.getImageData(0, 0, c.width, c.height)
      const px = datos.data

      for (let x = 0; x < c.width; x++) {
        const corte = Math.round(alturaCresta(x)) + 4 // margin under the ridge
        for (let y = 0; y < Math.min(corte, c.height); y++) {
          px[(y * c.width + x) * 4 + 3] = 0
        }
        for (let f = 0; f < 4 && corte + f < c.height; f++) {
          px[((corte + f) * c.width + x) * 4 + 3] = Math.round((255 * (f + 1)) / 5)
        }
      }

      ctx.putImageData(datos, 0, 0)
      const tex = new THREE.CanvasTexture(c)
      tex.colorSpace = THREE.SRGBColorSpace
      setTexturaVista(tex)
    }
  }, [])

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
  useFrame(() => {
    const { game, escena } = useGameStore.getState()
    if (!game || !cieloRef.current) return
    const frac = escena.solFijo ?? (game.dias % 365) / 365
    const dia = Math.max(0, Math.sin(frac * Math.PI * 2))
    colorVidrio(dia, cieloRef.current.material.color)
    if (vistaRef.current) {
      vistaRef.current.material.color.lerpColors(NOCHE_VISTA, DIA_VISTA, dia)
    }
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

      {/* The distant view: Ávila far behind the hole (real parallax).
          Sized/placed so the RIDGE falls inside the window frame — the
          transparent sky strip above it reveals the big sky cylinder.
          fog={false}: distance fog would wash the photo out. */}
      {texturaVista && (
        <mesh ref={vistaRef} position={[0, 52, -170]}>
          <planeGeometry args={[300, 232]} />
          <meshBasicMaterial map={texturaVista} transparent fog={false} />
        </mesh>
      )}

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

      {/* Grass outside the room, filling the sky cylinder's floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -81, 310]}>
        <circleGeometry args={[9520, 48]} />
        <meshStandardMaterial color="#4d8a54" />
      </mesh>
    </group>
  )
}
