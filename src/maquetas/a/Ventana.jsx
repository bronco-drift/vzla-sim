// Office window with a real view: the Ávila photo with its sky cut out
// (per-pixel, done in a 2D canvas at load), layered over the dynamic
// "glass" that follows the day/night cycle. Depth from inside the room.
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'
import { colorCielo } from './Sol.jsx'

const NOCHE_VISTA = new THREE.Color('#39415a') // mountain tint at night
const DIA_VISTA = new THREE.Color('#ffffff')

/** Heuristic: is this pixel sky? (blueish, or bright white cloud) */
function esCielo(r, g, b) {
  return (b > r + 8 && b > 100) || (r > 170 && g > 170 && b > 170)
}

export function Ventana() {
  const vidrioRef = useRef()
  const vistaRef = useRef()
  const [texturaVista, setTexturaVista] = useState(null)

  // Load the photo and make the sky transparent, column by column:
  // everything above the first solid mountain pixel becomes alpha 0.
  useEffect(() => {
    const img = new Image()
    img.src = '/textures/avila.webp'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const datos = ctx.getImageData(0, 0, c.width, c.height)
      const px = datos.data

      for (let x = 0; x < c.width; x++) {
        let corte = 0
        let seguidos = 0
        for (let y = 0; y < c.height; y++) {
          const i = (y * c.width + x) * 4
          if (!esCielo(px[i], px[i + 1], px[i + 2])) {
            if (++seguidos >= 4) {
              corte = y - 3
              break
            }
          } else {
            seguidos = 0
          }
        }
        for (let y = 0; y < corte; y++) px[(y * c.width + x) * 4 + 3] = 0
        // small feather so the ridge edge isn't jagged
        for (let f = 0; f < 3 && corte + f < c.height; f++) {
          px[((corte + f) * c.width + x) * 4 + 3] = Math.round((255 * (f + 1)) / 4)
        }
      }

      ctx.putImageData(datos, 0, 0)
      const tex = new THREE.CanvasTexture(c)
      tex.colorSpace = THREE.SRGBColorSpace
      setTexturaVista(tex)
    }
  }, [])

  // Glass follows the sky; the mountain view darkens at night
  useFrame(() => {
    const { game, escena } = useGameStore.getState()
    if (!game || !vidrioRef.current) return
    const frac = escena.solFijo ?? (game.dias % 365) / 365
    const dia = Math.max(0, Math.sin(frac * Math.PI * 2))
    colorCielo(dia, vidrioRef.current.material.color)
    if (vistaRef.current) {
      vistaRef.current.material.color.lerpColors(NOCHE_VISTA, DIA_VISTA, dia)
    }
  })

  return (
    // Layers spaced ≥0.3 apart to avoid z-fighting flicker
    <group position={[-42, 50, -80.8]}>
      {/* glass sky (color driven by the day/night cycle) */}
      <mesh ref={vidrioRef} position={[0, 0, -0.4]}>
        <planeGeometry args={[68, 52]} />
        <meshBasicMaterial color="#1d3a57" />
      </mesh>
      {/* the view: Ávila + Caracas, sky cut out */}
      {texturaVista && (
        <mesh ref={vistaRef} position={[0, 0, -0.1]}>
          <planeGeometry args={[68, 52]} />
          <meshBasicMaterial map={texturaVista} transparent />
        </mesh>
      )}
      {/* cross bars */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[2, 52, 1.2]} />
        <meshStandardMaterial color="#f0ebe0" flatShading />
      </mesh>
      <mesh position={[0, 0, 0.25]}>
        <boxGeometry args={[68, 2, 1.2]} />
        <meshStandardMaterial color="#f0ebe0" flatShading />
      </mesh>
      {/* frame */}
      <mesh position={[0, 27.5, 0.6]}>
        <boxGeometry args={[74, 3.5, 2.4]} />
        <meshStandardMaterial color="#f0ebe0" flatShading />
      </mesh>
      <mesh position={[0, -27.5, 0.6]}>
        <boxGeometry args={[74, 3.5, 2.4]} />
        <meshStandardMaterial color="#f0ebe0" flatShading />
      </mesh>
      <mesh position={[-35.2, 0, 0.6]}>
        <boxGeometry args={[3.5, 58.5, 2.4]} />
        <meshStandardMaterial color="#f0ebe0" flatShading />
      </mesh>
      <mesh position={[35.2, 0, 0.6]}>
        <boxGeometry args={[3.5, 58.5, 2.4]} />
        <meshStandardMaterial color="#f0ebe0" flatShading />
      </mesh>
      {/* sill */}
      <mesh position={[0, -30.5, 1.3]}>
        <boxGeometry args={[78, 2.5, 6]} />
        <meshStandardMaterial color="#e2dccc" flatShading />
      </mesh>
    </group>
  )
}
