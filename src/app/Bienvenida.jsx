// Welcome screen: continue a saved game, start a new one picking a
// difficulty, choose the active maqueta, or open the world editor.
import { useState } from 'react'
import { useGameStore, hayPartidaGuardada } from '../store/gameStore.js'
import { NIVELES } from '../core/state.js'
import { MAQUETAS, maquetaActiva } from '../maquetas/index.js'

export function Bienvenida() {
  const nuevaPartida = useGameStore((s) => s.nuevaPartida)
  const continuarPartida = useGameStore((s) => s.continuarPartida)
  const [eligiendoNivel, setEligiendoNivel] = useState(false)
  const haySave = hayPartidaGuardada()

  return (
    <div className="bienvenida">
      <h1>vzla-sim</h1>
      <p className="subtitulo">Llevá a Venezuela al nivel de los mejores países del mundo.</p>

      {haySave && (
        <button className="btn-principal" onClick={continuarPartida}>
          Continuar
        </button>
      )}

      {!eligiendoNivel ? (
        <button
          className={haySave ? 'btn-secundario' : 'btn-principal'}
          onClick={() => setEligiendoNivel(true)}
        >
          Nueva partida
        </button>
      ) : (
        <div className="niveles">
          {Object.entries(NIVELES).map(([id, nivel]) => (
            <button key={id} className="btn-nivel" onClick={() => nuevaPartida(id)}>
              <strong>{nivel.nombre}</strong>
              <span>
                Caja ${(nivel.caja / 1000).toFixed(0)}k M · inflación{' '}
                {(nivel.inflacion * 100).toFixed(0)}%
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="selector-maqueta">
        {Object.entries(MAQUETAS).map(([id, m]) => (
          <a
            key={id}
            className={maquetaActiva() === id ? 'chip-maqueta activo' : 'chip-maqueta'}
            href={`/?maqueta=${id}`}
          >
            {m.nombre}
          </a>
        ))}
      </div>

      <a className="enlace-editor" href="/?editor">
        Editor de mundo
      </a>
    </div>
  )
}
