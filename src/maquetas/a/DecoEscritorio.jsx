// Desk & wall decoration: Bolívar portrait on the wall, the "Nuevo Ideal
// Nacional" brochure lying on the desk, and a pen cup. All textures are
// drawn procedurally in 2D canvases — no image files.
import { useMemo } from 'react'
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
  // Stylized Bolívar portrait: bust silhouette + tricolor sash
  const retrato = useMemo(
    () =>
      texturaDesdeCanvas((ctx, w, h) => {
        ctx.fillStyle = '#43322a' // dark canvas background
        ctx.fillRect(0, 0, w, h)
        // uniform (dark blue coat)
        ctx.fillStyle = '#1d2c4e'
        ctx.beginPath()
        ctx.ellipse(w / 2, h * 0.95, w * 0.38, h * 0.42, 0, Math.PI, 0)
        ctx.fill()
        // golden epaulettes
        ctx.fillStyle = '#c9a227'
        ctx.fillRect(w * 0.13, h * 0.62, w * 0.16, h * 0.07)
        ctx.fillRect(w * 0.71, h * 0.62, w * 0.16, h * 0.07)
        // white collar
        ctx.fillStyle = '#e8e2d0'
        ctx.fillRect(w * 0.42, h * 0.52, w * 0.16, h * 0.1)
        // face
        ctx.fillStyle = '#c9a077'
        ctx.beginPath()
        ctx.ellipse(w / 2, h * 0.38, w * 0.16, h * 0.17, 0, 0, Math.PI * 2)
        ctx.fill()
        // hair
        ctx.fillStyle = '#17120e'
        ctx.beginPath()
        ctx.ellipse(w / 2, h * 0.26, w * 0.18, h * 0.11, 0, Math.PI, 0)
        ctx.fill()
        // sideburns
        ctx.fillRect(w * 0.33, h * 0.28, w * 0.05, h * 0.14)
        ctx.fillRect(w * 0.62, h * 0.28, w * 0.05, h * 0.14)
        // tricolor sash across the chest
        const franja = h * 0.045
        ctx.save()
        ctx.translate(w * 0.5, h * 0.78)
        ctx.rotate(-0.45)
        ctx.fillStyle = '#f5c518'
        ctx.fillRect(-w * 0.55, -franja * 1.5, w * 1.1, franja)
        ctx.fillStyle = '#2b4faa'
        ctx.fillRect(-w * 0.55, -franja * 0.5, w * 1.1, franja)
        ctx.fillStyle = '#c0392b'
        ctx.fillRect(-w * 0.55, franja * 0.5, w * 1.1, franja)
        ctx.restore()
      }, 256, 320),
    [],
  )

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
      {/* Bolívar portrait on the wall, right of the window */}
      <group position={[40, 62, -81.4]}>
        {/* golden frame */}
        <mesh position={[0, 0, -0.3]}>
          <boxGeometry args={[30, 37, 1.6]} />
          <meshStandardMaterial color="#c9a227" flatShading />
        </mesh>
        <mesh position={[0, 0, 0.6]}>
          <planeGeometry args={[26, 33]} />
          <meshBasicMaterial map={retrato} />
        </mesh>
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
