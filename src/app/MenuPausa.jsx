// Pause menu overlay: resume, save, exit to menu. Opening it freezes
// the simulation (the loop skips ticks while menuPausa is true).
import { useGameStore } from '../store/gameStore.js'
import { NIVELES } from '../core/state.js'
import { Scorecard } from './Scorecard.jsx'

export function MenuPausa() {
  const abierto = useGameStore((s) => s.menuPausa)
  const toggle = useGameStore((s) => s.togglePausaMenu)
  const guardarAhora = useGameStore((s) => s.guardarAhora)
  const salirAlMenu = useGameStore((s) => s.salirAlMenu)
  const game = useGameStore((s) => s.game)

  if (!abierto || !game) return null

  return (
    <div className="modal-grafico" onClick={toggle}>
      <div className="modal-caja menu-pausa" onClick={(e) => e.stopPropagation()}>
        <h2>Pausa</h2>
        <p className="menu-nivel">Nivel: {NIVELES[game.nivel]?.nombre ?? game.nivel}</p>
        <Scorecard game={game} />
        <button className="btn-principal" onClick={toggle}>Reanudar</button>
        <button className="btn-secundario" onClick={() => { guardarAhora(); toggle() }}>
          Guardar
        </button>
        <button className="btn-secundario" onClick={salirAlMenu}>
          Salir al menú (guarda solo)
        </button>
      </div>
    </div>
  )
}
