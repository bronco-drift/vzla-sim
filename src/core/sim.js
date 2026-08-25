// Pure simulation engine: tick(state, days) -> new state.
// v1 economy calibrated against MODELO.md: baseline drift is weak, real
// progress comes from measures (oil phases, stabilization, human capital).
// No React/Three imports allowed here.

import { checkHito } from './hitos.js'
import { salarioReal, pibPerCapita } from './state.js'
import { efectosActivos } from './medidas.js'

const DIAS_POR_SNAPSHOT = 30 // one history point per simulated month
const MAX_HISTORIA = 2400    // ~200 simulated years, plenty

// Baseline rates (annual) — the country with no measures taken.
const CRECIMIENTO_BASE = 0.02
const DECAY_INFLACION_BASE = 0.12
const CRECIMIENTO_POBLACION_BASE = 0.005
const INGRESO_BASE_PCT_PIB = 0.03 // net budget income with no measures
const PETROLEO_BASE_ANUAL = 4_000 // M USD/year from current oil output

/**
 * Advance the simulation by `days` simulated days.
 * Pure function: never mutates, always returns a new state object.
 */
export function tick(state, days) {
  const anios = days / 365
  const ef = efectosActivos(state)

  // Human capital pushes growth (up to +2%/year at index 100)
  const bonusCH = ((state.capitalHumano - 40) / 60) * 0.02
  // Triple-digit inflation strangles growth
  const castigoInflacion = state.inflacion > 0.5 ? 0.01 : 0

  const crecimiento = CRECIMIENTO_BASE + ef.crecimiento + bonusCH - castigoInflacion

  const ingresoAnual =
    state.pibTotal * (INGRESO_BASE_PCT_PIB + ef.ingresoPctPib) +
    PETROLEO_BASE_ANUAL +
    ef.ingresoAnual

  const next = {
    ...state,
    dias: state.dias + days,
    pibTotal: state.pibTotal * (1 + crecimiento * anios),
    inflacion: Math.max(
      0.02,
      state.inflacion * (1 - DECAY_INFLACION_BASE * ef.decayInflacion * anios),
    ),
    poblacion: state.poblacion * (1 + (CRECIMIENTO_POBLACION_BASE + ef.poblacionAnual) * anios),
    capitalHumano: Math.min(100, state.capitalHumano + ef.capitalHumano * anios),
    caja: state.caja + ingresoAnual * anios,
  }

  // Poverty follows the real wage with a lag (people feel it slowly);
  // approval follows poverty and punishes high inflation. Informative
  // for now — elections/consequences arrive with design phase 2.
  const salarioNuevo = salarioReal(next)
  const pobrezaObjetivo = 1 / (1 + Math.pow(salarioNuevo / 450, 1.3))
  next.pobreza = state.pobreza + (pobrezaObjetivo - state.pobreza) * Math.min(1, 0.3 * anios)
  const aprobacionObjetivo = Math.min(
    0.95,
    Math.max(0.08, 0.92 - next.pobreza * 0.62 - (next.inflacion > 0.5 ? 0.15 : 0)),
  )
  next.aprobacion =
    state.aprobacion + (aprobacionObjetivo - state.aprobacion) * Math.min(1, 0.5 * anios)

  // Milestones react to the market wage (see MODELO.md table).
  // Record the day each one is reached — that's the player's scorecard.
  next.hitoActual = checkHito(salarioReal(next), next.hitoActual)
  if (next.hitoActual > state.hitoActual) {
    next.hitosAlcanzados = { ...state.hitosAlcanzados }
    for (let i = state.hitoActual + 1; i <= next.hitoActual; i++) {
      next.hitosAlcanzados[i] = next.dias
    }
  }

  // Monthly snapshot for the evolution charts
  if (Math.floor(next.dias / DIAS_POR_SNAPSHOT) > Math.floor(state.dias / DIAS_POR_SNAPSHOT)) {
    next.historia = [
      ...state.historia.slice(-MAX_HISTORIA + 1),
      {
        dias: next.dias,
        salario: salarioReal(next),
        pibPc: pibPerCapita(next),
        inflacion: next.inflacion,
        poblacion: next.poblacion,
        caja: next.caja,
        capitalHumano: next.capitalHumano,
        pobreza: next.pobreza,
        aprobacion: next.aprobacion,
      },
    ]
  }

  return next
}
