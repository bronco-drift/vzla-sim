// Top bar: date + time controls + the key numbers + next milestone.
// Click an indicator to open its evolution chart. Reads everything
// from the store; owns no game logic.
import { useState } from 'react'
import { useGameStore } from '../store/gameStore.js'
import { pibPerCapita, salarioReal, fechaTexto } from '../core/state.js'
import { proximoHito } from '../core/hitos.js'
import { Grafico } from './Grafico.jsx'

// x1 = one simulated month per real second (~12s per year)
const VELOCIDADES = [
  { v: 0, etiqueta: '⏸' },
  { v: 1, etiqueta: '×1' },
  { v: 2, etiqueta: '×2' },
  { v: 4, etiqueta: '×4' },
]

const fmtUsd = (n, dec = 0) =>
  '$' + n.toLocaleString('es-VE', { maximumFractionDigits: dec })

// Indicator definitions: HUD value + chart config over game.historia
const INDICADORES = [
  { campo: 'salario', nombre: 'Salario real', color: '#3fb56b', valor: (g) => fmtUsd(salarioReal(g)), formato: (v) => fmtUsd(v) },
  { campo: 'pibPc', nombre: 'PIB per cápita', color: '#f5c518', valor: (g) => fmtUsd(pibPerCapita(g)), formato: (v) => fmtUsd(v) },
  { campo: 'inflacion', nombre: 'Inflación', color: '#e06456', valor: (g) => (g.inflacion * 100).toFixed(0) + '%', formato: (v) => (v * 100).toFixed(0) + '%' },
  { campo: 'poblacion', nombre: 'Población', color: '#7aa7e0', valor: (g) => g.poblacion.toFixed(1) + 'M', formato: (v) => v.toFixed(1) + 'M' },
  { campo: 'capitalHumano', nombre: 'Capital humano', color: '#b58fd6', valor: (g) => g.capitalHumano.toFixed(0), formato: (v) => v.toFixed(0) },
  { campo: 'caja', nombre: 'Caja', color: '#8fa3b8', valor: (g) => fmtUsd(g.caja) + 'M', formato: (v) => fmtUsd(v) + 'M' },
]

export function Hud() {
  const game = useGameStore((s) => s.game)
  const setVelocidad = useGameStore((s) => s.setVelocidad)
  const togglePausaMenu = useGameStore((s) => s.togglePausaMenu)
  const [grafico, setGrafico] = useState(null) // campo abierto o null

  if (!game) return null

  const hito = proximoHito(game)
  const indicadorAbierto = INDICADORES.find((i) => i.campo === grafico)

  return (
    <>
      <header className="hud">
        <div className="hud-tiempo">
          <button className="btn-menu" onClick={togglePausaMenu}>☰</button>
          <span className="hud-fecha">{fechaTexto(game)}</span>
          <div className="hud-velocidades">
            {VELOCIDADES.map(({ v, etiqueta }) => (
              <button
                key={v}
                className={game.velocidad === v ? 'vel activa' : 'vel'}
                onClick={() => setVelocidad(v)}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        </div>

        <div className="hud-indicadores">
          {INDICADORES.map((ind) => (
            <button
              key={ind.campo}
              className={ind.campo === 'salario' ? 'indicador destacado' : 'indicador'}
              onClick={() => setGrafico(grafico === ind.campo ? null : ind.campo)}
            >
              <span className="ind-nombre">{ind.nombre}</span>
              <span className="ind-valor">{ind.valor(game)}</span>
            </button>
          ))}
        </div>

        {hito && (
          <div className="hud-hito">
            Próximo hito: <strong>{hito.nombre}</strong> — salario {fmtUsd(hito.salario)}
          </div>
        )}
      </header>

      {indicadorAbierto && (
        <div className="modal-grafico" onClick={() => setGrafico(null)}>
          <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
            <div className="panel-cabecera">
              <h2>{indicadorAbierto.nombre}</h2>
              <button className="panel-cerrar" onClick={() => setGrafico(null)}>✕</button>
            </div>
            <Grafico
              historia={game.historia}
              campo={indicadorAbierto.campo}
              formato={indicadorAbierto.formato}
              color={indicadorAbierto.color}
            />
          </div>
        </div>
      )}
    </>
  )
}
