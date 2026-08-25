// Optional world map around Venezuela: every other country rendered as
// ONE flat, muted geometry (single draw call). Venezuela stays extruded
// and green — the highlighted protagonist. Lazy-loaded on first toggle.
import { useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'

export function MundoGlobal({ proyeccion }) {
  const [geojson, setGeojson] = useState(null)

  useEffect(() => {
    fetch('/data/mundo-paises.geojson')
      .then((r) => r.json())
      .then(setGeojson)
      .catch((err) => console.error('No se pudo cargar el mapa mundial:', err))
  }, [])

  const geometria = useMemo(() => {
    if (!geojson) return null
    const shapes = []

    const agregarPoligono = (anillos) => {
      const shape = new THREE.Shape()
      anillos.forEach((anillo, i) => {
        const path = i === 0 ? shape : new THREE.Path()
        anillo.forEach(([lon, lat], j) => {
          const { x, z } = proyeccion.aMundo(lon, lat)
          if (j === 0) path.moveTo(x, -z)
          else path.lineTo(x, -z)
        })
        if (i > 0) shape.holes.push(path)
      })
      shapes.push(shape)
    }

    for (const f of geojson.features) {
      if (f.properties.iso_a3 === 'VEN') continue // Venezuela has its own terrain
      const g = f.geometry
      if (g.type === 'Polygon') agregarPoligono(g.coordinates)
      else if (g.type === 'MultiPolygon') g.coordinates.forEach(agregarPoligono)
    }

    return new THREE.ShapeGeometry(shapes)
  }, [geojson, proyeccion])

  if (!geometria) return null

  return (
    // Raised well above the sea plane (0.25): tiny gaps z-fight at
    // world-view camera distances.
    <mesh geometry={geometria} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.55, 0]}>
      <meshStandardMaterial color="#2a3646" flatShading />
    </mesh>
  )
}
