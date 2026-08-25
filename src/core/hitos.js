// Milestone ladder from MODELO.md — the game's era system.
// Wage thresholds are market-validated minimum wage in monthly USD.

export const HITOS = [
  { id: 'estabilizacion', nombre: 'Estabilización', salario: 300, referencia: 'Servicios estables' },
  { id: 'mejor-latam', nombre: 'Mejor de LatAm', salario: 600, referencia: 'Chile / Uruguay / Costa Rica' },
  { id: 'nivel-europeo', nombre: 'Nivel europeo', salario: 1000, referencia: 'Portugal / Polonia / Grecia' },
  { id: 'primer-mundo', nombre: 'Primer mundo', salario: 2000, referencia: 'España / Corea del Sur' },
  { id: 'top-mundial', nombre: 'Top mundial', salario: 3000, referencia: 'Suiza / Australia / Luxemburgo' },
]

/**
 * Return the highest milestone index reached for a given wage.
 * Milestones never regress: keeps `actual` if wage dips afterwards.
 */
export function checkHito(salario, actual) {
  let alcanzado = actual
  for (let i = 0; i < HITOS.length; i++) {
    if (salario >= HITOS[i].salario && i > alcanzado) alcanzado = i
  }
  return alcanzado
}

/** Next milestone to chase, or null if the game is won. */
export function proximoHito(state) {
  return HITOS[state.hitoActual + 1] ?? null
}
