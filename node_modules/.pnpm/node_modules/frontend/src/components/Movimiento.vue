<template>
  <div class="pointer-lock-area" @click="enablePointerLock"></div>

  <div v-if="damageAngle !== null" class="damage-ring">
    <div class="damage-sector" :style="{ transform: `rotate(${damageAngle}deg)` }"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { scene, updateFunctions, camera } from '@/sceneGlobals'
import { initMovement, handleMovement } from './movimiento.js'

let player

const gotHit = ref(false)
const health = ref(10)
let canBeHit = true
const immunityTime = 2000
const damageAngle = ref(null)

function enablePointerLock() {
  document.body.requestPointerLock?.()
}

onMounted(() => {
  player = new THREE.Object3D()
  player.position.set(10, 0.4, 10)
  scene.add(player)
  window.player = player

  initMovement(scene, player)

  updateFunctions.push(() => {
    handleMovement(player)
  })

  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === document.body
  })
})

onBeforeUnmount(() => {
  // limpiar si es necesario
})

window.setPlayerHit = (attackerPosition = null) => {
  if (!canBeHit || health.value <= 0) return
  gotHit.value = true
  health.value = Math.max(0, health.value - 5)
  canBeHit = false

  if (attackerPosition) {
    const playerPos = player.position.clone()
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const toAttacker = attackerPosition.clone().sub(playerPos).setY(0).normalize()

    const angle = THREE.MathUtils.radToDeg(forward.angleTo(toAttacker))
    const cross = forward.clone().cross(toAttacker).y
    damageAngle.value = cross > 0 ? angle : -angle
  }

  setTimeout(() => {
    gotHit.value = false
    canBeHit = true
    damageAngle.value = null
  }, immunityTime)
}
</script>

<style scoped>
.pointer-lock-area {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
}

.damage-ring {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1000;
}

.damage-sector {
  position: absolute;
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  margin: -50px 0 0 -50px;
  background: rgba(255, 0, 0, 0.4);
  border-radius: 50%;
  clip-path: polygon(50% 50%, 100% 0, 100% 100%);
}
</style>
