<template>
  <div ref="container" style="width: 100vw; height: 100vh; background-color: black;"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { scene, camera, renderer, updateFunctions } from '@/sceneGlobals'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

const container = ref(null)

let controls
let mapa // para limpiar

// Función resize para poder remover el event listener después
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate)
  updateFunctions.forEach(fn => fn())
  if (controls) controls.update()
  renderer.render(scene, camera)
}

onMounted(() => {
  scene.background = new THREE.Color(0x202020)
  camera.position.set(10.25, 5, 10.5)
  camera.lookAt(10.25, 0, 0.5)

  renderer.setSize(window.innerWidth, window.innerHeight)
  container.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enableRotate = false
  controls.enableZoom = false

  scene.add(new THREE.AmbientLight(0x404040))
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(10, 20, 10)
  scene.add(light)

  const loader = new GLTFLoader()
  loader.load('/models/MapaConCubo.glb', gltf => {
    mapa = gltf.scene
    scene.add(mapa)

    const box = new THREE.Box3().setFromObject(mapa)
    window.mapLimits = {
      xMin: box.min.x + 1,
      xMax: box.max.x - 1,
      zMin: box.min.z + 1,
      zMax: box.max.z - 1
    }
  })

  animate()

  window.addEventListener('resize', onWindowResize)
})

onBeforeUnmount(() => {
  // Quitar event listener de resize para evitar fugas
  window.removeEventListener('resize', onWindowResize)

  // Remover mapa y liberar memoria
  if (mapa) {
    scene.remove(mapa)
    mapa.traverse(child => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
    mapa = null
  }

  // No hay que cancelar animate porque es ciclo continuo, pero si quieres, puedes controlar con flag
})
</script>

<style scoped>

</style>
