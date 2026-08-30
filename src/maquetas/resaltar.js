// Hover highlight for interactive objects (the classic game "glow"):
// call from onPointerOver/Out — it tints every child mesh's emissive
// gold and sets the pointer cursor. Basic materials (bulbs, flames)
// have no emissive and are skipped automatically.
export function resaltar(e, activo) {
  e.stopPropagation?.()
  const raiz = e.eventObject
  if (raiz) {
    raiz.traverse((o) => {
      if (o.isMesh && o.material?.emissive) {
        if (activo) {
          if (o.userData.emisivoOriginal == null) {
            o.userData.emisivoOriginal = o.material.emissive.getHex()
            o.userData.emisivoIntensidadOriginal = o.material.emissiveIntensity
          }
          o.material.emissive.setHex(0x9a7b2e)
          o.material.emissiveIntensity = 0.5
        } else if (o.userData.emisivoOriginal != null) {
          o.material.emissive.setHex(o.userData.emisivoOriginal)
          o.material.emissiveIntensity = o.userData.emisivoIntensidadOriginal ?? 1
          delete o.userData.emisivoOriginal
        }
      }
    })
  }
  document.body.style.cursor = activo ? 'pointer' : 'auto'
}
