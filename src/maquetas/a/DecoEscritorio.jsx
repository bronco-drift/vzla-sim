// Desk & wall decoration: the founders' gallery (real public-domain
// oils — Bolívar, Sucre, Miranda — plus the antique map and one empty
// frame), all DRAGGABLE across the walls like the lights; the "Nuevo
// Ideal Nacional" brochure on the desk, and a pen cup.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'
import { golpear } from './Luces.jsx'

// Default hanging spots = Marcel's arrangement (position + wall normal)
const CUADROS_DEFAULT = {
  sucre: { x: -175, y: 150, z: -81.4, nx: 0, nz: 1 },
  bolivar: { x: 175, y: 150, z: -81.4, nx: 0, nz: 1 },
  miranda: { x: 577, y: 134, z: 701, nx: 0, nz: -1 },
  extra: { x: -543, y: 152, z: -80, nx: 0, nz: 1 },
}

/** A framed painting that can be dragged along/between walls. */
function CuadroMovible({ id, ancho, alto, textura, hijos }) {
  const pos = useGameStore((s) => s.escena.cuadros?.[id]) ?? CUADROS_DEFAULT[id]
  const setEscena = useGameStore((s) => s.setEscena)
  const setArrastreHumano = useGameStore((s) => s.setArrastreHumano)
  const { camera, gl, controls } = useThree()
  const [agarrado, setAgarrado] = useState(false)

  useEffect(() => {
    if (!agarrado) return
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const mover = (e) => {
      const r = gl.domElement.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      const hit = golpear(raycaster, 'aplique') // walls only
      if (!hit) return
      const { escena } = useGameStore.getState()
      setEscena({
        cuadros: {
          ...(escena.cuadros ?? {}),
          [id]: {
            // 6u off the LOGICAL wall plane: the north wall is a box
            // whose inner face sits 4u inside it — less than this and
            // the frame gets buried inside the wall's thickness
            x: hit.x + (hit.nx ?? 0) * 6,
            y: Math.max(70, Math.min(340, hit.y)),
            z: hit.z + (hit.nz ?? 0) * 6,
            nx: hit.nx ?? 0,
            nz: hit.nz ?? 0,
          },
        },
      })
    }
    const soltar = () => {
      setAgarrado(false)
      setArrastreHumano(false)
      if (controls) controls.enabled = true
      document.body.style.cursor = 'auto'
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
    return () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
    }
  }, [agarrado]) // eslint-disable-line react-hooks/exhaustive-deps

  const agarrar = (e) => {
    if (e.button !== 0) return
    e.stopPropagation()
    setAgarrado(true)
    setArrastreHumano(true)
    if (controls) controls.enabled = false
    document.body.style.cursor = 'grabbing'
  }

  const giro = Math.atan2(pos.nx ?? 0, pos.nz ?? 1)
  return (
    <group
      position={[pos.x, pos.y, pos.z]}
      rotation={[0, giro, 0]}
      onPointerDown={agarrar}
      onPointerOver={() => !agarrado && (document.body.style.cursor = 'grab')}
      onPointerOut={() => !agarrado && (document.body.style.cursor = 'auto')}
    >
      <mesh position={[0, 0, -0.3]}>
        <boxGeometry args={[ancho + 8, alto + 8, 2.4]} />
        <meshStandardMaterial color="#c9a227" flatShading />
      </mesh>
      {textura ? (
        <mesh position={[0, 0, 1]}>
          <planeGeometry args={[ancho, alto]} />
          <meshBasicMaterial map={textura} />
        </mesh>
      ) : (
        (hijos ?? (
          <mesh position={[0, 0, 1]}>
            <planeGeometry args={[ancho, alto]} />
            <meshStandardMaterial color="#3a2c26" />
          </mesh>
        ))
      )}
    </group>
  )
}

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
  // Real portraits (public-domain oils), loaded async (show once ready)
  const [retrato, setRetrato] = useState(null)
  const [retratoSucre, setRetratoSucre] = useState(null)
  const [retratoMiranda, setRetratoMiranda] = useState(null)
  const [retratoPaez, setRetratoPaez] = useState(null)
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    const cargar = (ruta, setter) =>
      loader.load(ruta, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        setter(tex)
      })
    cargar('/textures/bolivar.webp', setRetrato)
    cargar('/textures/sucre.webp', setRetratoSucre)
    cargar('/textures/miranda.webp', setRetratoMiranda)
    cargar('/textures/paez.webp', setRetratoPaez)
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

  // Compass rose easter egg: old-map style, drawn procedurally
  const rosa = useMemo(
    () =>
      texturaDesdeCanvas((ctx, w, h) => {
        const cx = w / 2
        const cy = h / 2
        ctx.strokeStyle = '#f0ebe0'
        ctx.fillStyle = '#f0ebe0'
        ctx.lineWidth = 3
        // outer ring
        ctx.beginPath()
        ctx.arc(cx, cy, w * 0.36, 0, Math.PI * 2)
        ctx.stroke()
        // 8-point star: long cardinal points, short diagonals
        const punta = (ang, largo, ancho, color) => {
          ctx.fillStyle = color
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(ang)
          ctx.beginPath()
          ctx.moveTo(0, -largo)
          ctx.lineTo(ancho, 0)
          ctx.lineTo(0, largo * 0.18)
          ctx.lineTo(-ancho, 0)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        }
        for (let i = 0; i < 4; i++) punta((i * Math.PI) / 2 + Math.PI / 4, w * 0.22, w * 0.035, '#c9a227')
        for (let i = 0; i < 4; i++) punta((i * Math.PI) / 2, w * 0.33, w * 0.05, '#f0ebe0')
        // letters
        ctx.fillStyle = '#f5c518'
        ctx.font = `bold ${Math.round(w * 0.13)}px Georgia, serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('N', cx, cy - w * 0.44)
        ctx.fillStyle = '#f0ebe0'
        ctx.fillText('S', cx, cy + w * 0.44)
        ctx.fillText('E', cx + w * 0.44, cy)
        ctx.fillText('O', cx - w * 0.44, cy)
      }, 256, 256),
    [],
  )

  // Antique parchment map of Venezuela for the south wall
  const mapaAntiguo = useMemo(
    () =>
      texturaDesdeCanvas((ctx, w, h) => {
        ctx.fillStyle = '#d9c9a3'
        ctx.fillRect(0, 0, w, h)
        // aged edges
        ctx.strokeStyle = '#a8905e'
        ctx.lineWidth = 10
        ctx.strokeRect(8, 8, w - 16, h - 16)
        ctx.strokeStyle = '#6b4a2f'
        ctx.lineWidth = 3
        ctx.strokeRect(18, 18, w - 36, h - 36)
        // rough Venezuela silhouette (stylized, hand-drawn look)
        const P = [
          [0.14, 0.32], [0.2, 0.28], [0.24, 0.36], [0.28, 0.3], [0.33, 0.24],
          [0.42, 0.26], [0.5, 0.22], [0.58, 0.26], [0.66, 0.24], [0.72, 0.3],
          [0.8, 0.32], [0.86, 0.42], [0.82, 0.55], [0.86, 0.68], [0.78, 0.78],
          [0.68, 0.74], [0.6, 0.8], [0.52, 0.72], [0.44, 0.76], [0.4, 0.62],
          [0.3, 0.56], [0.22, 0.6], [0.16, 0.48],
        ]
        ctx.beginPath()
        P.forEach(([px, py], i) => {
          if (i === 0) ctx.moveTo(px * w, py * h)
          else ctx.lineTo(px * w, py * h)
        })
        ctx.closePath()
        ctx.fillStyle = '#aab87a'
        ctx.fill()
        ctx.strokeStyle = '#5d4126'
        ctx.lineWidth = 4
        ctx.stroke()
        // title + tiny compass
        ctx.fillStyle = '#4a3018'
        ctx.font = 'bold 34px Georgia, serif'
        ctx.textAlign = 'center'
        ctx.fillText('V E N E Z U E L A', w / 2, h - 34)
        ctx.font = '26px Georgia, serif'
        ctx.fillText('✦', w - 56, 60)
      }, 512, 352),
    [],
  )

  return (
    <group>
      {/* Compass rose on the sea tray, old-map easter egg (N = -z) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[138, 0.45, 56]}>
        <planeGeometry args={[26, 26]} />
        <meshBasicMaterial map={rosa} transparent />
      </mesh>

      {/* The founders' gallery — every frame is draggable across walls:
          grab with left click/tap, release to hang. Position persists. */}
      <CuadroMovible id="bolivar" ancho={50} alto={67} textura={retrato} />
      <CuadroMovible id="sucre" ancho={45} alto={71} textura={retratoSucre} />
      <CuadroMovible id="miranda" ancho={50} alto={67} textura={retratoMiranda} />
      {/* Páez, full-length portrait (was the empty frame) */}
      <CuadroMovible id="extra" ancho={50} alto={70} textura={retratoPaez} />

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
