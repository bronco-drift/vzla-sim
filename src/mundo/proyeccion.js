// Equirectangular projection: lon/lat -> world units on the XZ plane.
// The projection is built from the country's bounding box so terrain and
// city markers always share the same mapping. North points to -Z.

export const MUNDO_ANCHO = 60 // world units across the country's lon span

/** Compute [minLon, minLat, maxLon, maxLat] of a GeoJSON FeatureCollection. */
export function bboxDeGeojson(geojson) {
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity
  const verRing = (ring) => {
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon
      if (lon > maxLon) maxLon = lon
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
    }
  }
  for (const f of geojson.features) {
    const g = f.geometry
    if (g.type === 'Polygon') g.coordinates.forEach(verRing)
    else if (g.type === 'MultiPolygon') g.coordinates.forEach((p) => p.forEach(verRing))
  }
  return [minLon, minLat, maxLon, maxLat]
}

/** Create a projector { aMundo(lon, lat) -> {x, z} } from a bbox. */
export function crearProyeccion([minLon, minLat, maxLon, maxLat]) {
  const lonC = (minLon + maxLon) / 2
  const latC = (minLat + maxLat) / 2
  // Degrees of longitude shrink with latitude; keep the country's aspect ratio.
  const factorLat = Math.cos((latC * Math.PI) / 180)
  const k = MUNDO_ANCHO / ((maxLon - minLon) * factorLat)

  return {
    aMundo(lon, lat) {
      return {
        x: (lon - lonC) * k * factorLat,
        z: -(lat - latC) * k, // north = -Z (away from the default camera)
      }
    },
  }
}
