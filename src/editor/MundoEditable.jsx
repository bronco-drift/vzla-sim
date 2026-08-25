// Editable world inside the editor canvas: terrain (click to place),
// placed objects (click to select), and a translate gizmo on selection.
import { useEffect, useState, useMemo, useRef } from 'react'
import { TransformControls } from '@react-three/drei'
import { bboxDeGeojson, crearProyeccion } from '../mundo/proyeccion.js'
import { Terreno, GROSOR_TERRENO } from '../maquetas/a/Terreno.jsx'
import { Lugares } from '../maquetas/a/Lugares.jsx'
import { ObjetoMesh } from '../mundo/ObjetoMesh.jsx'
import { useEditorStore } from '../store/editorStore.js'

export function MundoEditable() {
  const [geojson, setGeojson] = useState(null)
  const mundo = useEditorStore((s) => s.mundo)
  const seleccionado = useEditorStore((s) => s.seleccionado)
  const tipoAColocar = useEditorStore((s) => s.tipoAColocar)
  const colocarEn = useEditorStore((s) => s.colocarEn)
  const seleccionar = useEditorStore((s) => s.seleccionar)
  const actualizarObjeto = useEditorStore((s) => s.actualizarObjeto)
  const gizmoRef = useRef()

  useEffect(() => {
    fetch('/data/venezuela-adm0.geojson')
      .then((r) => r.json())
      .then(setGeojson)
      .catch((err) => console.error('No se pudo cargar el mapa:', err))
  }, [])

  const proyeccion = useMemo(
    () => (geojson ? crearProyeccion(bboxDeGeojson(geojson)) : null),
    [geojson],
  )

  if (!geojson || !proyeccion || !mundo) return null

  const objetoSel = mundo.objetos.find((o) => o.id === seleccionado)

  return (
    <group>
      <Terreno
        geojson={geojson}
        proyeccion={proyeccion}
        onClickSuelo={(punto) => {
          if (tipoAColocar) colocarEn(+punto.x.toFixed(2), +punto.z.toFixed(2))
          else seleccionar(null)
        }}
      />
      <Lugares proyeccion={proyeccion} />

      {mundo.objetos.map((o) =>
        o.id === seleccionado ? null : (
          <ObjetoMesh
            key={o.id}
            objeto={o}
            onClick={(e) => {
              e.stopPropagation()
              seleccionar(o.id)
            }}
          />
        ),
      )}

      {/* Selected object rides inside the translate gizmo. The store is
          written only on mouse-up: writing every frame fights the drag. */}
      {objetoSel && (
        <TransformControls
          key={objetoSel.id}
          ref={gizmoRef}
          mode="translate"
          showY={false}
          position={[objetoSel.x, 0, objetoSel.z]}
          onMouseUp={() => {
            const p = gizmoRef.current?.object?.position
            if (p) actualizarObjeto(objetoSel.id, { x: +p.x.toFixed(2), z: +p.z.toFixed(2) })
          }}
        >
          <ObjetoMesh
            objeto={{ ...objetoSel, x: 0, z: 0 }}
            seleccionado
            onClick={(e) => e.stopPropagation()}
          />
        </TransformControls>
      )}
    </group>
  )
}
