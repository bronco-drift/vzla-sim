// Zustand store: THE single source of truth. The engine writes here,
// every maqueta and UI panel only reads from here and calls actions.
import { create } from 'zustand'
import { createInitialState, pibPerCapita } from '../core/state.js'
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
const CLAVE_QUEST = 'vzla-sim.quest'

// Scene preferences (desk lamp position, pinned sun) — visual tuning,
// persisted separately from the save so it survives new games.
// Factory light layout = Marcel's hand-placed arrangement (2026-08-30):
// torches flanking the west door and east wall, sconces over the north
// windows and by the south stairs, a floor lamp in the west corner, and
// two path torches out on the lawn.
const LUCES_DEFAULT = [
  { tipo: 'antorcha', superficie: 'pared', x: -700, y: 191, z: 73, nx: -1, nz: 0 },
  { tipo: 'antorcha', superficie: 'pared', x: -700, y: 184, z: 561, nx: -1, nz: 0 },
  { tipo: 'aplique', superficie: 'pared', x: 349, y: 258, z: -86, nx: 0, nz: -1 },
  { tipo: 'aplique', superficie: 'pared', x: -1, y: 241, z: -86, nx: 0, nz: -1 },
  { tipo: 'aplique', superficie: 'pared', x: -354, y: 251, z: -86, nx: 0, nz: -1 },
  { tipo: 'antorcha', superficie: 'pared', x: 700, y: 186, z: 537, nx: 1, nz: 0 },
  { tipo: 'antorcha', superficie: 'pared', x: 700, y: 177, z: 73, nx: 1, nz: 0 },
  { tipo: 'antorcha', superficie: 'piso', x: -63, y: -80, z: 2203, nx: 0, nz: 0 },
  { tipo: 'antorcha', superficie: 'piso', x: 799, y: -80, z: 2236, nx: 0, nz: 0 },
  { tipo: 'pie', superficie: 'piso', x: -680, y: -80, z: -24, nx: 0, nz: 0 },
  { tipo: 'antorcha', superficie: 'pared', x: -497, y: 124, z: 707, nx: 0, nz: -1 },
  { tipo: 'aplique', superficie: 'pared', x: 579, y: 206, z: 707, nx: 0, nz: -1 },
]

const ESCENA_DEFAULT = {
  solFijo: null, // null = sun follows game time; 0..1 = pinned orbit position
  lampara: { x: 52, z: -28, rot: -0.8, intensidad: 220, escala: 1, modo: 'off' }, // modo: auto | on | off
  luzCuarto: { encendida: true, intensidad: 200 }, // ridge pendants of the room
  lucesColocadas: { encendidas: true, intensidad: 1 }, // player-placed lights (0..1.5 multiplier)
  luces: LUCES_DEFAULT,
  humano: { x: -603, z: -75 },
  humano2: { x: -200, z: 155 },
}

function cargarEscena() {
  try {
    const crudo = localStorage.getItem(CLAVE_ESCENA)
    if (!crudo) return ESCENA_DEFAULT
    const guardada = JSON.parse(crudo)
    return {
      ...ESCENA_DEFAULT,
      ...guardada,
      lampara: { ...ESCENA_DEFAULT.lampara, ...guardada.lampara },
      luzCuarto: { ...ESCENA_DEFAULT.luzCuarto, ...guardada.luzCuarto },
      lucesColocadas: { ...ESCENA_DEFAULT.lucesColocadas, ...guardada.lucesColocadas },
    }
  } catch {
    return ESCENA_DEFAULT
  }
}

let intervalo = null
let contadorAutosave = 0
let proximoToastId = 1

// Quest + door state persist across reloads (a new game resets them).
// libroAbierto is UI-only and always rehydrates closed.
const QUEST_DEFAULT = {
  libroAbierto: false,
  tieneLlave: false,        // from the golden book
  candadoAbierto: false,    // stair rope: opens with the bronze key
  cofreAbierto: false,      // upstairs chest
  tieneTarjeta: false,      // magnetic card from the chest
  puertaDesbloqueada: false, // card on the door sensor
  finJuego: false,          // combination coffer opened: the founders' letter
}

function cargarQuest() {
  try {
    const crudo = localStorage.getItem(CLAVE_QUEST)
    if (!crudo) return { quest: QUEST_DEFAULT, puertaAbierta: false, camaraPov: false }
    const { quest, puertaAbierta, camaraPov } = JSON.parse(crudo)
    return {
      quest: { ...QUEST_DEFAULT, ...quest, libroAbierto: false },
      puertaAbierta: !!puertaAbierta,
      camaraPov: !!camaraPov, // resume in the mode you were in
    }
  } catch {
    return { quest: QUEST_DEFAULT, puertaAbierta: false, camaraPov: false }
  }
}

function guardarQuest(get) {
  const { quest, puertaAbierta, camaraPov } = get()
  localStorage.setItem(CLAVE_QUEST, JSON.stringify({ quest, puertaAbierta, camaraPov }))
}

const questInicial = cargarQuest()

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
  resetCamara: 0,         // bump to ask the active maqueta to re-center its camera
  camaraLibre: false,     // fly/levitate camera mode (maqueta A)
  camaraPov: questInicial.camaraPov, // first-person mode (persisted)
  puertaAbierta: questInicial.puertaAbierta, // office double door open?
  // Adventure mini-quest (persisted): book -> key -> padlock -> chest -> card -> door
  quest: questInicial.quest,
  arrastreHumano: false,  // scale-reference figure being dragged (pauses camera)
  menuLuces: false,       // light-placing menu open?
  colocandoLuz: null,     // 'pie' | 'aplique' | 'antorcha' while placing
  piedraActiva: null,     // cardinal stone being read (norte/sur/este/oeste)
  infoZoom: null,         // live map-camera readout {dist, y} for tuning

  nuevaPartida(nivel) {
    // fresh game -> fresh quest
    localStorage.removeItem(CLAVE_QUEST)
    set({
      pantalla: 'partida',
      game: createInitialState(nivel),
      lugarSeleccionado: null,
      menuPausa: false,
      quest: QUEST_DEFAULT,
      puertaAbierta: false,
      camaraPov: false,
      camaraLibre: false,
    })
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

  pedirResetCamara() {
    set((s) => ({ resetCamara: s.resetCamara + 1 }))
  },

  setArrastreHumano(v) {
    set({ arrastreHumano: v })
  },

  setInfoZoom(v) {
    set({ infoZoom: v })
  },

  verPiedra(clave) {
    set({ piedraActiva: clave })
  },
  cerrarPiedra() {
    set({ piedraActiva: null })
  },

  // ---- Placeable lights ----
  toggleMenuLuces() {
    set((s) => ({ menuLuces: !s.menuLuces, colocandoLuz: null }))
  },
  elegirLuz(tipo) {
    set({ colocandoLuz: tipo, menuLuces: false })
    agregarToast(
      set,
      get,
      tipo === 'pie'
        ? '🪔 Click en el piso para plantar la lámpara.'
        : tipo === 'aplique'
          ? '💡 Click en una pared para colgar el aplique.'
          : tipo === 'antorcha'
            ? '🔥 Click en pared o piso para clavar la antorcha.'
            : '🗑️ Tocá la luz que querés quitar.',
    )
  },
  agregarLuz(luz) {
    const luces = get().escena.luces ?? []
    if (luces.length >= 12) {
      agregarToast(set, get, '⚡ Máximo 12 luces — quitá alguna primero.')
      set({ colocandoLuz: null })
      return
    }
    get().setEscena({ luces: [...luces, luz] })
    set({ colocandoLuz: null })
  },
  quitarLuz(indice) {
    const luces = get().escena.luces ?? []
    get().setEscena({ luces: luces.filter((_, i) => i !== indice) })
    if (get().colocandoLuz === 'borrar') set({ colocandoLuz: null })
  },
  moverLuz(indice, cambios) {
    const luces = get().escena.luces ?? []
    get().setEscena({
      luces: luces.map((l, i) => (i === indice ? { ...l, ...cambios } : l)),
    })
  },
  quitarLuces() {
    get().setEscena({ luces: [] })
    set({ menuLuces: false })
  },

  toggleCamaraLibre() {
    const activar = !get().camaraLibre
    // leaving a camera mode: instant re-frame to the map view
    set((s) => ({
      camaraLibre: activar,
      camaraPov: false,
      resetCamara: activar ? s.resetCamara : s.resetCamara + 1,
    }))
  },

  toggleCamaraPov() {
    const activar = !get().camaraPov
    set((s) => ({
      camaraPov: activar,
      camaraLibre: false,
      resetCamara: activar ? s.resetCamara : s.resetCamara + 1,
    }))
    guardarQuest(get) // remember the camera mode across reloads
  },

  togglePuerta() {
    const { quest, puertaAbierta } = get()
    if (!quest.puertaDesbloqueada && !puertaAbierta) {
      agregarToast(set, get, '🔒 La puerta está bloqueada. El sensor pide una tarjeta.')
      return
    }
    set((s) => ({ puertaAbierta: !s.puertaAbierta }))
    guardarQuest(get)
  },

  // ---- Adventure quest actions ----
  abrirLibro() {
    set((s) => ({ quest: { ...s.quest, libroAbierto: true } }))
  },
  cerrarLibro() {
    const { quest } = get()
    if (!quest.tieneLlave) agregarToast(set, get, '🔑 Te llevás la llave de bronce.')
    set((s) => ({ quest: { ...s.quest, libroAbierto: false, tieneLlave: true } }))
    guardarQuest(get)
  },
  // Stair padlock: opens with the bronze key from the book.
  abrirCandado() {
    const { quest } = get()
    if (quest.candadoAbierto) return
    if (!quest.tieneLlave) {
      agregarToast(set, get, '🔒 Un candado custodia la escalera. La llave debe estar en algún libro…')
      return
    }
    agregarToast(set, get, '🔓 El candado cede. La escalera es tuya.')
    set((s) => ({ quest: { ...s.quest, candadoAbierto: true } }))
    guardarQuest(get)
  },

  // Final coffer on the corner table: 4-digit combination (1777, carved
  // into the cardinal signs). Inside: the founders' letter — the ending.
  combinacionModal: false,
  cartaModal: false,
  abrirCofrecito() {
    const { quest } = get()
    if (quest.finJuego) {
      set({ cartaModal: true }) // re-read the letter anytime
      return
    }
    set({ combinacionModal: true })
  },
  cerrarCombinacion() {
    set({ combinacionModal: false })
  },
  probarCombinacion(codigo) {
    if (codigo === '1777') {
      set((s) => ({
        quest: { ...s.quest, finJuego: true },
        combinacionModal: false,
        cartaModal: true,
      }))
      guardarQuest(get)
    } else {
      agregarToast(set, get, '🔒 No cede. Los guardianes cardinales deletrean el año — el norte primero.')
    }
  },
  cerrarCarta() {
    set({ cartaModal: false })
  },

  // The Cartographer NPC outside: her dialogue hints at the stones
  mujerModal: false,
  verMujer() {
    set({ mujerModal: true })
  },
  cerrarMujer() {
    set({ mujerModal: false })
  },
  abrirCofre() {
    const { quest } = get()
    if (!quest.cofreAbierto) {
      agregarToast(set, get, '🧰 El cofre se abre. Hay una tarjeta adentro.')
      set((s) => ({ quest: { ...s.quest, cofreAbierto: true } }))
      guardarQuest(get)
    }
  },
  tomarTarjeta() {
    const { quest } = get()
    if (quest.cofreAbierto && !quest.tieneTarjeta) {
      agregarToast(set, get, '💳 Tarjeta magnética en mano.')
      set((s) => ({ quest: { ...s.quest, tieneTarjeta: true } }))
      guardarQuest(get)
    }
  },
  usarSensor() {
    const { quest } = get()
    if (quest.puertaDesbloqueada) return
    if (!quest.tieneTarjeta) {
      agregarToast(set, get, '🟥 El sensor parpadea en rojo. Falta una tarjeta.')
      return
    }
    agregarToast(set, get, '🟩 ¡Acceso concedido! La puerta está desbloqueada.')
    set((s) => ({ quest: { ...s.quest, puertaDesbloqueada: true } }))
    guardarQuest(get)
  },

  /** Merge scene tuning (lamp/sun/room light) and persist it. */
  setEscena(cambios) {
    const escena = {
      ...get().escena,
      ...cambios,
      lampara: { ...get().escena.lampara, ...(cambios.lampara ?? {}) },
      luzCuarto: { ...get().escena.luzCuarto, ...(cambios.luzCuarto ?? {}) },
      lucesColocadas: { ...get().escena.lucesColocadas, ...(cambios.lucesColocadas ?? {}) },
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

  // One-time story events, unlocked by milestone or GDP per capita
  for (const evento of EVENTOS) {
    if ((nuevo.eventosVistos ?? {})[evento.id]) continue
    const porHito = evento.requiereHito != null && nuevo.hitoActual >= evento.requiereHito
    const porPib = evento.requierePibPc != null && pibPerCapita(nuevo) >= evento.requierePibPc
    if (porHito || porPib) {
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
    // v3 -> v4 migration: poverty + approval metrics
    if (v === 3) {
      game.schemaVersion = 4
      game.pobreza = 0.82
      game.aprobacion = 0.5
      v = 4
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
