// Day/night cycle: sun and moon orbit the map on opposite sides.
// One full orbit = ONE simulated year (~12s at x1), so time speed is
// directly visible: at x4 the sun visibly spins faster.
//
// Smoothness: the simulation ticks only 10x/second, so reading game.dias
// directly makes the sun stutter. We keep a local visual angle and ease
// it toward the real one every frame (60fps smooth, stays in sync).
//
// Night: the sun's light fades to ZERO below the horizon; the moon takes
// over with a dim blue light. Sky and fog are tinted live: deep navy at
// night, soft blue at noon, and a warm dawn/dusk filter near the horizon.
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'

const RADIO = 55
const ALTURA = 38
const PROFUNDIDAD = 8

const COLOR_DIA = new THREE.Color('#fff4e0')
const COLOR_ATARDECER = new THREE.Color('#ff9a4d')
const COLOR_LUNA = new THREE.Color('#8ea2d6')

// Sky/fog palettes for the live filter. Desk mode fades to warm wood
// (the background IS a desk), world mode fades to sky blues.
const CIELO_NOCHE = new THREE.Color('#0a0f1a')
const CIELO_DIA = new THREE.Color('#1d3a57')
const CIELO_CREPUSCULO = new THREE.Color('#7a3d2a')
const MADERA_NOCHE = new THREE.Color('#191008')
const MADERA_DIA = new THREE.Color('#553a22')
const MADERA_CREPUSCULO = new THREE.Color('#6e4322')
const auxiliar = new THREE.Color() // scratch color, avoids per-frame allocation

export function Sol() {
  const luzSolRef = useRef()
  const solRef = useRef()
  const luzLunaRef = useRef()
  const lunaRef = useRef()
  const ambienteRef = useRef()
  const anguloVisual = useRef(Math.PI / 2) // start at noon
  const escalaVisual = useRef(1) // 1 = Venezuela orbit, ~16 = world orbit
  const cielo = useRef(new THREE.Color())
  const { scene } = useThree()

  useFrame((_, delta) => {
    const { game, mundoGlobal, escena } = useGameStore.getState()
    if (!game || !luzSolRef.current) return

    // World view: the sun rises on one edge of the planet and sets on the
    // other — same orbit, giant scale. Eased so the toggle feels smooth.
    const escalaObjetivo = mundoGlobal ? 16 : 1
    escalaVisual.current += (escalaObjetivo - escalaVisual.current) * Math.min(1, delta * 2.5)
    const radio = RADIO * escalaVisual.current
    const alturaOrbita = ALTURA * escalaVisual.current
    const tamano = 1 + (escalaVisual.current - 1) * 0.45

    // One orbit per simulated year — unless the scene editor pinned the
    // sun at a fixed point of its track (escena.solFijo, 0..1).
    const frac = escena.solFijo ?? (game.dias % 365) / 365
    const objetivo = frac * Math.PI * 2

    // Ease the visual angle toward the simulation's angle (wrap-aware)
    const TAU = Math.PI * 2
    let diff = (objetivo - anguloVisual.current) % TAU
    if (diff > Math.PI) diff -= TAU
    if (diff < -Math.PI) diff += TAU
    anguloVisual.current += diff * Math.min(1, delta * 8)
    const angulo = anguloVisual.current

    // ---- Sun ----
    const sx = Math.cos(angulo) * radio
    const sy = Math.sin(angulo) * alturaOrbita
    const solAltura = Math.sin(angulo) // 1 noon, 0 horizon, <0 night
    const dia = Math.max(0, solAltura)

    luzSolRef.current.position.set(sx, Math.max(sy, 2), PROFUNDIDAD)
    luzSolRef.current.color.lerpColors(COLOR_ATARDECER, COLOR_DIA, Math.min(dia * 2, 1))
    luzSolRef.current.intensity = dia * 1.8 // ZERO below the horizon
    solRef.current.position.set(sx, sy, PROFUNDIDAD)
    solRef.current.scale.setScalar(tamano)
    solRef.current.visible = solAltura > -0.12

    // ---- Moon: opposite side of the orbit ----
    const lx = -sx
    const ly = -sy
    const lunaAltura = -solAltura

    luzLunaRef.current.position.set(lx, Math.max(ly, 2), PROFUNDIDAD)
    luzLunaRef.current.intensity = Math.max(0, lunaAltura) * 0.55
    lunaRef.current.position.set(lx, ly, PROFUNDIDAD)
    lunaRef.current.scale.setScalar(tamano)
    lunaRef.current.visible = lunaAltura > -0.12

    // Ambient floor keeps the night readable without "sunlight"
    ambienteRef.current.intensity = 0.35 + dia * 0.4

    // ---- Background/fog day-night blend ----
    // (Dawn/dusk orange tint removed for now — Marcel's call, 24-ago.)
    // t blends the palette: 0 = desk (wood), 1 = world (sky).
    const t = Math.min(1, Math.max(0, (escalaVisual.current - 1) / 15))
    cielo.current.lerpColors(MADERA_NOCHE, MADERA_DIA, dia)
    auxiliar.lerpColors(CIELO_NOCHE, CIELO_DIA, dia)
    cielo.current.lerp(auxiliar, t)
    if (scene.background?.isColor) scene.background.copy(cielo.current)
    if (scene.fog) scene.fog.color.copy(cielo.current)
  })

  return (
    <>
      <ambientLight ref={ambienteRef} intensity={0.6} />

      {/* Sun: the only shadow caster */}
      <directionalLight
        ref={luzSolRef}
        position={[RADIO, ALTURA, PROFUNDIDAD]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <mesh ref={solRef} position={[RADIO, ALTURA, PROFUNDIDAD]}>
        <sphereGeometry args={[2.2, 16, 16]} />
        {/* fog={false}: the sun must glow even across the world-view fog */}
        <meshBasicMaterial color="#ffd75e" fog={false} />
      </mesh>

      {/* Moon: dim blue fill, no shadows (cheap) */}
      <directionalLight
        ref={luzLunaRef}
        position={[-RADIO, -ALTURA, PROFUNDIDAD]}
        intensity={0}
        color={COLOR_LUNA}
      />
      <mesh ref={lunaRef} position={[-RADIO, -ALTURA, PROFUNDIDAD]}>
        <sphereGeometry args={[1.6, 16, 16]} />
        <meshBasicMaterial color="#cfd9ee" fog={false} />
      </mesh>
    </>
  )
}
