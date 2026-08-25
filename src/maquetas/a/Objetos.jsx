// Read-only render of the placed world objects inside the game.
// The editor writes them (localStorage first, mundo.json shipped).
import { useEffect, useState } from 'react'
import { cargarMundo } from '../../mundo/cargarMundo.js'
import { ObjetoMesh } from '../../mundo/ObjetoMesh.jsx'

export function Objetos() {
  const [mundo, setMundo] = useState(null)

  useEffect(() => {
    cargarMundo().then(setMundo)
  }, [])

  if (!mundo) return null

  return (
    <group>
      {mundo.objetos.map((o) => (
        <ObjetoMesh key={o.id} objeto={o} />
      ))}
    </group>
  )
}
