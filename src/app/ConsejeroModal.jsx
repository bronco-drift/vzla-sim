// The advisor (vinotinto figure inside): progress-aware dialogue that
// ties the economy game to the adventure — get HALF the public works
// standing and the Biblioteca Pública gives up its golden book.
import { useGameStore } from '../store/gameStore.js'
import { progresoObras } from '../core/medidas.js'
import { LUGARES } from '../data/lugares.js'

export function ConsejeroModal() {
  const abierto = useGameStore((s) => s.consejeroModal)
  const cerrarConsejero = useGameStore((s) => s.cerrarConsejero)
  const game = useGameStore((s) => s.game)
  const quest = useGameStore((s) => s.quest)
  if (!abierto || !game) return null

  const obras = progresoObras(game, LUGARES)
  const meta = Math.ceil(obras.total / 2)
  const texto = quest.finJuego
    ? '«Un país completo y una memoria completa. Fue un honor servirte, jefe. La república queda en buenas manos: las tuyas.»'
    : quest.tieneLlave
      ? '«Ya tenés la llave del libro — el resto del camino es tuyo. Si te perdés, la mujer de afuera conoce este mundo mejor que nadie.»'
      : obras.hechas >= meta
        ? '«¡La Biblioteca Pública abrió sus puertas, jefe! Buscá el lomo dorado entre los estantes.»'
        : `«El país primero, jefe. Tocá el mapa y levantá obras — van ${obras.hechas} de ${obras.total}. Con la mitad en pie (${meta}), la Biblioteca Pública abre sus puertas.»`

  return (
    <div className="modal-grafico">
      <div className="modal-caja victoria">
        <span className="victoria-emoji">🧑‍💼</span>
        <h2>El Consejero</h2>
        <p className="victoria-texto">{texto}</p>
        <button className="btn-principal" onClick={cerrarConsejero}>
          Entendido
        </button>
      </div>
    </div>
  )
}
