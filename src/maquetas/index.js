// Maqueta registry. Each maqueta is a full view+interaction variant
// running on the same engine. Switch at runtime with ?maqueta=<id>.
import { MaquetaA } from './a/MaquetaA.jsx'
import { MaquetaB } from './b/MaquetaB.jsx'
import { MaquetaC } from './c/MaquetaC.jsx'

export const MAQUETAS = {
  a: { nombre: 'Diorama', Componente: MaquetaA },
  b: { nombre: 'Tablero', Componente: MaquetaB },
  c: { nombre: 'Datos', Componente: MaquetaC },
}

/** Active maqueta id from the URL (?maqueta=a), defaulting to 'a'. */
export function maquetaActiva() {
  const id = new URLSearchParams(window.location.search).get('maqueta')
  return MAQUETAS[id] ? id : 'a'
}
