<template>
  <div class="game-scene-container">
    <!-- Precargador de modelos 3D -->
    <ModelLoader />

    <!-- Menú de pausa -->
    <div v-if="paused && !showConfirmMenu" class="pause-menu">
      <h1 class="pause-title">PAUSA</h1>
      <div class="menu-buttons">
        <button @click="resumeGame" class="btn-pause">Reanudar</button>
        <button @click="confirmGoToMenu" class="btn-pause">Volver al inicio</button>
      </div>
    </div>

    <!-- Confirmación para volver al menú -->
    <div v-if="showConfirmMenu" class="pause-menu">
      <h1 class="pause-title">¿Volver al inicio?</h1>
      <div class="confirmation-buttons">
        <button @click="goToMainMenu" class="btn-pause confirm-yes">Sí</button>
        <button @click="cancelConfirmations" class="btn-pause confirm-no">No</button>
      </div>
    </div>

    <!-- Escena del juego -->
    <ThreeMap />
    <PlayerCube
      ref="playerRef"
      :paused="paused"
      :nivel="nivel"
      @goToMenu="goToMainMenu"
    />
    <Enemies :paused="paused" @goToMenu="goToMainMenu" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ModelLoader from './ModelLoader.vue'
import ThreeMap from './ThreeMap.vue'
import PlayerCube from './PlayerCube.vue'
import Enemies from './Enemies.vue'
import { resetScene } from '@/sceneGlobals'

const props = defineProps({
  nivel: { type: String, default: 'Don Pollo' }
})
const emit = defineEmits(['goToMenu'])

const paused = ref(false)
const showConfirmMenu = ref(false)
const playerRef = ref(null)

function isPlayerDead() {
  const player = playerRef.value
  if (!player) return false
  const currentHealth = typeof player.health === 'number' ? player.health : player.health?.value
  return currentHealth <= 0
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    if (isPlayerDead()) return

    // Si ya estaba en el submenú de confirmación, vuelve al menú de pausa principal
    if (showConfirmMenu.value) {
      showConfirmMenu.value = false
      return
    }

    paused.value = !paused.value
    if (!paused.value) {
      document.body.requestPointerLock?.()
    }
  }
}

// Si el navegador sale de PointerLock (porque el usuario pulsó ESC), pausamos automáticamente
function handlePointerLockChange() {
  const isLocked = document.pointerLockElement === document.body
  if (!isLocked && !paused.value && !isPlayerDead()) {
    paused.value = true
    showConfirmMenu.value = false
  }
}

function resumeGame() {
  paused.value = false
  showConfirmMenu.value = false
  document.body.requestPointerLock?.()
}

function confirmGoToMenu() {
  showConfirmMenu.value = true
}

function cancelConfirmations() {
  showConfirmMenu.value = false
}

function goToMainMenu() {
  if (document.pointerLockElement) {
    document.exitPointerLock?.()
  }
  resetScene()
  paused.value = false
  showConfirmMenu.value = false
  emit('goToMenu')
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('pointerlockchange', handlePointerLockChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('pointerlockchange', handlePointerLockChange)
})
</script>