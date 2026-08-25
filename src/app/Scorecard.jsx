// Milestone scorecard: the year each milestone was reached.
// Used by the victory screen and the pause menu.
import { HITOS } from '../core/hitos.js'
import { START_YEAR } from '../core/state.js'

export function Scorecard({ game }) {
  return (
    <div className="scorecard">
      {HITOS.map((hito, i) => {
        const dia = game.hitosAlcanzados?.[i]
        const alcanzado = dia != null
        return (
          <div key={hito.id} className={alcanzado ? 'score-fila lograda' : 'score-fila'}>
            <span className="score-nombre">
              {alcanzado ? '✓' : '·'} {hito.nombre}
            </span>
            <span className="score-anio">
              {alcanzado ? START_YEAR + Math.floor(dia / 365) : `salario $${hito.salario.toLocaleString('es-VE')}`}
            </span>
          </div>
        )
      })}
    </div>
  )
}
