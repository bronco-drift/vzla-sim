// The Cartographer's dialogue: the hint that sends the player to the
// four cardinal stones (and whispers how the combination works).
import { useGameStore } from '../store/gameStore.js'

export function MujerModal() {
  const abierto = useGameStore((s) => s.mujerModal)
  const cerrarMujer = useGameStore((s) => s.cerrarMujer)
  if (!abierto) return null

  return (
    <div className="modal-grafico">
      <div className="modal-caja victoria">
        <span className="victoria-emoji">🌺</span>
        <h2>La Cartógrafa</h2>
        <p className="victoria-texto">
          «Yo dibujé los mapas de este mundo, y te digo algo: esas cuatro piedras del
          horizonte no son adornos.
          {'\n\n'}
          En cada cartel hay un número tallado. El guardián del norte manda — su cifra
          va primero — y los otros tres repiten la suya.
          {'\n\n'}
          Junta el año y sabrás abrir lo que sigue cerrado en la casa.»
        </p>
        <button className="btn-principal" onClick={cerrarMujer}>
          Gracias
        </button>
      </div>
    </div>
  )
}
