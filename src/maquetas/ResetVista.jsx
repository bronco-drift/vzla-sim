// Re-centers the camera to the maqueta's default framing when the
// compass button is pressed (store.resetCamara bumps).
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore.js'

export function ResetVista({ posicion, target = [0, 0, 0], zoom = null }) {
  const senal = useGameStore((s) => s.resetCamara)
  const { camera, controls } = useThree()

  useEffect(() => {
    if (senal === 0) return // initial mount: camera is already at default
    camera.position.set(...posicion)
    if (zoom != null) {
      camera.zoom = zoom
      camera.updateProjectionMatrix()
    }
    if (controls) {
      controls.target.set(...target)
      controls.update()
    } else {
      camera.lookAt(...target)
    }
  }, [senal]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
