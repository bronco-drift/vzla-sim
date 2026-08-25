// Hand-made SVG line chart — no chart library, theme-aware, tiny.
import { START_YEAR } from '../core/state.js'

export function Grafico({ historia, campo, formato = (v) => v.toFixed(0), color = '#f5c518' }) {
  if (!historia || historia.length < 2) {
    return <p className="grafico-vacio">Todavía no hay historia — dejá correr el tiempo.</p>
  }

  const ancho = 320
  const alto = 120
  const margen = 6

  const valores = historia.map((h) => h[campo])
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const rango = max - min || 1

  const puntos = historia
    .map((h, i) => {
      const x = margen + (i / (historia.length - 1)) * (ancho - margen * 2)
      const y = alto - margen - ((h[campo] - min) / rango) * (alto - margen * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const ultimo = historia[historia.length - 1]
  const anioInicio = START_YEAR + Math.floor(historia[0].dias / 365)
  const anioFin = START_YEAR + Math.floor(ultimo.dias / 365)

  return (
    <div className="grafico">
      <svg viewBox={`0 0 ${ancho} ${alto}`} preserveAspectRatio="none">
        <polyline points={puntos} fill="none" stroke={color} strokeWidth="2" />
      </svg>
      <div className="grafico-pie">
        <span>{anioInicio}</span>
        <strong style={{ color }}>{formato(ultimo[campo])}</strong>
        <span>{anioFin}</span>
      </div>
    </div>
  )
}
