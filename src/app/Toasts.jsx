// Discreet notifications: milestones reached, works finished, effects live.
import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore.js'

const DURACION_MS = 5000

export function Toasts() {
  const toasts = useGameStore((s) => s.toasts)
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  )
}

function Toast({ toast }) {
  const quitarToast = useGameStore((s) => s.quitarToast)

  useEffect(() => {
    const timer = setTimeout(() => quitarToast(toast.id), DURACION_MS)
    return () => clearTimeout(timer)
  }, [toast.id, quitarToast])

  return <div className="toast">{toast.texto}</div>
}
