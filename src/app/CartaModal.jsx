// The founders' letter: the quest's ending, found inside the
// combination coffer on the corner table.
import { useGameStore } from '../store/gameStore.js'

export function CartaModal() {
  const abierto = useGameStore((s) => s.cartaModal)
  const cerrarCarta = useGameStore((s) => s.cerrarCarta)
  if (!abierto) return null

  return (
    <div className="modal-grafico">
      <div className="modal-caja victoria">
        <span className="victoria-emoji">📜</span>
        <h2>Carta de los Próceres</h2>
        <p className="victoria-texto">
          «Recorriste cada rincón de este despacho y del mundo que lo rodea, como
          recorriste cada decisión que levantó a la república.
          {'\n\n'}
          Los próceres te agradecemos tu servicio a la nación: llevaste a Venezuela
          al lugar que merece en la historia.
          {'\n\n'}
          La obra no termina — un país se gobierna todos los días.»
          {'\n\n'}— Miranda · Bolívar · Sucre
        </p>
        <button className="btn-principal" onClick={cerrarCarta}>
          Seguir gobernando
        </button>
      </div>
    </div>
  )
}
