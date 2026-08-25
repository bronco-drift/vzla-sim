// Place panel: side panel on desktop, bottom sheet on mobile (via CSS).
// Lists the place's measures with cost, duration, stage and progress.
import { useState } from 'react'
import { useGameStore } from '../store/gameStore.js'
import { lugarPorId } from '../data/lugares.js'
import { medidasDeLugar, medidaPorId } from '../data/medidas.js'
import { estadoMedida, requisitosCumplidos } from '../core/medidas.js'

const fmtM = (n) => '$' + n.toLocaleString('es-VE') + 'M'

const ETIQUETA_FASE = {
  obra: 'En obra',
  rampa: 'En rampa',
  pleno: 'Efecto pleno',
}

export function PanelCiudad() {
  const id = useGameStore((s) => s.lugarSeleccionado)
  const seleccionarLugar = useGameStore((s) => s.seleccionarLugar)
  const lugar = lugarPorId(id)

  if (!lugar) return null

  return (
    <aside className="panel-ciudad">
      <div className="panel-cabecera">
        <div>
          <span className="panel-tipo">{lugar.tipo === 'ciudad' ? 'Ciudad' : 'Sitio clave'}</span>
          <h2>{lugar.nombre}</h2>
        </div>
        <button className="panel-cerrar" onClick={() => seleccionarLugar(null)}>
          ✕
        </button>
      </div>
      <p className="panel-descripcion">{lugar.descripcion}</p>
      <div className="panel-medidas">
        {medidasDeLugar(lugar.id).map((m) => (
          <Medida key={m.id} medida={m} />
        ))}
      </div>
    </aside>
  )
}

function Medida({ medida }) {
  const game = useGameStore((s) => s.game)
  const iniciarMedida = useGameStore((s) => s.iniciarMedida)
  const [error, setError] = useState(null)

  const registro = game.medidas[medida.id]
  const { fase, progreso } = estadoMedida(medida, registro, game.dias)
  const desbloqueada = requisitosCumplidos(medida, game)
  const alcanza = game.caja >= medida.costo

  const faltantes = (medida.requiere ?? []).filter(
    (reqId) => estadoMedida(medidaPorId(reqId), game.medidas[reqId], game.dias).fase !== 'pleno',
  )

  return (
    <div className={`medida ${fase}`}>
      <div className="medida-fila">
        <strong>{medida.nombre}</strong>
        {fase !== 'disponible' && (
          <span className={`chip ${fase}`}>
            {ETIQUETA_FASE[fase]}
            {fase !== 'pleno' && ` ${Math.round(progreso * 100)}%`}
          </span>
        )}
      </div>
      <p className="medida-desc">{medida.descripcion}</p>

      {fase === 'disponible' && (
        <>
          <div className="medida-datos">
            <span>{fmtM(medida.costo)}</span>
            <span>· obra {medida.obra} {medida.obra === 1 ? 'año' : 'años'}</span>
            <span>· pleno en {medida.obra + medida.rampa}</span>
          </div>
          {desbloqueada ? (
            <button
              className="btn-medida"
              disabled={!alcanza}
              onClick={() => setError(iniciarMedida(medida.id))}
            >
              {alcanza ? 'Iniciar' : 'Caja insuficiente'}
            </button>
          ) : (
            <p className="medida-bloqueo">
              🔒 Requiere:{' '}
              {[
                ...faltantes.map((r) => medidaPorId(r).nombre),
                ...(medida.requiereHito != null && game.hitoActual < medida.requiereHito
                  ? [`Hito ${medida.requiereHito + 1}`]
                  : []),
              ].join(', ')}
            </p>
          )}
          {error && <p className="medida-error">{error}</p>}
        </>
      )}

      {(fase === 'obra' || fase === 'rampa') && (
        <div className="barra">
          <div className="barra-relleno" style={{ width: `${progreso * 100}%` }} />
        </div>
      )}
    </div>
  )
}
