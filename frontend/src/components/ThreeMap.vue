<template>
  <div ref="container" class="map-container"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { scene, camera, renderer, updateFunctions } from '@/sceneGlobals'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

const container = ref(null)

let controls = null
let mapa = null
let animationFrameId = null

function onWindowResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  animationFrameId = requestAnimationFrame(animate)
  
  // Ejecutar funciones globales registradas en el ciclo (jugador, enemigos, balas)
  for (let i = 0; i < updateFunctions.length; i++) {
    updateFunctions[i]()
  }

  if (controls) controls.update()
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

onMounted(() => {
  scene.background = new THREE.Color(0x101010)
  camera.position.set(10.25, 5, 10.5)
  camera.lookAt(10.25, 0, 0.5)

  if (renderer && container.value) {
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.value.appendChild(renderer.domElement)
  }

  // Configuración opcional de controles (primer plano usa movimiento libre, Orbit desactivado por defecto)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enableRotate = false
  controls.enableZoom = false
  controls.enabled = false // Desactivado para dar el control total a primera persona

  // Luces de la escena
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(15, 25, 15)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 2048
  dirLight.shadow.mapSize.height = 2048
  scene.add(dirLight)

  // Carga del Mapa 3D
  const loader = new GLTFLoader()
  loader.load('/models/MapaConCubo.glb', gltf => {
    mapa = gltf.scene
    scene.add(mapa)

    window.mapObstacles = []

    mapa.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        
        // Opcional: Si tus paredes tienen nombre específico o quieres mapearlas como colisión
        // Ejemplo: si el objeto contiene la palabra 'wall' o 'pared' en su nombre
        if (child.name.toLowerCase().includes('wall') || child.name.toLowerCase().includes('pared') || child.name.toLowerCase().includes('cube')) {
          const box = new THREE.Box3().setFromObject(child)
          window.mapObstacles.push(box)
        }
      }
    })

    // Calcular límites generales del mapa basados en el tamaño del objeto raíz
    const box = new THREE.Box3().setFromObject(mapa)
    window.mapLimits = {
      xMin: box.min.x + 1,
      xMax: box.max.x - 1,
      zMin: box.min.z + 1,
      zMax: box.max.z - 1
    }

    console.log('✅ Mapa cargado y colisiones mapeadas:', window.mapObstacles.length)
  })

  animate()
  window.addEventListener('resize', onWindowResize)
})

onBeforeUnmount(() => {
  // Cancelar bucle de animación para evitar fugas de rendimiento
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  window.removeEventListener('resize', onWindowResize)

  // Limpiar variables globales de colisión
  window.mapObstacles = []
  window.mapLimits = null

  // Remover controles
  if (controls) {
    controls.dispose()
    controls = null
  }

  // Remover mapa de la escena y liberar recursos GPU
  if (mapa) {
    scene.remove(mapa)
    mapa.traverse(child => {
      if (child.geometry) {
        child.geometry.dispose()
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            if (mat.map) mat.map.dispose()
            mat.dispose()
          })
        } else {
          if (child.material.map) child.material.map.dispose()
          child.material.dispose()
        }
      }
    })
    mapa = null
  }
})
</script>

<style scoped>
.map-container {
  width: 100vw;
  height: 100vh;
  background-color: black;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
</style>