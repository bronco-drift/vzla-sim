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

const esEditor = new URLSearchParams(window.location.search).has('editor')

export function App() {
  const pantalla = useGameStore((s) => s.pantalla)

  if (esEditor) return <Editor />
  if (pantalla === 'bienvenida') return <Bienvenida />

  const Maqueta = MAQUETAS[maquetaActiva()].Componente
  return (
    <div className="partida">
      <Hud />
      <div className="escena">
        <Maqueta />
        <PanelCiudad />
        <Toasts />
      </div>
      <MenuPausa />
      <Victoria />
    </div>
  )
}
