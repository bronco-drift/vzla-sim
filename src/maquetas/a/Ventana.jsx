// Office window: a REAL hole in the wall (the wall is built around it in
// Escritorio.jsx). The Ávila view hangs far behind the hole and the sky
// plane even farther, so camera movement produces true 3D parallax —
// the mountain moves like something distant, because it IS distant.
//
// Sky removal: hand-traced ridge silhouette over the photo (a per-pixel
// heuristic failed on clouds and foreground branches), plus a crop that
// drops the leafy corners of the original shot.
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'
import { colorVidrio } from './Sol.jsx'

const NOCHE_VISTA = new THREE.Color('#39415a') // mountain tint at night
const DIA_VISTA = new THREE.Color('#ffffff')

// Crop of the source photo (1024x768): drops sky headroom and the
// foreground branches on both upper corners.
const CROP = { x: 100, y: 150, ancho: 800, alto: 618 }

// Hand-traced Ávila ridge line in CROPPED coordinates [x, y].
// Everything above the line (minus a small safety margin) becomes sky.
const CRESTA = [
  [0, 60], [100, 88], [180, 58], [240, 38], [320, 52],
  [400, 78], [500, 112], [600, 132], [700, 142], [800, 152],
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

  // Sky plane follows the day/night cycle; the view darkens at night
  useFrame(() => {
    const { game, escena } = useGameStore.getState()
    if (!game || !cieloRef.current) return
    const frac = escena.solFijo ?? (game.dias % 365) / 365
    const dia = Math.max(0, Math.sin(frac * Math.PI * 2))
    colorVidrio(dia, cieloRef.current.material.color)
    if (vistaRef.current) {
      vistaRef.current.material.color.lerpColors(NOCHE_VISTA, DIA_VISTA, dia)
    }
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
          fog={false}: distance fog would wash the photo out. */}
      {texturaVista && (
        <mesh ref={vistaRef} position={[0, 72, -170]}>
          <planeGeometry args={[390, 301]} />
          <meshBasicMaterial map={texturaVista} transparent fog={false} />
        </mesh>
      )}

      {/* Sky, even farther back, colored by the day/night cycle */}
      <mesh ref={cieloRef} position={[0, 130, -430]}>
        <planeGeometry args={[920, 520]} />
        <meshBasicMaterial color="#1d3a57" fog={false} />
      </mesh>
    </group>
  )
}
