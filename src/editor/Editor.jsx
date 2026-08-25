// World editor: sister view of the maquetas, sharing the same terrain
// and object meshes. Place objects from the palette, move them with the
// gizmo, tweak with leva, delete with Supr, export mundo.json.
import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { useControls, button } from 'leva'
import { useEditorStore } from '../store/editorStore.js'
import { MundoEditable } from './MundoEditable.jsx'
import { TIPOS_OBJETO, IDS_TIPOS } from '../data/objetos.js'

export function Editor() {
  const cargar = useEditorStore((s) => s.cargar)
  const mundo = useEditorStore((s) => s.mundo)
  const borrarSeleccionado = useEditorStore((s) => s.borrarSeleccionado)

  useEffect(() => {
    cargar()
  }, [cargar])

  // Supr/Delete removes the selected object
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') borrarSeleccionado()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [borrarSeleccionado])

  if (!mundo) return <div className="editor-cargando">Cargando mundo…</div>

  return (
    <div className="editor">
      <PanelObjeto />
      <Canvas camera={{ position: [0, 34, 26], fov: 45 }} shadows="soft">
        <color attach="background" args={['#101722']} />
        {/* Fixed daylight — the editor has no simulation running */}
        <ambientLight intensity={0.75} />
        <directionalLight position={[30, 40, 15]} intensity={1.6} castShadow
          shadow-mapSize={[2048, 2048]} shadow-bias={-0.0002}
          shadow-camera-left={-40} shadow-camera-right={40}
          shadow-camera-top={30} shadow-camera-bottom={-30} />
        <MundoEditable />
        <MapControls makeDefault target={[0, 0, -4]} maxPolarAngle={Math.PI / 2.4}
          minDistance={6} maxDistance={70} />
      </Canvas>
      <Paleta />
    </div>
  )
}

/** Bottom palette: pick a type to place, export, or go back to the game. */
function Paleta() {
  const tipoAColocar = useEditorStore((s) => s.tipoAColocar)
  const setTipoAColocar = useEditorStore((s) => s.setTipoAColocar)
  const exportar = useEditorStore((s) => s.exportar)

  return (
    <div className="editor-paleta">
      <span className="editor-titulo">Editor</span>
      {IDS_TIPOS.map((tipo) => (
        <button
          key={tipo}
          className={tipoAColocar === tipo ? 'paleta-btn activo' : 'paleta-btn'}
          onClick={() => setTipoAColocar(tipoAColocar === tipo ? null : tipo)}
        >
          {TIPOS_OBJETO[tipo].nombre}
        </button>
      ))}
      <span className="editor-ayuda">
        {tipoAColocar ? 'Click en el mapa para colocar' : 'Click en un objeto para editarlo'}
      </span>
      <button className="paleta-btn exportar" onClick={exportar}>
        Exportar mundo.json
      </button>
      <a className="paleta-btn volver" href="/">
        ← Juego
      </a>
    </div>
  )
}

/** leva panel bound to the selected object (rotation/scale; gizmo moves it). */
function PanelObjeto() {
  const seleccionado = useEditorStore((s) => s.seleccionado)
  const mundo = useEditorStore((s) => s.mundo)
  const actualizarObjeto = useEditorStore((s) => s.actualizarObjeto)
  const borrarSeleccionado = useEditorStore((s) => s.borrarSeleccionado)

  const objeto = mundo?.objetos.find((o) => o.id === seleccionado)

  useControls(
    'Objeto',
    () =>
      objeto
        ? {
            rotacion: {
              value: objeto.rotY ?? 0,
              min: 0,
              max: Math.PI * 2,
              step: 0.1,
              onChange: (v) => actualizarObjeto(objeto.id, { rotY: v }),
            },
            escala: {
              value: objeto.escala ?? 1,
              min: 0.3,
              max: 4,
              step: 0.1,
              onChange: (v) => actualizarObjeto(objeto.id, { escala: v }),
            },
            Borrar: button(() => borrarSeleccionado()),
          }
        : { info: { value: 'Nada seleccionado', editable: false } },
    [seleccionado],
  )

  return null
}
