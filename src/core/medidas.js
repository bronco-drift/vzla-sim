// Pure measure logic: lifecycle (obra -> rampa -> pleno) and aggregated
// effects over the economy. No React imports.
import { MEDIDAS, medidaPorId } from '../data/medidas.js'

/**
 * Lifecycle of one measure given its start-day registry entry.
 * Returns { fase: 'disponible'|'obra'|'rampa'|'pleno', factor, progreso }.
 * factor: 0..1 effect multiplier. progreso: 0..1 of current stage.
 */
export function estadoMedida(medida, registro, dias) {
  if (!registro) return { fase: 'disponible', factor: 0, progreso: 0 }
  const anios = (dias - registro.inicio) / 365
  if (anios < medida.obra) {
    return { fase: 'obra', factor: 0, progreso: anios / medida.obra }
  }
  const enRampa = anios - medida.obra
  if (enRampa < medida.rampa) {
    return { fase: 'rampa', factor: enRampa / medida.rampa, progreso: enRampa / medida.rampa }
  }
  return { fase: 'pleno', factor: 1, progreso: 1 }
}

/** Whether requirements (other measures at full effect + milestone) are met. */
export function requisitosCumplidos(medida, state) {
  if (medida.requiereHito != null && state.hitoActual < medida.requiereHito) return false
  for (const reqId of medida.requiere ?? []) {
    const req = medidaPorId(reqId)
    const { fase } = estadoMedida(req, state.medidas[reqId], state.dias)
    if (fase !== 'pleno') return false
  }
  return true
}

/** Progress over ALL measures visible to the player (event-gated places
    only count once their event fired). Used to gate the adventure: the
    golden book unlocks when every visible public work is at full effect. */
export function progresoObras(state, lugares) {
  const visibles = new Set(
    lugares
      .filter((l) => !l.requiereEvento || (state.eventosVistos ?? {})[l.requiereEvento])
      .map((l) => l.id),
  )
  let hechas = 0
  let total = 0
  for (const medida of MEDIDAS) {
    if (!visibles.has(medida.lugarId)) continue
    total++
    const { fase } = estadoMedida(medida, state.medidas[medida.id], state.dias)
    if (fase === 'pleno') hechas++
  }
  return { hechas, total, completas: hechas >= total }
}

/** Aggregate the effects of every active measure, ramp-scaled. */
export function efectosActivos(state) {
  const total = {
    crecimiento: 0,
    ingresoAnual: 0,
    ingresoPctPib: 0,
    decayInflacion: 1,
    poblacionAnual: 0,
    capitalHumano: 0,
  }
  for (const medida of MEDIDAS) {
    const registro = state.medidas[medida.id]
    if (!registro) continue
    const { factor } = estadoMedida(medida, registro, state.dias)
    if (factor <= 0) continue
    const e = medida.efectos
    total.crecimiento += (e.crecimiento ?? 0) * factor
    total.ingresoAnual += (e.ingresoAnual ?? 0) * factor
    total.ingresoPctPib += (e.ingresoPctPib ?? 0) * factor
    if (e.decayInflacion) total.decayInflacion *= 1 + (e.decayInflacion - 1) * factor
    total.poblacionAnual += (e.poblacionAnual ?? 0) * factor
    total.capitalHumano += (e.capitalHumano ?? 0) * factor
  }
  return total
}
