// Cardinal stone inscriptions: Roman gravitas fused with the game's
// thesis — a nation that improves relentlessly, strong like Rome.
import { useGameStore } from '../store/gameStore.js'

const INSCRIPCIONES = {
  norte: {
    latin: 'PER ASPERA AD ASTRA',
    texto:
      'Por el camino áspero, hasta las estrellas. Al norte está el Ávila y detrás ' +
      'el mar: todo lo que este país fue capaz de cruzar, lo volverá a cruzar. ' +
      'De la escasez al primer mundo, sin rendirse jamás.',
  },
  sur: {
    latin: 'ROMA NON UNO DIE AEDIFICATA EST',
    texto:
      'Roma no se construyó en un día — Venezuela tampoco. Cada medida, cada ' +
      'escuela, cada riel es una piedra más del imperio pacífico que estamos ' +
      'levantando: el de un pueblo que decidió mejorar todos los días.',
  },
  este: {
    latin: 'SOL INVICTUS ORIENS',
    texto:
      'El sol invicto nace por el este. Que cada amanecer encuentre a la ' +
      'república más fuerte que ayer: más sabia, más justa, más próspera. ' +
      'La disciplina de Roma con el corazón del Caribe.',
  },
  oeste: {
    latin: 'ACTA NON VERBA',
    texto:
      'Hechos, no palabras. Cuando el sol se ponga por el oeste, que hablen ' +
      'las obras: los puertos abiertos, los trenes andando, los hijos que ' +
      'vuelven. Un país fuerte no se promete — se construye.',
  },
}

export function PiedraModal() {
  const clave = useGameStore((s) => s.piedraActiva)
  const cerrarPiedra = useGameStore((s) => s.cerrarPiedra)
  if (!clave) return null
  const piedra = INSCRIPCIONES[clave]

  return (
    <div className="modal-grafico">
      <div className="modal-caja victoria">
        <span className="victoria-emoji">🏛️</span>
        <h2>{piedra.latin}</h2>
        <p className="victoria-texto">
          {piedra.texto}
          {'\n\n'}— SPQV · Senatus Populusque Venezuelanus
        </p>
        <button className="btn-principal" onClick={cerrarPiedra}>
          Seguir el camino
        </button>
      </div>
    </div>
  )
}
