// Public-works progress: a compact bar chip in map mode (X/Y + fill),
// expanding into the FULL single list of every visible measure with its
// live status (pendiente / en obra / en marcha / completa).
import { useState } from 'react'
import { useGameStore } from '../store/gameStore.js'
import { MEDIDAS } from '../data/medidas.js'
import { LUGARES } from '../data/lugares.js'
import { estadoMedida, progresoObras } from '../core/medidas.js'

const NOMBRE_LUGAR = Object.fromEntries(LUGARES.map((l) => [l.id, l.nombre]))

const ETIQUETA_FASE = {
  disponible: ['pendiente', '#8a8f96'],
  obra: ['en obra', '#e0a326'],
  rampa: ['en marcha', '#6cc4d4'],
  pleno: ['completa', '#4ade80'],
}

export function PanelObras() {
  const game = useGameStore((s) => s.game)
  const [abierto, setAbierto] = useState(false)
  if (!game) return null

  const progreso = progresoObras(game, LUGARES)
  const visibles = new Set(
    LUGARES.filter(
      (l) => !l.requiereEvento || (game.eventosVistos ?? {})[l.requiereEvento],
    ).map((l) => l.id),
  )

  return (
    <>
      <button className="obras-chip" onClick={() => setAbierto((v) => !v)}>
        <span>
          🏗️ Obras {progreso.hechas}/{progreso.total}
        </span>
        <span className="obras-barra">
          <span
            className="obras-relleno"
            style={{ width: `${(progreso.hechas / Math.max(1, progreso.total)) * 100}%` }}
          />
        </span>
      </button>

      {abierto && (
        <div className="obras-panel">
          <h3>
            Obras del país — {progreso.hechas} de {progreso.total}
          </h3>
          <div className="obras-lista">
            {MEDIDAS.filter((m) => visibles.has(m.lugarId)).map((m) => {
              const { fase, progreso: p } = estadoMedida(m, game.medidas[m.id], game.dias)
              const [texto, color] = ETIQUETA_FASE[fase]
              return (
                <div key={m.id} className="obra-fila">
                  <div className="obra-info">
                    <span className="obra-nombre">{m.nombre}</span>
                    <span className="obra-lugar">{NOMBRE_LUGAR[m.lugarId]}</span>
                  </div>
                  <span className="obra-estado" style={{ color }}>
                    {fase === 'obra' || fase === 'rampa'
                      ? `${texto} · ${Math.round(p * 100)}%`
                      : texto}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
