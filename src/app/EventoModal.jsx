// Story event modal: pauses the sim while open; closing records the
// event as seen in the save (it never fires again).
import { useGameStore } from '../store/gameStore.js'

export function EventoModal() {
  const evento = useGameStore((s) => s.eventoActivo)
  const cerrarEvento = useGameStore((s) => s.cerrarEvento)

  if (!evento) return null

  return (
    <div className="modal-grafico">
      <div className="modal-caja victoria">
        <span className="victoria-emoji">🗺️</span>
        <h2>{evento.titulo}</h2>
        <p className="victoria-texto">{evento.texto}</p>
        <button className="btn-principal" onClick={cerrarEvento}>
          Continuar
        </button>
      </div>
    </div>
  )
}
