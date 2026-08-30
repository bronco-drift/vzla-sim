// The looted tomb notice: a hook for the future recovery quest.
import { useGameStore } from '../store/gameStore.js'

export function TumbaModal() {
  const abierto = useGameStore((s) => s.tumbaModal)
  const cerrarTumba = useGameStore((s) => s.cerrarTumba)
  if (!abierto) return null

  return (
    <div className="modal-grafico">
      <div className="modal-caja victoria">
        <span className="victoria-emoji">⚰️</span>
        <h2>La tumba profanada</h2>
        <p className="victoria-texto">
          La tierra está removida y la lápida, partida en dos.
          {'\n\n'}
          «La tumba de Bolívar ha sido saqueada. Recuperá lo que se llevaron.»
          {'\n\n'}
          Las huellas se pierden en el pasto… por ahora.
        </p>
        <button className="btn-principal" onClick={cerrarTumba}>
          Lo encontraré
        </button>
      </div>
    </div>
  )
}
