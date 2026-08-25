// Pure game state — no React, no Three imports allowed in core/.
// Starting numbers anchored to MODELO.md; difficulty presets tune them.

export const START_YEAR = 2026

// Difficulty presets: how deep the starting hole is.
export const NIVELES = {
  facil: { nombre: 'Fácil', caja: 20_000, inflacion: 1.2, capitalHumano: 45 },
  realista: { nombre: 'Realista', caja: 10_000, inflacion: 2.0, capitalHumano: 40 },
  pesadilla: { nombre: 'Pesadilla', caja: 4_000, inflacion: 3.5, capitalHumano: 32 },
}

/**
 * @typedef {Object} GameState
 * @property {number} schemaVersion  Save-file version for future migrations
 * @property {string} nivel          Difficulty preset id
 * @property {number} dias           Simulated days elapsed since start
 * @property {number} velocidad      Time speed: 0 = paused, 1 / 2 / 4
 * @property {number} pibTotal       GDP in millions of USD
 * @property {number} poblacion      Population in millions
 * @property {number} inflacion      Annual inflation rate (0.5 = 50%)
 * @property {number} capitalHumano  Human capital index 0-100
 * @property {number} caja           Government budget in millions of USD
 * @property {number} hitoActual    Index of the last milestone reached (-1 = none)
 * @property {Object} medidas        { [medidaId]: { inicio: day } }
 * @property {Array}  historia       Monthly snapshots for the charts
 */

/** Create a fresh game state for a difficulty preset. */
export function createInitialState(nivel = 'realista') {
  const preset = NIVELES[nivel] ?? NIVELES.realista
  return {
    schemaVersion: 3,
    nivel,
    dias: 0,
    velocidad: 1,
    // Starting point from MODELO.md: GDP ~$100,000M, population ~29M
    pibTotal: 100_000,
    poblacion: 29.0,
    inflacion: preset.inflacion,
    capitalHumano: preset.capitalHumano,
    caja: preset.caja,
    hitoActual: -1,
    hitosAlcanzados: {}, // { [hitoIndex]: day it was reached } — the scorecard
    victoriaVista: false,
    medidas: {},
    historia: [],
  }
}

// ---- Derived values (computed, never stored) ----

/** GDP per capita in USD. */
export function pibPerCapita(state) {
  return (state.pibTotal * 1_000_000) / (state.poblacion * 1_000_000)
}

/**
 * Market-validated minimum wage (monthly USD). v0 formula from MODELO.md:
 * wage $1,000 should correspond to GDP pc ~$20,000 -> ratio 0.6 of monthly GDP pc.
 */
export function salarioReal(state) {
  return (pibPerCapita(state) / 12) * 0.6
}

/** Current in-game date as { anio, mes } (mes 0-11). */
export function fechaActual(state) {
  const anio = START_YEAR + Math.floor(state.dias / 365)
  const mes = Math.floor((state.dias % 365) / 30.42) % 12
  return { anio, mes }
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/** Formatted date, e.g. "Ene 2026". */
export function fechaTexto(state) {
  const { anio, mes } = fechaActual(state)
  return `${MESES[mes]} ${anio}`
}
