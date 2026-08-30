// Maqueta registry. The diorama (A) won: Tablero (B) and Datos (C) were
// early experiments, retired 2026-08-30 — their code stays in b/ and c/
// but they're no longer selectable.
import { MaquetaA } from './a/MaquetaA.jsx'

export const MAQUETAS = {
  a: { nombre: 'Diorama', Componente: MaquetaA },
}

/** Active maqueta id from the URL (?maqueta=a), defaulting to 'a'. */
export function maquetaActiva() {
  const id = new URLSearchParams(window.location.search).get('maqueta')
  return MAQUETAS[id] ? id : 'a'
}
