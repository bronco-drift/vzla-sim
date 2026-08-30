// Loads the country GeoJSON once, derives the shared projection from its
// bbox, and renders terrain + places with the same mapping.
import { useEffect, useState, useMemo } from 'react'
import { bboxDeGeojson, crearProyeccion } from '../../mundo/proyeccion.js'
import { Terreno } from './Terreno.jsx'
import { Lugares } from './Lugares.jsx'
import { Capitales } from './Capitales.jsx'
import { Objetos } from './Objetos.jsx'
import { MundoGlobal } from './MundoGlobal.jsx'
import { Escritorio } from './Escritorio.jsx'
import { useGameStore } from '../../store/gameStore.js'

export function Mundo({ etiquetasFijas = false }) {
  const [geojson, setGeojson] = useState(null)
  const mundoGlobal = useGameStore((s) => s.mundoGlobal)

  useEffect(() => {
    fetch('/data/venezuela-adm0.geojson')
      .then((r) => r.json())
      .then(setGeojson)
      .catch((err) => console.error('No se pudo cargar el mapa:', err))
  }, [])

  const proyeccion = useMemo(
    () => (geojson ? crearProyeccion(bboxDeGeojson(geojson)) : null),
    [geojson],
  )

  if (!geojson || !proyeccion) return null

  return (
    <group>
      <Terreno geojson={geojson} proyeccion={proyeccion} />
      <Lugares proyeccion={proyeccion} etiquetasFijas={etiquetasFijas} />
      <Capitales proyeccion={proyeccion} />
      <Objetos />
      {mundoGlobal ? <MundoGlobal proyeccion={proyeccion} /> : <Escritorio />}
    </group>
  )
}
