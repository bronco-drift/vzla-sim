// Cinematic camera flight between modes (POV <-> map). The path is a
// raised Bezier arc that clears the room's walls (never through the
// furniture), the camera FACES ITS DIRECTION OF TRAVEL for most of the
// flight (drone-style, no backwards drift), and only in the last stretch
// it blends into the destination framing. ~1.1s, eased.
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore.js'

const dummy = new THREE.Object3D()
const puntoA = new THREE.Vector3()
const puntoB = new THREE.Vector3()

function bezier(out, p0, pm, p1, t) {
  const u = 1 - t
  out.set(
    u * u * p0.x + 2 * u * t * pm.x + t * t * p1.x,
    u * u * p0.y + 2 * u * t * pm.y + t * t * p1.y,
    u * u * p0.z + 2 * u * t * pm.z + t * t * p1.z,
  )
  return out
}

export function VueloCamara() {
  const { camera } = useThree()
  const vuelo = useRef(null)
  const transicion = useGameStore((s) => s.transicion)

  if (transicion && !vuelo.current) {
    const p0 = camera.position.clone()
    const p1 = new THREE.Vector3(...transicion.pos)
    // arc apex: above the walls, halfway along — scaled to the distance
    // so short hops stay low and long trips soar
    const alto = Math.min(900, 220 + p0.distanceTo(p1) * 0.45)
    const pm = new THREE.Vector3(
      (p0.x + p1.x) / 2,
      Math.max(p0.y, p1.y) + alto,
      (p0.z + p1.z) / 2,
    )
    dummy.position.copy(p1)
    dummy.lookAt(...transicion.target)
    vuelo.current = {
      p0,
      pm,
      p1,
      q0: camera.quaternion.clone(),
      q1: dummy.quaternion.clone(),
      t: 0,
    }
  }

  useFrame((_, delta) => {
    const v = vuelo.current
    if (!v) return
    v.t = Math.min(1, v.t + delta / 1.1)
    const t = v.t
    const k = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    bezier(puntoA, v.p0, v.pm, v.p1, k)
    camera.position.copy(puntoA)

    // face the direction of travel; blend to the final framing at the end
    bezier(puntoB, v.p0, v.pm, v.p1, Math.min(1, k + 0.04))
    dummy.position.copy(puntoA)
    if (puntoB.distanceToSquared(puntoA) > 0.01) dummy.lookAt(puntoB)
    else dummy.quaternion.copy(v.q1)

    if (t < 0.15) {
      // ease OUT of the starting orientation into travel-facing
      const kIni = t / 0.15
      camera.quaternion.slerpQuaternions(v.q0, dummy.quaternion, kIni)
    } else if (t < 0.7) {
      camera.quaternion.copy(dummy.quaternion)
    } else {
      const kFin = (t - 0.7) / 0.3
      const suave = kFin * kFin * (3 - 2 * kFin)
      camera.quaternion.slerpQuaternions(dummy.quaternion, v.q1, suave)
    }

    if (t >= 1) {
      camera.position.copy(v.p1)
      camera.quaternion.copy(v.q1)
      vuelo.current = null
      useGameStore.getState().finTransicion()
    }
  })

  return null
}
