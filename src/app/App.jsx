// App shell: routes between welcome screen, the world editor (?editor)
// and the running game. The active maqueta comes from the registry.
import { useEffect } from 'react'
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
import { PiedraModal } from './PiedraModal.jsx'

const esEditor = new URLSearchParams(window.location.search).has('editor')
const esTactil = 'ontouchstart' in window

export function App() {
  // iOS ignores user-scalable=no since iOS 10: the ONLY reliable way to
  // kill page pinch-zoom is preventDefault on Safari's proprietary
  // gesture events + multi-touch touchmove. This does NOT break the map
  // camera: MapControls still reads touches from the canvas — we only
  // forbid Safari from zooming the PAGE. (In POV nobody consumed the
  // pinch, so Safari grabbed it and broke the controls.)
  useEffect(() => {
    const antiGesto = (e) => e.preventDefault()
    const antiPinch = (e) => {
      if (e.touches.length > 1) e.preventDefault()
    }
    document.addEventListener('gesturestart', antiGesto)
    document.addEventListener('gesturechange', antiGesto)
    document.addEventListener('gestureend', antiGesto)
    document.addEventListener('touchmove', antiPinch, { passive: false })
    return () => {
      document.removeEventListener('gesturestart', antiGesto)
      document.removeEventListener('gesturechange', antiGesto)
      document.removeEventListener('gestureend', antiGesto)
      document.removeEventListener('touchmove', antiPinch)
    }
  }, [])

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
  const menuLuces = useGameStore((s) => s.menuLuces)
  const toggleMenuLuces = useGameStore((s) => s.toggleMenuLuces)
  const elegirLuz = useGameStore((s) => s.elegirLuz)
  const quitarLuces = useGameStore((s) => s.quitarLuces)
  const colocandoLuz = useGameStore((s) => s.colocandoLuz)
  const quest = useGameStore((s) => s.quest)
  const { tieneLlave, tieneTarjeta, puertaDesbloqueada } = quest

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
                <button
                  className={
                    menuLuces || colocandoLuz
                      ? 'btn-flotante sexto activo'
                      : 'btn-flotante sexto'
                  }
                  onClick={toggleMenuLuces}
                  title="Agregar fuentes de luz"
                >
                  🕯️
                </button>
                {menuLuces && (
                  <div className="menu-luces">
                    <button onClick={() => elegirLuz('pie')}>🪔 Lámpara de pie</button>
                    <button onClick={() => elegirLuz('aplique')}>💡 Aplique de pared</button>
                    <button onClick={() => elegirLuz('antorcha')}>🔥 Antorcha</button>
                    <button onClick={() => elegirLuz('borrar')}>🗑️ Quitar una</button>
                    <button className="menu-luces-borrar" onClick={quitarLuces}>
                      🧹 Quitar todas
                    </button>
                  </div>
                )}
                {colocandoLuz && (
                  <div className="hint-camara">
                    {colocandoLuz === 'borrar'
                      ? 'Tocá la luz que querés quitar'
                      : `Click donde quieras colocarla · ${
                          colocandoLuz === 'pie'
                            ? 'va en el piso'
                            : colocandoLuz === 'aplique'
                              ? 'va en paredes'
                              : 'va en pared o piso'
                        } · click derecho sobre una luz la quita`}
                  </div>
                )}
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
                {esTactil
                  ? 'Pad izquierdo ✥ camina · pad derecho ⟳ gira (mantené e incliná) · tocá puertas, cofres y el mapa'
                  : 'Arrastrá para mirar · WASD o flechas caminar · SHIFT correr · E abre la puerta (cerca) · E o click en el mapa: gobernar'}
              </div>
            )}
            {camaraPov && esTactil && <div className="joystick-guia">✥</div>}
            {camaraPov && esTactil && <div className="joystick-guia derecha">⟳</div>}
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
      <MenuPausa />
      <Victoria />
      <EventoModal />
      <LibroModal />
      <PiedraModal />
    </div>
  )
}
