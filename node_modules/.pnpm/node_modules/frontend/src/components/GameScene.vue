<template>
  <div>
    <!-- Menú de pausa -->
    <div v-if="paused && !showConfirmMenu" class="pause-menu">
      <h1 class="pause-title">PAUSA</h1>
      <div class="menu-buttons">
        <button @click="resumeGame">Reanudar</button>
        <button @click="confirmGoToMenu">Volver al inicio</button>
      </div>
    </div>

    <!-- Confirmación para volver al menú -->
    <div v-if="showConfirmMenu" class="pause-menu">
      <h1 class="pause-title">¿Volver al inicio?</h1>
      <div class="confirmation-buttons">
        <button @click="goToMainMenu">Sí</button>
        <button @click="cancelConfirmations">No</button>
      </div>
    </div>

    <!-- Escena del juego -->
    <ThreeMap v-show="!paused" />
    <PlayerCube ref="playerRef" :paused="paused" @goToMenu="goToMainMenu" />
    <Enemies :paused="paused" v-show="!paused" @goToMenu="goToMainMenu" />
  </div>
</template>

<script setup>
import ModelLoader from './ModelLoader.vue' // Asegúrate de que el path esté correcto

import { ref, onMounted, onBeforeUnmount } from 'vue'
import ThreeMap from './ThreeMap.vue'
import PlayerCube from './PlayerCube.vue'
import Enemies from './Enemies.vue'
import { resetScene } from '@/sceneGlobals'

const emit = defineEmits(['goToMenu'])
const paused = ref(false)
const showConfirmMenu = ref(false)
const playerRef = ref(null)

function handleKeydown(e) {
  if (e.key === 'Escape') {
    // Asegúrate de que el jugador esté vivo antes de pausar
    const player = playerRef.value
    const playerDead = player?.$data?.health <= 0 || player?.health <= 0
    if (!playerDead) {
      paused.value = !paused.value
      cancelConfirmations()
    }
  }
}

function resumeGame() {
  paused.value = false
}

function confirmGoToMenu() {
  showConfirmMenu.value = true
}

function cancelConfirmations() {
  showConfirmMenu.value = false
}

function goToMainMenu() {
  resetScene()
  paused.value = false
  showConfirmMenu.value = false
  emit('goToMenu')
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Puedes agregar estilos personalizados aquí si es necesario */
</style>
