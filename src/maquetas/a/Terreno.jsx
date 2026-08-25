// Country terrain: the national outline (GeoJSON MultiPolygon) extruded
// into a low-poly diorama slab, floating over a sea plane. The sea is a
// small "water tray" in desk mode and a whole ocean in world mode.
import { useMemo } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../../store/gameStore.js'

export const GROSOR_TERRENO = 0.8

export function Terreno({ geojson, proyeccion, onClickSuelo }) {
  const mundoGlobal = useGameStore((s) => s.mundoGlobal)
  const geometria = useMemo(() => {
    const shapes = []

    const agregarPoligono = (anillos) => {
      // ring 0 = outer boundary, rest = holes
      const shape = new THREE.Shape()
      anillos.forEach((anillo, i) => {
        const path = i === 0 ? shape : new THREE.Path()
        anillo.forEach(([lon, lat], j) => {
          const { x, z } = proyeccion.aMundo(lon, lat)
          // Shape lives in XY; after -90° X rotation, shapeY -> world -Z
          if (j === 0) path.moveTo(x, -z)
          else path.lineTo(x, -z)
        })
        if (i > 0) shape.holes.push(path)
      })
      shapes.push(shape)
    }

    for (const f of geojson.features) {
      const g = f.geometry
      if (g.type === 'Polygon') agregarPoligono(g.coordinates)
      else if (g.type === 'MultiPolygon') g.coordinates.forEach(agregarPoligono)
    }

    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: GROSOR_TERRENO,
      bevelEnabled: false,
    })
    geo.computeVertexNormals()
    return geo
  }, [geojson, proyeccion])

  return (
    <group>
      <mesh
        geometry={geometria}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
        onClick={
          onClickSuelo &&
          ((e) => {
            e.stopPropagation()
            onClickSuelo(e.point)
          })
        }
      >
        <meshStandardMaterial color="#4b8f57" flatShading />
      </mesh>
      {/* Sea: water tray in desk mode, full ocean in world mode */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.25, 0]} receiveShadow>
        <planeGeometry args={mundoGlobal ? [4000, 4000] : [130, 95]} />
        <meshStandardMaterial color="#1f5378" />
      </mesh>
    </group>
  )
}
