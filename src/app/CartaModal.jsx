// The founders' letter: the quest's ending, found inside the
// combination coffer on the corner table. Shows how long the journey
// took, both in governed years and in real playtime.
import { useGameStore } from '../store/gameStore.js'

function formatearTiempos(quest) {
  const anios = Math.floor((quest.finDias ?? 0) / 365)
  const anioFinal = 2026 + anios
  const seg = Math.round(quest.finSegundos ?? 0)
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const real = h > 0 ? `${h} h ${m} min` : `${m} min`
  return { anios, anioFinal, real }
}

export function CartaModal() {
  const abierto = useGameStore((s) => s.cartaModal)
  const quest = useGameStore((s) => s.quest)
  const cerrarCarta = useGameStore((s) => s.cerrarCarta)
  if (!abierto) return null
  const { anios, anioFinal, real } = formatearTiempos(quest)

  return (
    <div className="modal-grafico">
      <div className="modal-caja victoria">
        <span className="victoria-emoji">📜</span>
        <h2>Carta de los Próceres</h2>
        <p className="victoria-texto">
          «Recorriste cada rincón de este despacho y del mundo que lo rodea, como
          recorriste cada decisión que levantó a la república.
          {'\n\n'}
          {anios > 0
            ? `Gobernaste ${anios} años (2026–${anioFinal}) y te tomó ${real} de tu propio tiempo llegar hasta esta carta.`
            : `Te tomó ${real} de tu propio tiempo llegar hasta esta carta.`}
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
