// World data loader shared by the game and the editor.
// The editor auto-saves to localStorage; that copy wins over the
// shipped public/data/mundo.json until an export replaces the file.

const CLAVE_LOCAL = 'vzla-sim.mundo'

export async function cargarMundo() {
  const local = localStorage.getItem(CLAVE_LOCAL)
  if (local) {
    try {
      return JSON.parse(local)
    } catch {
      localStorage.removeItem(CLAVE_LOCAL)
    }
  }
  const r = await fetch('/data/mundo.json')
  return r.json()
}

export function guardarMundoLocal(mundo) {
  localStorage.setItem(CLAVE_LOCAL, JSON.stringify(mundo))
}

/** Download mundo.json so it can replace public/data/mundo.json. */
export function exportarMundo(mundo) {
  const blob = new Blob([JSON.stringify(mundo, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mundo.json'
  a.click()
  URL.revokeObjectURL(url)
}
