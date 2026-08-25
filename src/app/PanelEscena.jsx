// Scene editor panel: pin the sun/moon anywhere on their orbit with a
// slider, and move the desk lamp. Everything persists (localStorage).
import { useGameStore } from '../store/gameStore.js'

export function PanelEscena() {
  const abierto = useGameStore((s) => s.panelEscena)
  const escena = useGameStore((s) => s.escena)
  const setEscena = useGameStore((s) => s.setEscena)
  const togglePanelEscena = useGameStore((s) => s.togglePanelEscena)
  const game = useGameStore((s) => s.game)

  if (!abierto || !game) return null

  const solFijo = escena.solFijo != null
  const fracActual = escena.solFijo ?? (game.dias % 365) / 365

  return (
    <aside className="panel-escena">
      <div className="panel-cabecera">
        <h2>Escena</h2>
        <button className="panel-cerrar" onClick={togglePanelEscena}>✕</button>
      </div>

      <label className="escena-check">
        <input
          type="checkbox"
          checked={solFijo}
          onChange={(e) =>
            setEscena({ solFijo: e.target.checked ? fracActual : null })
          }
        />
        Fijar sol y luna (no siguen al juego)
      </label>

      <Deslizador
        etiqueta="☀️ Posición en la órbita"
        valor={fracActual}
        min={0}
        max={1}
        paso={0.005}
        deshabilitado={!solFijo}
        onCambio={(v) => setEscena({ solFijo: v })}
      />

      <Deslizador
        etiqueta="💡 Lámpara — X"
        valor={escena.lampara.x}
        min={-90}
        max={90}
        paso={1}
        onCambio={(v) => setEscena({ lampara: { x: v } })}
      />
      <Deslizador
        etiqueta="💡 Lámpara — Z"
        valor={escena.lampara.z}
        min={-70}
        max={70}
        paso={1}
        onCambio={(v) => setEscena({ lampara: { z: v } })}
      />
      <Deslizador
        etiqueta="💡 Lámpara — giro"
        valor={escena.lampara.rot}
        min={-3.14}
        max={3.14}
        paso={0.05}
        onCambio={(v) => setEscena({ lampara: { rot: v } })}
      />
    </aside>
  )
}

function Deslizador({ etiqueta, valor, min, max, paso, deshabilitado = false, onCambio }) {
  return (
    <label className={deshabilitado ? 'escena-slider off' : 'escena-slider'}>
      <span>{etiqueta}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        disabled={deshabilitado}
        onChange={(e) => onCambio(parseFloat(e.target.value))}
      />
    </label>
  )
}
