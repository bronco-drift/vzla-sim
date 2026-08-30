// "Cesarismo democrático" book modal: quest starter. Closing it takes
// the bronze key hidden between the pages. Reuses the event modal styles.
import { useGameStore } from '../store/gameStore.js'

export function LibroModal() {
  const abierto = useGameStore((s) => s.quest.libroAbierto)
  const cerrarLibro = useGameStore((s) => s.cerrarLibro)
  if (!abierto) return null

  return (
    <div className="modal-grafico">
      <div className="modal-caja victoria">
        <span className="victoria-emoji">📖</span>
        <h2>Cesarismo democrático</h2>
        <p className="victoria-texto">
          Laureano Vallenilla Lanz, 1919. La vieja tesis del «gendarme necesario»: que
          este país, cansado de guerras, solo podía obedecer a un caudillo fuerte.
          {'\n\n'}
          Este simulador existe para demostrar lo contrario — que a una nación no la
          levanta un hombre providencial sino instituciones, capital humano y paciencia.
          {'\n\n'}🔑 Entre las páginas hay una llave de bronce.
        </p>
        <button className="btn-principal" onClick={cerrarLibro}>
          Tomar la llave y cerrar el libro
        </button>
      </div>
    </div>
  )
}
