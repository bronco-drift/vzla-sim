// Playable places. Coordinates are real lon/lat (sources: mapitas
// ve-state-capitals.geojson + standard geography for non-capitals).
// tipo: 'ciudad' = has measures panel; 'sitio' = infrastructure site.

export const LUGARES = [
  {
    id: 'caracas',
    nombre: 'Caracas',
    tipo: 'ciudad',
    lon: -66.9036,
    lat: 10.4806,
    descripcion: 'Capital. Centro político y financiero del país.',
  },
  {
    id: 'maracaibo',
    nombre: 'Maracaibo',
    tipo: 'ciudad',
    lon: -71.6125,
    lat: 10.6427,
    descripcion: 'Corazón petrolero histórico. El Lago y sus pozos.',
  },
  {
    id: 'valencia',
    nombre: 'Valencia',
    tipo: 'ciudad',
    lon: -68.0078,
    lat: 10.162,
    descripcion: 'Capital industrial. Base de la industria automotriz.',
  },
  {
    id: 'san-cristobal',
    nombre: 'San Cristóbal',
    tipo: 'ciudad',
    lon: -72.225,
    lat: 7.7669,
    descripcion: 'Puerta andina y frontera con Colombia. Nodo ferroviario futuro.',
  },
  {
    id: 'ciudad-guayana',
    nombre: 'Ciudad Guayana',
    tipo: 'ciudad',
    lon: -62.6517,
    lat: 8.3596,
    descripcion: 'Hierro, acero y aluminio. El complejo industrial de Guayana.',
  },
  {
    id: 'el-guri',
    nombre: 'El Guri',
    tipo: 'sitio',
    lon: -62.9994,
    lat: 7.766,
    descripcion: 'La represa que alimenta al país. Reparar sus turbinas lo cambia todo.',
  },
  {
    id: 'faja-orinoco',
    nombre: 'Faja del Orinoco',
    tipo: 'sitio',
    lon: -64.2452,
    lat: 8.889,
    descripcion: 'Las mayores reservas de crudo del mundo. Taladros, pozos y mejoradores.',
  },
  {
    id: 'puerto-cabello',
    nombre: 'Puerto Cabello',
    tipo: 'ciudad',
    lon: -68.0125,
    lat: 10.4731,
    descripcion: 'El puerto principal. La puerta del comercio exterior.',
  },
  {
    id: 'merida',
    nombre: 'Mérida',
    tipo: 'ciudad',
    lon: -71.1561,
    lat: 8.5897,
    descripcion: 'Ciudad universitaria de los Andes. Semillero de capital humano.',
  },
  {
    id: 'margarita',
    nombre: 'Margarita',
    tipo: 'ciudad',
    lon: -63.8497,
    lat: 10.9577,
    descripcion: 'La perla del Caribe. Turismo internacional.',
  },
]

export function lugarPorId(id) {
  return LUGARES.find((l) => l.id === id) ?? null
}
