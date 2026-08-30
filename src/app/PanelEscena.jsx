// Scene editor panel: pin the sun/moon anywhere on their orbit with a
// slider, and move the desk lamp. Everything persists (localStorage).
import { useGameStore } from '../store/gameStore.js'
import { fracVisual } from '../maquetas/a/Sol.jsx'

export function PanelEscena() {
  const abierto = useGameStore((s) => s.panelEscena)
  const escena = useGameStore((s) => s.escena)
  const setEscena = useGameStore((s) => s.setEscena)
  const togglePanelEscena = useGameStore((s) => s.togglePanelEscena)
  const game = useGameStore((s) => s.game)

  if (!abierto || !game) return null

  const solFijo = escena.solFijo != null
  const fracActual = escena.solFijo ?? fracVisual.valor

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

      <div className="escena-modo">
        <span>🌅 Órbita del sol y la luna</span>
        <div className="escena-segmentos">
          {[
            [true, 'Mundo'],
            [false, 'Escritorio'],
          ].map(([valor, texto]) => (
            <button
              key={texto}
              className={(escena.orbitaMundo ?? true) === valor ? 'seg activo' : 'seg'}
              onClick={() => setEscena({ orbitaMundo: valor })}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>

      <div className="escena-modo">
        <span>🔆 Luz del cuarto</span>
        <div className="escena-segmentos">
          {[
            [true, 'Encendida'],
            [false, 'Apagada'],
          ].map(([valor, texto]) => (
            <button
              key={texto}
              className={(escena.luzCuarto?.encendida ?? false) === valor ? 'seg activo' : 'seg'}
              onClick={() => setEscena({ luzCuarto: { encendida: valor } })}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>
      <Deslizador
        etiqueta="🔆 Cuarto — intensidad"
        valor={escena.luzCuarto?.intensidad ?? 1500}
        min={200}
        max={4000}
        paso={50}
        onCambio={(v) => setEscena({ luzCuarto: { intensidad: v } })}
      />

      <div className="escena-modo">
        <span>🕯️ Luces colocadas</span>
        <div className="escena-segmentos">
          {[
            [true, 'Encendidas'],
            [false, 'Apagadas'],
          ].map(([valor, texto]) => (
            <button
              key={texto}
              className={
                (escena.lucesColocadas?.encendidas ?? true) === valor ? 'seg activo' : 'seg'
              }
              onClick={() => setEscena({ lucesColocadas: { encendidas: valor } })}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>
      <Deslizador
        etiqueta="🕯️ Colocadas — intensidad"
        valor={escena.lucesColocadas?.intensidad ?? 1}
        min={0.2}
        max={1.5}
        paso={0.05}
        onCambio={(v) => setEscena({ lucesColocadas: { intensidad: v } })}
      />

      <div className="escena-modo">
        <span>💡 Luz de la lámpara</span>
        <div className="escena-segmentos">
          {[
            ['auto', 'Auto'],
            ['on', 'Encendida'],
            ['off', 'Apagada'],
          ].map(([valor, texto]) => (
            <button
              key={valor}
              className={(escena.lampara.modo ?? 'auto') === valor ? 'seg activo' : 'seg'}
              onClick={() => setEscena({ lampara: { modo: valor } })}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>

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
      <Deslizador
        etiqueta="💡 Lámpara — tamaño"
        valor={escena.lampara.escala ?? 1}
        min={0.4}
        max={2.5}
        paso={0.05}
        onCambio={(v) => setEscena({ lampara: { escala: v } })}
      />
      <Deslizador
        etiqueta="💡 Lámpara — intensidad"
        valor={escena.lampara.intensidad ?? 220}
        min={0}
        max={600}
        paso={10}
        onCambio={(v) => setEscena({ lampara: { intensidad: v } })}
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
