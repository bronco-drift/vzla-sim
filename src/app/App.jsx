// App shell: routes between welcome screen, the world editor (?editor)
// and the running game. The active maqueta comes from the registry.
import { useGameStore } from '../store/gameStore.js'
import { Bienvenida } from './Bienvenida.jsx'
import { Hud } from './Hud.jsx'
import { PanelCiudad } from './PanelCiudad.jsx'
import { MAQUETAS, maquetaActiva } from '../maquetas/index.js'
import { Editor } from '../editor/Editor.jsx'
import { Toasts } from './Toasts.jsx'
import { MenuPausa } from './MenuPausa.jsx'
import { Victoria } from './Victoria.jsx'
import { EventoModal } from './EventoModal.jsx'
import { PanelEscena } from './PanelEscena.jsx'

const esEditor = new URLSearchParams(window.location.search).has('editor')

export function App() {
  const pantalla = useGameStore((s) => s.pantalla)
  const mundoGlobal = useGameStore((s) => s.mundoGlobal)
  const toggleMundoGlobal = useGameStore((s) => s.toggleMundoGlobal)

  const togglePanelEscena = useGameStore((s) => s.togglePanelEscena)
  const panelEscena = useGameStore((s) => s.panelEscena)

  if (esEditor) return <Editor />
  if (pantalla === 'bienvenida') return <Bienvenida />

  const idMaqueta = maquetaActiva()
  const Maqueta = MAQUETAS[idMaqueta].Componente
  return (
    <div className="partida">
      <Hud />
      <div className="escena">
        <Maqueta />
        <PanelCiudad />
        <Toasts />
        {/* View toggles: only meaningful on the 3D maquetas */}
        {idMaqueta !== 'c' && (
          <>
            <button
              className={mundoGlobal ? 'btn-flotante activo' : 'btn-flotante'}
              onClick={toggleMundoGlobal}
              title="Ver el mundo completo"
            >
              🌎
            </button>
            <button
              className={panelEscena ? 'btn-flotante segundo activo' : 'btn-flotante segundo'}
              onClick={togglePanelEscena}
              title="Editar la escena (sol, luna, lámpara)"
            >
              💡
            </button>
            <PanelEscena />
          </>
        )}
      </div>
      <MenuPausa />
      <Victoria />
      <EventoModal />
    </div>
  )
}
