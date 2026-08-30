// Desk & wall decoration: Bolívar portrait on the wall (a real historic
// oil painting, public domain, from /textures/bolivar.webp), the "Nuevo
// Ideal Nacional" brochure lying on the desk, and a pen cup.
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'

function texturaDesdeCanvas(dibujar, ancho, alto) {
  const c = document.createElement('canvas')
  c.width = ancho
  c.height = alto
  dibujar(c.getContext('2d'), ancho, alto)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function DecoEscritorio() {
  // Real Bolívar portrait, loaded async (shows once ready)
  const [retrato, setRetrato] = useState(null)
  useEffect(() => {
    new THREE.TextureLoader().load('/textures/bolivar.webp', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      setRetrato(tex)
    })
  }, [])

  // "Nuevo Ideal Nacional" brochure lying on the desk
  const folleto = useMemo(
    () =>
      texturaDesdeCanvas((ctx, w, h) => {
        ctx.fillStyle = '#f2ead6'
        ctx.fillRect(0, 0, w, h)
        // tricolor header
        ctx.fillStyle = '#f5c518'
        ctx.fillRect(0, 0, w, h * 0.06)
        ctx.fillStyle = '#2b4faa'
        ctx.fillRect(0, h * 0.06, w, h * 0.06)
        ctx.fillStyle = '#c0392b'
        ctx.fillRect(0, h * 0.12, w, h * 0.06)
        // title
        ctx.fillStyle = '#1d1a14'
        ctx.font = `bold ${Math.round(h * 0.085)}px Georgia, serif`
        ctx.textAlign = 'center'
        ctx.fillText('NUEVO IDEAL', w / 2, h * 0.33)
        ctx.fillText('NACIONAL', w / 2, h * 0.43)
        // fake body lines
        ctx.fillStyle = '#8b8474'
        for (let i = 0; i < 6; i++) {
          const y = h * (0.55 + i * 0.062)
          ctx.fillRect(w * 0.12, y, w * (0.76 - (i % 3) * 0.1), h * 0.022)
        }
        // star
        ctx.fillStyle = '#c9a227'
        ctx.font = `${Math.round(h * 0.09)}px Georgia, serif`
        ctx.fillText('★', w / 2, h * 0.97)
      }, 256, 352),
    [],
  )

  return (
    <group>
      {/* Bolívar portrait on the wall, right of the window.
          Canvas is 25x33.5 to match the painting's 3:4 aspect. */}
      <group position={[180, 95, -81.4]}>
        {/* golden frame */}
        <mesh position={[0, 0, -0.3]}>
          <boxGeometry args={[29, 37.5, 1.6]} />
          <meshStandardMaterial color="#c9a227" flatShading />
        </mesh>
        {retrato && (
          <mesh position={[0, 0, 0.6]}>
            <planeGeometry args={[25, 33.5]} />
            <meshBasicMaterial map={retrato} />
          </mesh>
        )}
      </group>

      {/* Brochure lying on the desk, slightly rotated */}
      <mesh position={[62, 0.08, 20]} rotation={[-Math.PI / 2, 0, -0.35]}>
        <planeGeometry args={[15, 21]} />
        <meshBasicMaterial map={folleto} />
      </mesh>

      {/* Pen cup with pens */}
      <group position={[-64, 0, -16]}>
        <mesh position={[0, 2.4, 0]} castShadow>
          <cylinderGeometry args={[2.3, 2, 4.8, 10, 1, true]} />
          <meshStandardMaterial color="#5d6b7d" flatShading side={2} />
        </mesh>
        {[
          ['#2b4faa', -0.7, 0.15],
          ['#1d1a14', 0.5, -0.1],
          ['#c0392b', 0.1, 0.22],
          ['#c9a227', -0.2, -0.25],
        ].map(([color, dx, tilt], i) => (
          <mesh key={i} position={[dx, 5.6, dx * 0.6]} rotation={[tilt, 0, tilt * 1.4]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 7, 6]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  )
}
