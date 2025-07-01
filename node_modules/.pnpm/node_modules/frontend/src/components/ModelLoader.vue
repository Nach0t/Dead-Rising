<template>
  <div style="display: none;"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// Modelos a precargar
const modelos = [
  { key: 'zombieModel', path: '/models/zombie.glb', scale: 0.28 },
  { key: 'balaModel', path: '/models/bala_bullet.glb', scale: 0.05 },
  { key: 'armaModel', path: '/models/glock.glb', scale: 0.3 },
  { key: 'jugadorModel', path: '/models/remy.glb', scale: 1.0 }
]

const loader = new GLTFLoader()

function precargarModelos() {
  modelos.forEach(({ key, path, scale }) => {
    loader.load(
      path,
      gltf => {
        const model = gltf.scene
        model.scale.set(scale, scale, scale)
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            child.frustumCulled = false
            child.geometry?.computeBoundingBox()
            if (child.material) {
              child.material.depthWrite = true
              child.material.side = THREE.FrontSide
            }
          }
        })

        model.visible = false
        window.modelCache ??= {}
        window.modelCache[key] = model
        console.log(`✅ Modelo precargado: ${key}`)
      },
      undefined,
      error => console.error(`❌ Error cargando ${path}:`, error)
    )
  })
}

onMounted(() => {
  precargarModelos()
})
</script>
