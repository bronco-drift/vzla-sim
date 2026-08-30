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
// Night background is near-black SPACE (stars live in Ventana.jsx);
// day keeps the warm wood tone that reads as a ceiling above the walls.
const MADERA_NOCHE = new THREE.Color('#04060d')
const MADERA_DIA = new THREE.Color('#553a22')
const MADERA_CREPUSCULO = new THREE.Color('#6e4322')
const auxiliar = new THREE.Color() // scratch color, avoids per-frame allocation

/** Sky color for a given daylight factor (0 = night, 1 = noon).
    Used by the office window "glass" to show the outside sky. */
export function colorCielo(dia, out) {
  return out.lerpColors(CIELO_NOCHE, CIELO_DIA, dia)
}

// Day/night is a fixed visual cycle: one full day+night ≈ 60 REAL
// seconds, regardless of sim speed (the scene panel can still pin it).
// Every system that reacts to daylight shares this one function.
export const SEGUNDOS_CICLO = 120
export function cicloDia(escena, tiempo) {
  return escena.solFijo ?? (tiempo % SEGUNDOS_CICLO) / SEGUNDOS_CICLO
}

// Live cycle fraction, written every frame by <Sol/> — lets plain React
// UI (the scene panel's "pin sun" toggle) read the CURRENT sky position.
export const fracVisual = { valor: 0.25 }

// Window glass wants a real daytime sky (light blue), not the deep
// world-backdrop blue above — otherwise noon looks like night indoors.
const VIDRIO_NOCHE = new THREE.Color('#101c30')
const VIDRIO_DIA = new THREE.Color('#8fc7e8')
export function colorVidrio(dia, out) {
  return out.lerpColors(VIDRIO_NOCHE, VIDRIO_DIA, dia)
}

export function Sol() {
  const luzSolRef = useRef()
  const solRef = useRef()
  const luzLunaRef = useRef()
  const lunaRef = useRef()
  const ambienteRef = useRef()
  const anguloVisual = useRef(Math.PI / 2) // start at noon
  const escalaVisual = useRef(1) // 1 = Venezuela orbit, ~16 = world orbit
  const cielo = useRef(new THREE.Color())
  const fondoMundo = useRef(0) // eased 0=desk palette, 1=world palette
  const { scene } = useThree()

  useFrame((state, delta) => {
    const { game, mundoGlobal, escena } = useGameStore.getState()
    if (!game || !luzSolRef.current) return

    // Orbit scale: world view x16; desk mode either hugs the old desk
    // orbit (x1) or — with escena.orbitaMundo, the default — sweeps the
    // WHOLE 100m diorama sky, rising and setting at the horizon.
    const orbitaMundo = escena.orbitaMundo ?? true
    const escalaObjetivo = mundoGlobal ? 16 : orbitaMundo ? 145 : 1
    escalaVisual.current += (escalaObjetivo - escalaVisual.current) * Math.min(1, delta * 2.5)
    const radio = RADIO * escalaVisual.current
    const alturaOrbita = ALTURA * escalaVisual.current
    const tamano = 1 + (escalaVisual.current - 1) * 0.45

    // One orbit per ~60 real seconds — unless the scene editor pinned
    // the sun at a fixed point of its track (escena.solFijo, 0..1).
    const frac = cicloDia(escena, state.clock.elapsedTime)
    fracVisual.valor = frac
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
    // The sun's disc shows in world view and in the big diorama orbit;
    // only the tiny desk orbit hides it (a glowing ball indoors is odd).
    solRef.current.visible = (mundoGlobal || orbitaMundo) && solAltura > -0.12

    // ---- Moon: opposite side of the orbit ----
    const lx = -sx
    const ly = -sy
    const lunaAltura = -solAltura

    luzLunaRef.current.position.set(lx, Math.max(ly, 2), PROFUNDIDAD)
    luzLunaRef.current.intensity = Math.max(0, lunaAltura) * 0.55
    lunaRef.current.position.set(lx, ly, PROFUNDIDAD)
    lunaRef.current.scale.setScalar(tamano)
    lunaRef.current.visible = (mundoGlobal || orbitaMundo) && lunaAltura > -0.12

    // Ambient floor keeps the night readable without "sunlight"
    ambienteRef.current.intensity = 0.35 + dia * 0.4

    // ---- Background/fog day-night blend ----
    // (Dawn/dusk orange tint removed for now — Marcel's call, 24-ago.)
    // Palette follows the VIEW (desk wood vs world sky), independent of
    // orbit scale — the big diorama orbit must keep the wood backdrop.
    fondoMundo.current += ((mundoGlobal ? 1 : 0) - fondoMundo.current) * Math.min(1, delta * 2.5)
    cielo.current.lerpColors(MADERA_NOCHE, MADERA_DIA, dia)
    auxiliar.lerpColors(CIELO_NOCHE, CIELO_DIA, dia)
    cielo.current.lerp(auxiliar, fondoMundo.current)
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
        shadow-normalBias={0.4}
        // Frustum covers the whole desk (lamp included): anything OUTSIDE
        // the shadow camera smears the map's edge into curved dark blobs.
        shadow-camera-left={-260}
        shadow-camera-right={260}
        shadow-camera-top={190}
        shadow-camera-bottom={-190}
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
