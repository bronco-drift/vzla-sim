// Zustand store: THE single source of truth. The engine writes here,
// every maqueta and UI panel only reads from here and calls actions.
import { create } from 'zustand'
import { createInitialState } from '../core/state.js'
import { tick } from '../core/sim.js'
import { HITOS } from '../core/hitos.js'
import { medidaPorId } from '../data/medidas.js'
import { estadoMedida, requisitosCumplidos } from '../core/medidas.js'
import { EVENTOS } from '../data/eventos.js'

// Real-time loop: every TICK_MS we advance velocidad * DIAS_POR_TICK_X1
// sim-days. At x1 that is 30 simulated days per second (~12s per year).
const TICK_MS = 100
const DIAS_POR_TICK_X1 = 3
const TICKS_POR_AUTOSAVE = 50 // every ~5 real seconds

const CLAVE_PARTIDA = 'vzla-sim.partida'
const CLAVE_ESCENA = 'vzla-sim.escena'

// Scene preferences (desk lamp position, pinned sun) — visual tuning,
// persisted separately from the save so it survives new games.
const ESCENA_DEFAULT = {
  solFijo: null, // null = sun follows game time; 0..1 = pinned orbit position
  lampara: { x: 52, z: -28, rot: -0.8, intensidad: 220, escala: 1 },
}

function cargarEscena() {
  try {
    const crudo = localStorage.getItem(CLAVE_ESCENA)
    if (!crudo) return ESCENA_DEFAULT
    const guardada = JSON.parse(crudo)
    return { ...ESCENA_DEFAULT, ...guardada, lampara: { ...ESCENA_DEFAULT.lampara, ...guardada.lampara } }
  } catch {
    return ESCENA_DEFAULT
  }
}

let intervalo = null
let contadorAutosave = 0
let proximoToastId = 1

export const useGameStore = create((set, get) => ({
  pantalla: 'bienvenida', // 'bienvenida' | 'partida'
  game: null,             // GameState while playing
  lugarSeleccionado: null, // id from data/lugares.js, or null
  toasts: [],             // [{ id, texto }]
  menuPausa: false,
  mundoGlobal: false,     // view pref: show the whole world around Venezuela
  eventoActivo: null,     // event being shown in a modal (pauses the sim)
  escena: cargarEscena(), // desk-scene tuning (lamp position, pinned sun)
  panelEscena: false,     // scene-editing panel open?

  nuevaPartida(nivel) {
    set({ pantalla: 'partida', game: createInitialState(nivel), lugarSeleccionado: null, menuPausa: false })
    iniciarLoop(set, get)
  },

  continuarPartida() {
    const game = cargarPartida()
    if (!game) return
    set({ pantalla: 'partida', game, lugarSeleccionado: null, menuPausa: false })
    iniciarLoop(set, get)
  },

  setVelocidad(v) {
    const { game } = get()
    if (game) set({ game: { ...game, velocidad: v } })
  },

  seleccionarLugar(id) {
    set({ lugarSeleccionado: id })
  },

  /** Pay and start a measure. Returns an error string or null on success. */
  iniciarMedida(id) {
    const { game } = get()
    const medida = medidaPorId(id)
    if (!game || !medida || game.medidas[id]) return 'no disponible'
    if (!requisitosCumplidos(medida, game)) return 'requisitos incompletos'
    if (game.caja < medida.costo) return 'caja insuficiente'
    set({
      game: {
        ...game,
        caja: game.caja - medida.costo,
        medidas: { ...game.medidas, [id]: { inicio: game.dias } },
      },
    })
    agregarToast(set, get, `🏗️ Obra iniciada: ${medida.nombre}`)
    return null
  },

  togglePausaMenu() {
    set((s) => ({ menuPausa: !s.menuPausa }))
  },

  guardarAhora() {
    const { game } = get()
    if (game) guardarPartida(game)
  },

  salirAlMenu() {
    const { game } = get()
    if (game) guardarPartida(game)
    detenerLoop()
    set({ pantalla: 'bienvenida', game: null, lugarSeleccionado: null, menuPausa: false })
  },

  quitarToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },

  marcarVictoriaVista() {
    const { game } = get()
    if (game) set({ game: { ...game, victoriaVista: true } })
  },

  toggleMundoGlobal() {
    set((s) => ({ mundoGlobal: !s.mundoGlobal }))
  },

  togglePanelEscena() {
    set((s) => ({ panelEscena: !s.panelEscena }))
  },

  /** Merge scene tuning (lamp/sun) and persist it. */
  setEscena(cambios) {
    const escena = {
      ...get().escena,
      ...cambios,
      lampara: { ...get().escena.lampara, ...(cambios.lampara ?? {}) },
    }
    localStorage.setItem(CLAVE_ESCENA, JSON.stringify(escena))
    set({ escena })
  },

  cerrarEvento() {
    const { game, eventoActivo } = get()
    if (!game || !eventoActivo) return
    set({
      eventoActivo: null,
      game: {
        ...game,
        eventosVistos: { ...(game.eventosVistos ?? {}), [eventoActivo.id]: game.dias },
      },
    })
  },
}))

function iniciarLoop(set, get) {
  detenerLoop()
  intervalo = setInterval(() => {
    const { game, menuPausa, eventoActivo } = get()
    if (!game || game.velocidad === 0 || menuPausa || eventoActivo) return

    const previo = game
    const nuevo = tick(game, game.velocidad * DIAS_POR_TICK_X1)
    set({ game: nuevo })

    notificarCambios(set, get, previo, nuevo)

    if (++contadorAutosave >= TICKS_POR_AUTOSAVE) {
      contadorAutosave = 0
      guardarPartida(nuevo)
    }
  }, TICK_MS)
}

function detenerLoop() {
  if (intervalo) clearInterval(intervalo)
  intervalo = null
}

/** Detect milestone and measure-completion transitions -> toasts/events. */
function notificarCambios(set, get, previo, nuevo) {
  if (nuevo.hitoActual > previo.hitoActual) {
    const hito = HITOS[nuevo.hitoActual]
    agregarToast(set, get, `🏆 Hito alcanzado: ${hito.nombre} (${hito.referencia})`)
  }

  // One-time story events unlocked by milestone
  for (const evento of EVENTOS) {
    if (!(nuevo.eventosVistos ?? {})[evento.id] && nuevo.hitoActual >= evento.requiereHito) {
      set({ eventoActivo: evento })
      break // one modal at a time
    }
  }
  for (const id of Object.keys(nuevo.medidas)) {
    const medida = medidaPorId(id)
    if (!medida) continue
    const antes = estadoMedida(medida, previo.medidas[id], previo.dias).fase
    const ahora = estadoMedida(medida, nuevo.medidas[id], nuevo.dias).fase
    if (antes !== 'pleno' && ahora === 'pleno') {
      agregarToast(set, get, `✅ ${medida.nombre}: efecto pleno`)
    } else if (antes === 'obra' && ahora !== 'obra') {
      agregarToast(set, get, `🔔 Obra terminada: ${medida.nombre}`)
    }
  }
}

function agregarToast(set, get, texto) {
  const id = proximoToastId++
  set((s) => ({ toasts: [...s.toasts.slice(-3), { id, texto }] }))
}

// ---- Save / load ----

function guardarPartida(game) {
  localStorage.setItem(CLAVE_PARTIDA, JSON.stringify({ v: game.schemaVersion, game }))
}

function cargarPartida() {
  try {
    const crudo = localStorage.getItem(CLAVE_PARTIDA)
    if (!crudo) return null
    let { v, game } = JSON.parse(crudo)
    // v2 -> v3 migration: scorecard fields added
    if (v === 2) {
      game.schemaVersion = 3
      game.hitosAlcanzados = {}
      game.victoriaVista = false
      v = 3
    }
    if (v !== createInitialState().schemaVersion) return null // unknown schema: start fresh
    return game
  } catch {
    return null
  }
}

export function hayPartidaGuardada() {
  return cargarPartida() != null
}

// Dev-only handle for debugging from the browser console
if (import.meta.env.DEV) window.__vzlaStore = useGameStore
