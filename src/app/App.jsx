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
import { LibroModal } from './LibroModal.jsx'

const esEditor = new URLSearchParams(window.location.search).has('editor')

export function App() {
  const pantalla = useGameStore((s) => s.pantalla)
  const mundoGlobal = useGameStore((s) => s.mundoGlobal)
  const toggleMundoGlobal = useGameStore((s) => s.toggleMundoGlobal)

  const togglePanelEscena = useGameStore((s) => s.togglePanelEscena)
  const panelEscena = useGameStore((s) => s.panelEscena)
  const pedirResetCamara = useGameStore((s) => s.pedirResetCamara)
  const camaraLibre = useGameStore((s) => s.camaraLibre)
  const toggleCamaraLibre = useGameStore((s) => s.toggleCamaraLibre)
  const camaraPov = useGameStore((s) => s.camaraPov)
  const toggleCamaraPov = useGameStore((s) => s.toggleCamaraPov)
  const quest = useGameStore((s) => s.quest)
  const { tieneLlave, tieneTarjeta, puertaDesbloqueada } = quest

  // Cryptic one-liner pointing at the quest's next step
  const pista = puertaDesbloqueada
    ? null
    : tieneTarjeta
      ? '«El ojo rojo junto a la puerta sabrá leerla.»'
      : quest.cofreAbierto
        ? '«Llévate lo que brilla dentro del arca.»'
        : quest.candadoAbierto
          ? '«Arriba, donde termina el pasillo, algo espera.»'
          : tieneLlave
            ? '«El bronce abre lo que el terciopelo custodia.»'
            : '«Las respuestas duermen entre páginas doradas.»'

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
            <button
              className="btn-flotante tercero"
              onClick={pedirResetCamara}
              title="Centrar el mapa"
            >
              🧭
            </button>
            {idMaqueta === 'a' && (
              <>
                <button
                  className={camaraLibre ? 'btn-flotante cuarto activo' : 'btn-flotante cuarto'}
                  onClick={toggleCamaraLibre}
                  title="Cámara libre: volar por la habitación"
                >
                  🎥
                </button>
                <button
                  className={camaraPov ? 'btn-flotante quinto activo' : 'btn-flotante quinto'}
                  onClick={toggleCamaraPov}
                  title="Caminar en primera persona (muñeco azul)"
                >
                  🚶
                </button>
              </>
            )}
            {camaraLibre && (
              <div className="hint-camara">
                Arrastrá para mirar · WASD o flechas para volar · ESPACIO sube · C baja ·
                SHIFT rápido
              </div>
            )}
            {camaraPov && (
              <div className="hint-camara">
                Arrastrá para mirar · WASD o flechas para caminar · SHIFT correr · E (cerca)
                o click abre la puerta
              </div>
            )}
            <PanelEscena />
          </>
        )}
      </div>
      {/* quest inventory chips + cryptic next-step hint */}
      {(tieneLlave || tieneTarjeta) && (
        <div className="inventario">
          {tieneLlave && <span title="Llave de bronce">🔑</span>}
          {tieneTarjeta && !puertaDesbloqueada && <span title="Tarjeta de acceso">💳</span>}
        </div>
      )}
      {idMaqueta !== 'c' && pista && <div className="pista-quest">✨ {pista}</div>}
      <MenuPausa />
      <Victoria />
      <EventoModal />
      <LibroModal />
    </div>
  )
}
