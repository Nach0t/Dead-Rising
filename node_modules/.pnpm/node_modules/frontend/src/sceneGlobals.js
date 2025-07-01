import * as THREE from 'three'

// Escena principal
export const scene = new THREE.Scene()

// Cámara perspectiva con parámetros típicos
export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

// Renderer WebGL con antialias
export const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)

// Añadir el canvas al body solo si no está ya agregado
if (!document.body.contains(renderer.domElement)) {
  document.body.appendChild(renderer.domElement)
}

// Actualizar tamaño y aspecto cámara + renderer al cambiar tamaño ventana
window.addEventListener('resize', () => {
  const width = window.innerWidth
  const height = window.innerHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
})

// Array global para funciones de actualización en loop de render
export const updateFunctions = []

/**
 * Limpieza profunda de todos los objetos en la escena.
 * También limpia la lista de funciones update.
 * Reubica el jugador (window.player) si existe.
 */
export function resetScene() {
  while (scene.children.length > 0) {
    const obj = scene.children[0]
    scene.remove(obj)

    if (obj.geometry) obj.geometry.dispose()

    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(mat => {
          if (mat.dispose) mat.dispose()
        })
      } else if (obj.material.dispose) {
        obj.material.dispose()
      }
    }
  }

  updateFunctions.length = 0

  if (window.player) {
    window.player.position.set(10.25, 1, 0.5)
    window.player.rotation.set(0, 0, 0)
  } else {
    delete window.player
  }
}

// Manejo robusto de pérdida y restauración de contexto WebGL
renderer.domElement.addEventListener('webglcontextlost', (event) => {
  event.preventDefault()
  console.warn('⚠️ WebGL context lost')
})

renderer.domElement.addEventListener('webglcontextrestored', (event) => {
  console.info('✅ WebGL context restored')
})
