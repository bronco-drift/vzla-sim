// The advisor (vinotinto figure inside): progress-aware dialogue that
// ties the economy game to the adventure — finish every public work on
// the map and the library gives up its golden book.
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
  const texto = quest.finJuego
    ? '«Un país completo y una memoria completa. Fue un honor servirte, jefe. La república queda en buenas manos: las tuyas.»'
    : quest.tieneLlave
      ? '«Ya tenés la llave del libro — el resto del camino es tuyo. Si te perdés, la mujer de afuera conoce este mundo mejor que nadie.»'
      : obras.completas
        ? '«¡Lo lograste, jefe! Cada obra del mapa está terminada. La biblioteca ya no tiene nada que esconderte: buscá el lomo dorado.»'
        : `«El país primero, jefe. Completá las obras del mapa — van ${obras.hechas} de ${obras.total}. Cuando el último andamio baje, la biblioteca soltará su secreto.»`

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
