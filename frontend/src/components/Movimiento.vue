<template>
  <div v-if="!paused" class="pointer-lock-area" @click="enablePointerLock"></div>

  <div v-if="damageAngle !== null" class="damage-ring">
    <div class="damage-sector" :style="{ transform: `rotate(${damageAngle}deg)` }"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { scene, updateFunctions, camera } from '@/sceneGlobals'
import { initMovement, handleMovement, destroyMovement } from './movimiento.js'

const props = defineProps({ paused: Boolean })

let player = null
const clock = new THREE.Clock()

const gotHit = ref(false)
const health = ref(100)
let canBeHit = true
const immunityTime = 2000
const damageAngle = ref(null)
const isPointerLocked = ref(false)

function enablePointerLock() {
  if (!props.paused) {
    document.body.requestPointerLock?.()
  }
}

onMounted(() => {
  player = new THREE.Object3D()
  player.position.set(10, 0.4, 10)
  scene.add(player)
  window.player = player

  initMovement(scene, player)

  updateFunctions.push(() => {
    const delta = Math.min(clock.getDelta(), 0.1)
    handleMovement(player, delta, props.paused)
  })

  const pointerLockListener = () => {
    isPointerLocked.value = document.pointerLockElement === document.body
  }
  document.addEventListener('pointerlockchange', pointerLockListener)
})

onBeforeUnmount(() => {
  clock.stop()
  destroyMovement(scene)
  if (player) {
    scene.remove(player)
    player = null
  }
  delete window.player
  delete window.setPlayerHit
})

window.setPlayerHit = (attackerPosition = null) => {
  if (!canBeHit || health.value <= 0 || props.paused) return
  gotHit.value = true
  health.value = Math.max(0, health.value - 10)
  canBeHit = false

  if (attackerPosition && player) {
    const playerPos = player.position.clone()
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    forward.y = 0
    forward.normalize()

    const toAttacker = attackerPosition.clone().sub(playerPos).setY(0).normalize()

    const angle = THREE.MathUtils.radToDeg(forward.angleTo(toAttacker))
    const cross = forward.clone().cross(toAttacker).y
    damageAngle.value = cross > 0 ? -angle : angle
  }

  setTimeout(() => {
    gotHit.value = false
    canBeHit = true
    damageAngle.value = null
  }, immunityTime)
}
</script>