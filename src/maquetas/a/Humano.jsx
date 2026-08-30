// Minecraft-style human for scale reference (1.75m tall at room scale:
// 1 unit = 1 cm). Click-drag moves him across the floor: a ray from the
// pointer is intersected with the floor plane each move. While dragging,
// map controls (or the fly-look) are paused so the camera stays still.
import { useRef, useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'

const PISO_Y = -80
const PLANO_PISO = new THREE.Plane(new THREE.Vector3(0, 1, 0), -PISO_Y)
const PIEL = '#c9a077'
const PELO = '#221812'
const JEAN = '#31518c'

// clave: which escena field stores this figure's position.
// The blue one ('humano2') is the POV avatar and hides while possessed.
export function Humano({
  clave = 'humano',
  camisa = '#7e2a3a', // vinotinto
  defaultPos = { x: -320, z: 180 },
}) {
  const humano = useGameStore((s) => s.escena[clave]) ?? defaultPos
  const esAvatarPov = clave === 'humano2'
  const enPov = useGameStore((s) => s.camaraPov)
  const setEscena = useGameStore((s) => s.setEscena)
  const setArrastreHumano = useGameStore((s) => s.setArrastreHumano)
  const { camera, gl, controls } = useThree()
  const [agarrado, setAgarrado] = useState(false)
  const pos = useRef({ ...humano })
  const grupoRef = useRef()

  useEffect(() => {
    if (!agarrado) return
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const punto = new THREE.Vector3()

    const mover = (e) => {
      const r = gl.domElement.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      if (!raycaster.ray.intersectPlane(PLANO_PISO, punto)) return
      pos.current.x = Math.max(-680, Math.min(680, punto.x))
      pos.current.z = Math.max(-75, Math.min(690, punto.z))
      grupoRef.current?.position.set(pos.current.x, PISO_Y, pos.current.z)
    }
    const soltar = () => {
      setAgarrado(false)
      setArrastreHumano(false)
      if (controls) controls.enabled = true
      document.body.style.cursor = 'auto'
      setEscena({ [clave]: { ...pos.current } }) // persist the final spot
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
    return () => {
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
    }
  }, [agarrado]) // eslint-disable-line react-hooks/exhaustive-deps

  const agarrar = (e) => {
    e.stopPropagation()
    setAgarrado(true)
    setArrastreHumano(true)
    if (controls) controls.enabled = false
    document.body.style.cursor = 'grabbing'
  }

  // The blue avatar disappears while you're inside its eyes (classic FPS)
  if (esAvatarPov && enPov) return null

  return (
    <group
      ref={grupoRef}
      position={[humano.x, PISO_Y, humano.z]}
      onPointerDown={agarrar}
      onPointerOver={() => !agarrado && (document.body.style.cursor = 'grab')}
      onPointerOut={() => !agarrado && (document.body.style.cursor = 'auto')}
    >
      {/* legs */}
      <mesh position={[-11, 33, 0]} castShadow>
        <boxGeometry args={[20, 66, 22]} />
        <meshStandardMaterial color={JEAN} flatShading />
      </mesh>
      <mesh position={[11, 33, 0]} castShadow>
        <boxGeometry args={[20, 66, 22]} />
        <meshStandardMaterial color={JEAN} flatShading />
      </mesh>
      {/* torso */}
      <mesh position={[0, 99, 0]} castShadow>
        <boxGeometry args={[44, 66, 24]} />
        <meshStandardMaterial color={camisa} flatShading />
      </mesh>
      {/* arms */}
      <mesh position={[-31, 99, 0]} castShadow>
        <boxGeometry args={[16, 62, 22]} />
        <meshStandardMaterial color={camisa} flatShading />
      </mesh>
      <mesh position={[31, 99, 0]} castShadow>
        <boxGeometry args={[16, 62, 22]} />
        <meshStandardMaterial color={camisa} flatShading />
      </mesh>
      <mesh position={[-31, 62, 0]}>
        <boxGeometry args={[16, 14, 22]} />
        <meshStandardMaterial color={PIEL} flatShading />
      </mesh>
      <mesh position={[31, 62, 0]}>
        <boxGeometry args={[16, 14, 22]} />
        <meshStandardMaterial color={PIEL} flatShading />
      </mesh>
      {/* head */}
      <mesh position={[0, 154, 0]} castShadow>
        <boxGeometry args={[42, 44, 42]} />
        <meshStandardMaterial color={PIEL} flatShading />
      </mesh>
      <mesh position={[0, 170, -1]}>
        <boxGeometry args={[44, 16, 44]} />
        <meshStandardMaterial color={PELO} flatShading />
      </mesh>
      {/* eyes hint at the facing direction */}
      <mesh position={[-9, 152, 21.2]}>
        <boxGeometry args={[6, 6, 1]} />
        <meshStandardMaterial color="#2c3038" />
      </mesh>
      <mesh position={[9, 152, 21.2]}>
        <boxGeometry args={[6, 6, 1]} />
        <meshStandardMaterial color="#2c3038" />
      </mesh>
    </group>
  )
}
