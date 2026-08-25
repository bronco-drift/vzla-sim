// Victory screen: shown once when the final milestone (top mundial) is
// reached. Never kicks the player out — "Seguir jugando" continues.
import { useGameStore } from '../store/gameStore.js'
import { HITOS } from '../core/hitos.js'
import { START_YEAR } from '../core/state.js'
import { Scorecard } from './Scorecard.jsx'

const HITO_FINAL = HITOS.length - 1

export function Victoria() {
  const game = useGameStore((s) => s.game)
  const marcarVictoriaVista = useGameStore((s) => s.marcarVictoriaVista)

  if (!game || game.victoriaVista || game.hitoActual < HITO_FINAL) return null

  const anios = Math.floor(game.dias / 365)
  const anioFinal = START_YEAR + anios

  return (
    <div className="modal-grafico">
      <div className="modal-caja victoria">
        <span className="victoria-emoji">🏆</span>
        <h2>Top mundial</h2>
        <p className="victoria-texto">
          Llevaste a Venezuela al nivel de los mejores países del mundo en{' '}
          <strong>{anios} años</strong> ({anioFinal}).
        </p>
        <Scorecard game={game} />
        <button className="btn-principal" onClick={marcarVictoriaVista}>
          Seguir jugando
        </button>
      </div>
    </div>
  )
}
