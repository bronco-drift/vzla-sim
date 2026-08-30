// Maqueta A: low-poly diorama with a free map camera.
// Real Venezuela terrain from GeoJSON, clickable places, and a sun that
// orbits once per simulated year (time speed made visible).
import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { Mundo } from './Mundo.jsx'
import { Sol } from './Sol.jsx'
import { ResetVista } from '../ResetVista.jsx'
import { ControlesLibres } from '../ControlesLibres.jsx'
import { ControlesPOV } from '../ControlesPOV.jsx'
import { useGameStore } from '../../store/gameStore.js'

// Default map framing chosen by Marcel: dist 66 / alt 49 to the target.
// The short intro dolly starts a bit farther (dist 89 / alt 67).
const OBJETIVO_MAPA = [0, 0, -4]
const POSE_FINAL = [0, 49, 40.2]
const POSE_INTRO = [0, 67, 54.6]

/** Short welcome dolly every time map mode mounts: eases from the far
    pose to the default framing (~1.1s). Any pointer press skips it. */
function IntroMapa() {
  const { camera, controls, gl } = useThree()
  const estado = useRef({ t: 0, activa: true })

  useEffect(() => {
    const lienzo = gl.domElement
    const saltar = () => {
      const e = estado.current
      if (!e.activa) return
      e.activa = false
      camera.position.set(...POSE_FINAL)
      if (controls) {
        controls.target.set(...OBJETIVO_MAPA)
        controls.update()
        controls.enabled = true
      }
    }
    lienzo.addEventListener('pointerdown', saltar)
    return () => lienzo.removeEventListener('pointerdown', saltar)
  }, [camera, controls, gl])

  useFrame((_, delta) => {
    const e = estado.current
    if (!e.activa || !controls) return
    if (e.t === 0) controls.enabled = false
    e.t = Math.min(1, e.t + delta / 1.1)
    const k = 1 - Math.pow(1 - e.t, 3) // ease-out cubic
    camera.position.set(
      POSE_INTRO[0] + (POSE_FINAL[0] - POSE_INTRO[0]) * k,
      POSE_INTRO[1] + (POSE_FINAL[1] - POSE_INTRO[1]) * k,
      POSE_INTRO[2] + (POSE_FINAL[2] - POSE_INTRO[2]) * k,
    )
    controls.target.set(...OBJETIVO_MAPA)
    controls.update()
    if (e.t >= 1) {
      e.activa = false
      controls.enabled = true
    }
  })

  return null
}

export function MaquetaA() {
  const seleccionarLugar = useGameStore((s) => s.seleccionarLugar)
  const mundoGlobal = useGameStore((s) => s.mundoGlobal)
  const camaraLibre = useGameStore((s) => s.camaraLibre)
  const camaraPov = useGameStore((s) => s.camaraPov)

  // shadows="soft" = PCFSoftShadowMap: smooth shadow edges
  return (
    <Canvas
      // near: 1 (not the 0.1 default) keeps the depth buffer precise at
      // world-view distances — kills z-fighting shimmer far away
      camera={{ position: [0, 49, 40.2], fov: 45, near: 1, far: 20000 }}
      shadows="soft"
      onPointerMissed={() => seleccionarLugar(null)}
    >
      <color attach="background" args={['#101722']} />
      {/* World view needs a much deeper fog so the planet doesn't vanish.
          Desk mode: fog far enough that the room reads from 100m up. */}
      <fog attach="fog" args={mundoGlobal ? ['#101722', 300, 1400] : ['#101722', 600, 12000]} />

      <Sol />
      <Mundo />
      <ResetVista posicion={[0, 49, 40.2]} target={[0, 0, -4]} />

      {/* Map camera by default; fly or first-person walk when toggled */}
      {camaraPov ? (
        <ControlesPOV />
      ) : camaraLibre ? (
        <ControlesLibres />
      ) : (
        <>
          <MapControls
            makeDefault
            target={[0, 0, -4]}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.4}
            minDistance={8}
            maxDistance={mundoGlobal ? 500 : 320}
          />
          <IntroMapa />
        </>
      )}
    </Canvas>
  )
}
