// Combination padlock modal: four dials, spin each with the arrows and
// try the code. The digits are carved into the cardinal signs (1777).
import { useState } from 'react'
import { useGameStore } from '../store/gameStore.js'

export function CandadoModal() {
  const abierto = useGameStore((s) => s.candadoModal)
  const cerrar = useGameStore((s) => s.cerrarCandadoModal)
  const probar = useGameStore((s) => s.probarCombinacion)
  const [digitos, setDigitos] = useState([0, 0, 0, 0])
  if (!abierto) return null

  const girar = (i, delta) => {
    setDigitos((d) => d.map((v, j) => (j === i ? (v + delta + 10) % 10 : v)))
  }

  return (
    <div className="modal-grafico">
      <div className="modal-caja victoria">
        <span className="victoria-emoji">🔒</span>
        <h2>Candado de combinación</h2>
        <div className="candado-diales">
          {digitos.map((d, i) => (
            <div key={i} className="candado-dial">
              <button onClick={() => girar(i, 1)}>▲</button>
              <span>{d}</span>
              <button onClick={() => girar(i, -1)}>▼</button>
            </div>
          ))}
        </div>
        <button className="btn-principal" onClick={() => probar(digitos.join(''))}>
          Probar la combinación
        </button>
        <button className="btn-secundario" onClick={cerrar}>
          Dejarlo
        </button>
      </div>
    </div>
  )
}
