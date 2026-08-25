// Editor state: the world being edited. Every change auto-saves to
// localStorage so the game picks it up; "Exportar" downloads mundo.json
// to replace public/data/mundo.json permanently.
import { create } from 'zustand'
import { cargarMundo, guardarMundoLocal, exportarMundo } from '../mundo/cargarMundo.js'

let proximoId = 1

export const useEditorStore = create((set, get) => ({
  mundo: null,          // { version, objetos: [{id, tipo, x, z, rotY, escala}] }
  seleccionado: null,   // object id or null
  tipoAColocar: null,   // type id from data/objetos.js, or null = select mode

  async cargar() {
    const mundo = await cargarMundo()
    // Continue ids after the highest existing one
    proximoId = Math.max(0, ...mundo.objetos.map((o) => o.id)) + 1
    set({ mundo })
  },

  setTipoAColocar(tipo) {
    set({ tipoAColocar: tipo, seleccionado: null })
  },

  colocarEn(x, z) {
    const { mundo, tipoAColocar } = get()
    if (!mundo || !tipoAColocar) return
    const objeto = { id: proximoId++, tipo: tipoAColocar, x, z, rotY: 0, escala: 1 }
    const nuevo = { ...mundo, objetos: [...mundo.objetos, objeto] }
    guardarMundoLocal(nuevo)
    set({ mundo: nuevo, seleccionado: objeto.id })
  },

  seleccionar(id) {
    set({ seleccionado: id, tipoAColocar: null })
  },

  actualizarObjeto(id, cambios) {
    const { mundo } = get()
    const nuevo = {
      ...mundo,
      objetos: mundo.objetos.map((o) => (o.id === id ? { ...o, ...cambios } : o)),
    }
    guardarMundoLocal(nuevo)
    set({ mundo: nuevo })
  },

  borrarSeleccionado() {
    const { mundo, seleccionado } = get()
    if (seleccionado == null) return
    const nuevo = { ...mundo, objetos: mundo.objetos.filter((o) => o.id !== seleccionado) }
    guardarMundoLocal(nuevo)
    set({ mundo: nuevo, seleccionado: null })
  },

  exportar() {
    const { mundo } = get()
    if (mundo) exportarMundo(mundo)
  },
}))
