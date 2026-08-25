// Maqueta C: "Sala de datos" — no big 3D: the country as pure numbers.
// Evolution charts for every indicator + places list to open measures.
// Same engine and panels as the other maquetas.
import { useGameStore } from '../../store/gameStore.js'
import { salarioReal, pibPerCapita } from '../../core/state.js'
import { LUGARES } from '../../data/lugares.js'
import { medidasDeLugar } from '../../data/medidas.js'
import { estadoMedida } from '../../core/medidas.js'
import { Grafico } from '../../app/Grafico.jsx'

const fmtUsd = (n) => '$' + n.toLocaleString('es-VE', { maximumFractionDigits: 0 })

const PANELES = [
  { campo: 'salario', nombre: 'Salario real', color: '#3fb56b', formato: fmtUsd },
  { campo: 'pibPc', nombre: 'PIB per cápita', color: '#f5c518', formato: fmtUsd },
  { campo: 'inflacion', nombre: 'Inflación', color: '#e06456', formato: (v) => (v * 100).toFixed(0) + '%' },
  { campo: 'poblacion', nombre: 'Población', color: '#7aa7e0', formato: (v) => v.toFixed(1) + 'M' },
  { campo: 'capitalHumano', nombre: 'Capital humano', color: '#b58fd6', formato: (v) => v.toFixed(0) },
  { campo: 'caja', nombre: 'Caja', color: '#8fa3b8', formato: (v) => fmtUsd(v) + 'M' },
]

export function MaquetaC() {
  const game = useGameStore((s) => s.game)
  const seleccionarLugar = useGameStore((s) => s.seleccionarLugar)
  if (!game) return null

  return (
    <div className="sala-datos">
      <div className="datos-graficos">
        {PANELES.map((p) => (
          <div key={p.campo} className="datos-panel">
            <span className="ind-nombre">{p.nombre}</span>
            <Grafico historia={game.historia} campo={p.campo} formato={p.formato} color={p.color} />
          </div>
        ))}
      </div>

      <div className="datos-lugares">
        {LUGARES.filter(
          (l) => !l.requiereEvento || (game.eventosVistos ?? {})[l.requiereEvento],
        ).map((lugar) => {
          const medidas = medidasDeLugar(lugar.id)
          const activas = medidas.filter((m) => game.medidas[m.id]).length
          const plenas = medidas.filter(
            (m) => estadoMedida(m, game.medidas[m.id], game.dias).fase === 'pleno',
          ).length
          return (
            <button
              key={lugar.id}
              className="datos-lugar"
              onClick={() => seleccionarLugar(lugar.id)}
            >
              <strong>{lugar.nombre}</strong>
              <span>
                {plenas}/{medidas.length} plenas{activas > plenas ? ` · ${activas - plenas} en marcha` : ''}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
