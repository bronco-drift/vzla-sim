// Measure catalog — the game's content. Numbers are v1 calibrations
// anchored to MODELO.md (oil phases, investments); tune freely here
// without touching engine code.
//
// Effect fields (all optional, applied while the measure is active,
// scaled 0->1 during its ramp):
//   crecimiento   extra annual GDP growth (0.01 = +1%/year)
//   ingresoAnual  extra yearly income to the budget, M USD
//   ingresoPctPib extra yearly income as % of GDP (negative = tax cut)
//   decayInflacion multiplier on inflation cooldown (1 = neutral)
//   poblacionAnual extra annual population growth (0.01 = +1%/year)
//   capitalHumano  index points gained per year
//
// costo in M USD (paid upfront), obra/rampa in years.
// requiere: ids of measures that must be at full effect first.
// requiereHito: milestone index needed before it unlocks.

export const MEDIDAS = [
  // ---- Motor petrolero (MODELO.md: 3 fases) ----
  {
    id: 'maracaibo-workover',
    lugarId: 'maracaibo',
    nombre: 'Reactivar pozos del Lago',
    descripcion: 'Workover masivo: bombas, compresión y pozos parados del Zulia.',
    costo: 6_000,
    obra: 2,
    rampa: 2,
    efectos: { crecimiento: 0.006, ingresoAnual: 5_000 },
  },
  {
    id: 'faja-fase1',
    lugarId: 'faja-orinoco',
    nombre: 'Petróleo Fase 1 — reparar lo existente',
    descripcion: 'De 1,1 a 1,6M bpd reactivando infraestructura (MODELO: $10-15.000M).',
    costo: 12_000,
    obra: 3,
    rampa: 2,
    efectos: { crecimiento: 0.01, ingresoAnual: 10_000 },
  },
  {
    id: 'faja-fase2',
    lugarId: 'faja-orinoco',
    nombre: 'Petróleo Fase 2 — mejoradores',
    descripcion: 'Perforación en racimos y mejoradores nuevos: rumbo a 2,5M bpd. Necesita El Guri.',
    costo: 60_000,
    obra: 5,
    rampa: 3,
    requiere: ['faja-fase1', 'guri-turbinas'],
    efectos: { crecimiento: 0.015, ingresoAnual: 22_000 },
  },
  {
    id: 'faja-fase3',
    lugarId: 'faja-orinoco',
    nombre: 'Petróleo Fase 3 — consorcios internacionales',
    descripcion: '3M+ bpd con contratos a 20-30 años. Solo con seguridad jurídica plena.',
    costo: 80_000,
    obra: 5,
    rampa: 3,
    requiere: ['faja-fase2', 'nacional-seguridad-juridica'],
    efectos: { crecimiento: 0.015, ingresoAnual: 35_000 },
  },
  {
    id: 'guri-turbinas',
    lugarId: 'el-guri',
    nombre: 'Reparar El Guri',
    descripcion: 'Turbinas y líneas de transmisión: fin de los apagones, energía para la industria.',
    costo: 4_000,
    obra: 2,
    rampa: 1,
    efectos: { crecimiento: 0.008, capitalHumano: 0.5 },
  },

  // ---- Estabilización e instituciones ----
  {
    id: 'nacional-estabilizacion',
    lugarId: 'caracas',
    nombre: 'Estabilización monetaria',
    descripcion: 'Moneda creíble, sin cepos ni tipos múltiples. La inflación cae en serio.',
    costo: 5_000,
    obra: 1,
    rampa: 1,
    efectos: { decayInflacion: 4, crecimiento: 0.004 },
  },
  {
    id: 'caracas-impuestos',
    lugarId: 'caracas',
    nombre: 'Rebaja de impuestos',
    descripcion: 'Menos caja hoy, más crecimiento mañana: formalizar vuelve a ser negocio.',
    costo: 1_000,
    obra: 0.5,
    rampa: 1,
    efectos: { ingresoPctPib: -0.012, crecimiento: 0.007 },
  },
  {
    id: 'caracas-estado-digital',
    lugarId: 'caracas',
    nombre: 'Modernización del estado',
    descripcion: 'Trámites digitales, menos fricción para crear y operar empresas.',
    costo: 3_000,
    obra: 2,
    rampa: 2,
    efectos: { crecimiento: 0.005, capitalHumano: 0.5 },
  },
  {
    id: 'nacional-seguridad-juridica',
    lugarId: 'caracas',
    nombre: 'Seguridad jurídica',
    descripcion: 'Derechos de propiedad y arbitraje: la llave del capital extranjero.',
    costo: 2_000,
    obra: 3,
    rampa: 1,
    efectos: { crecimiento: 0.006 },
  },
  {
    id: 'nacional-diaspora',
    lugarId: 'caracas',
    nombre: 'Retorno de la diáspora',
    descripcion: 'Campaña + empleos para que vuelvan. Traen experiencia de todo el mundo.',
    costo: 3_000,
    obra: 1,
    rampa: 3,
    requiereHito: 0,
    efectos: { poblacionAnual: 0.012, capitalHumano: 1.5 },
  },

  // ---- Industria y territorio ----
  {
    id: 'guayana-sidor',
    lugarId: 'ciudad-guayana',
    nombre: 'Reactivar SIDOR',
    descripcion: 'Hierro, acero y aluminio del complejo de Guayana. Necesita El Guri.',
    costo: 10_000,
    obra: 3,
    rampa: 2,
    requiere: ['guri-turbinas'],
    efectos: { crecimiento: 0.006, ingresoAnual: 4_000 },
  },
  {
    id: 'valencia-automotriz',
    lugarId: 'valencia',
    nombre: 'Industria automotriz',
    descripcion: 'Reabrir las plantas de Valencia con socios internacionales.',
    costo: 8_000,
    obra: 3,
    rampa: 2,
    efectos: { crecimiento: 0.006 },
  },
  {
    id: 'sancristobal-trenes',
    lugarId: 'san-cristobal',
    nombre: 'Trenes de carga y pasajeros',
    descripcion: 'Conectar los Andes con el centro: gente y mercancía sobre rieles.',
    costo: 6_000,
    obra: 4,
    rampa: 2,
    efectos: { crecimiento: 0.005, poblacionAnual: 0.002 },
  },
  {
    id: 'pcabello-puerto',
    lugarId: 'puerto-cabello',
    nombre: 'Modernizar el puerto',
    descripcion: 'Grúas, calado y aduana ágil: la puerta del comercio exterior.',
    costo: 7_000,
    obra: 3,
    rampa: 2,
    efectos: { crecimiento: 0.005, ingresoAnual: 2_000 },
  },
  {
    id: 'merida-universidades',
    lugarId: 'merida',
    nombre: 'Polo universitario',
    descripcion: 'Inversión fuerte en la ULA y polos técnicos. Rinde lento y profundo.',
    costo: 4_000,
    obra: 3,
    rampa: 4,
    efectos: { capitalHumano: 2, crecimiento: 0.002 },
  },
  {
    id: 'margarita-turismo',
    lugarId: 'margarita',
    nombre: 'Turismo internacional',
    descripcion: 'Vuelos directos, hoteles y marina: la perla vuelve al mapa.',
    costo: 5_000,
    obra: 3,
    rampa: 2,
    efectos: { crecimiento: 0.004, ingresoAnual: 2_500 },
  },
  {
    id: 'llanos-agroindustria',
    lugarId: 'llanos',
    nombre: 'Agroindustria llanera',
    descripcion: 'Riego, silos y frigoríficos: autosuficiencia primero, exportación después.',
    costo: 6_000,
    obra: 3,
    rampa: 3,
    efectos: { crecimiento: 0.005, ingresoAnual: 2_000 },
  },
  {
    id: 'canaima-ecoturismo',
    lugarId: 'canaima',
    nombre: 'Ecoturismo del Salto Ángel',
    descripcion: 'Acceso cuidado a los tepuyes: turismo de clase mundial sin destruirlos.',
    costo: 3_000,
    obra: 2,
    rampa: 3,
    requiereHito: 0,
    efectos: { crecimiento: 0.003, ingresoAnual: 1_800 },
  },
  {
    id: 'esequibo-integracion',
    lugarId: 'esequibo',
    nombre: 'Integración territorial',
    descripcion: 'Vías, servicios e instituciones para el estado más nuevo del país.',
    costo: 8_000,
    obra: 4,
    rampa: 2,
    efectos: { crecimiento: 0.004, poblacionAnual: 0.003 },
  },
  {
    id: 'esequibo-recursos',
    lugarId: 'esequibo',
    nombre: 'Recursos del Esequibo',
    descripcion: 'Oro, bauxita y bosques manejados con estándares internacionales.',
    costo: 10_000,
    obra: 4,
    rampa: 3,
    requiere: ['esequibo-integracion'],
    efectos: { crecimiento: 0.005, ingresoAnual: 5_000 },
  },
]

export function medidasDeLugar(lugarId) {
  return MEDIDAS.filter((m) => m.lugarId === lugarId)
}

export function medidaPorId(id) {
  return MEDIDAS.find((m) => m.id === id) ?? null
}
