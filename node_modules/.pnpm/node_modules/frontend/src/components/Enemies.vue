<template>
  <div style="display: none;"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { scene, updateFunctions } from '@/sceneGlobals'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const props = defineProps({ paused: Boolean })

let enemies = []
let mixers = []
let spawnInterval
let player
const loader = new GLTFLoader()
const clock = new THREE.Clock()
const enemySpeed = 0.015
const maxEnemies = 5

const attackSound = new Audio('/sounds/zombie-scream.mp3')
attackSound.loop = true

function disposeZombie(zombie) {
  zombie.traverse(child => {
    if (child.isMesh) {
      child.geometry?.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => mat?.dispose())
      } else {
        child.material?.dispose()
      }
    }
  })

  if (zombie.boxHelper) {
    scene.remove(zombie.boxHelper)
    zombie.boxHelper.geometry?.dispose()
    zombie.boxHelper.material?.dispose()
  }
}

function loadZombieModel() {
  return new Promise((resolve, reject) => {
    loader.load('/models/zombie.glb', gltf => {
      const zombie = gltf.scene
      zombie.scale.set(0.28, 0.28, 0.28)
      zombie.position.y = 0.25

      const mixer = new THREE.AnimationMixer(zombie)
      const walkAnim = gltf.animations.find(a => a.name.toLowerCase().includes('walk'))
      const punchAnim = gltf.animations.find(a => a.name.toLowerCase().includes('punch'))

      if (walkAnim) {
        zombie.userData.walk = mixer.clipAction(walkAnim)
        zombie.userData.walk.play()
      }

      if (punchAnim) {
        zombie.userData.punch = mixer.clipAction(punchAnim)
      }

      zombie.box = new THREE.Box3()
      zombie.boxHelper = new THREE.Box3Helper(zombie.box, 0xffff00)
      scene.add(zombie.boxHelper)

      zombie.userData.isDead = false

      zombie.die = () => {
        if (zombie.userData.isDead) return
        zombie.userData.isDead = true

        zombie.userData.walk?.stop()
        zombie.userData.punch?.stop()

        scene.remove(zombie)
        scene.remove(zombie.boxHelper)
        disposeZombie(zombie)

        const idx = enemies.indexOf(zombie)
        if (idx !== -1) {
          enemies.splice(idx, 1)
          mixers.splice(idx, 1)
        }

        if (typeof window.incrementZombieKills === 'function') {
          window.incrementZombieKills()
        }
      }

      resolve({ zombie, mixer })
    }, undefined, reject)
  })
}

async function spawnEnemies(count = 3) {
  if (!player) return
  const radius = 10
  const baseAngle = Math.random() * Math.PI * 2

  for (let i = 0; i < count && enemies.length < maxEnemies; i++) {
    const angle = baseAngle + (i / count) * Math.PI * 2
    const { zombie, mixer } = await loadZombieModel()

    zombie.position.set(
      player.position.x + Math.cos(angle) * radius,
      0.25,
      player.position.z + Math.sin(angle) * radius
    )

    scene.add(zombie)
    enemies.push(zombie)
    mixers.push(mixer)
  }
}

function checkBulletCollisions() {
  const bullets = window.bullets || []

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j]
      if (!enemy.box || !bullet.box || enemy.userData.isDead) continue

      enemy.box.setFromCenterAndSize(enemy.position, new THREE.Vector3(0.7, 1.4, 0.7))
      bullet.box.setFromCenterAndSize(bullet.position, new THREE.Vector3(0.8, 0.8, 0.8))

      if (enemy.box.intersectsBox(bullet.box)) {
        console.log('Colisión bala-zombie')

        enemy.traverse(obj => {
          if (obj.isMesh && obj.material?.color) obj.material.color.set(0x0000ff)
        })
        enemy.boxHelper.material.color.set(0x0000ff)

        bullet.traverse(obj => {
          if (obj.isMesh && obj.material?.color) obj.material.color.set(0x0000ff)
        })
        bullet.boxHelper.material.color.set(0x0000ff)

        enemy.die?.()
        scene.remove(bullet)
        scene.remove(bullet.boxHelper)
        bullets.splice(i, 1)
        break
      }
    }
  }
}

function updateEnemyLogic() {
  if (props.paused) return

  const delta = clock.getDelta()
  mixers.forEach(m => m.update(delta))
  if (!player) return

  checkBulletCollisions()

  const playerBox = new THREE.Box3().setFromObject(player)

  enemies.forEach((enemy, i) => {
    if (!enemy.visible || enemy.userData.isDead) return

    enemy.box.setFromCenterAndSize(enemy.position, new THREE.Vector3(0.7, 1.4, 0.7))
    enemy.boxHelper.box.copy(enemy.box)

    const distance = enemy.position.distanceTo(player.position)
    const direction = new THREE.Vector3().subVectors(player.position, enemy.position).setY(0).normalize()
    const nextPos = enemy.position.clone().addScaledVector(direction, enemySpeed)
    const nextBox = new THREE.Box3().setFromCenterAndSize(nextPos, new THREE.Vector3(1, 1, 1))

    let canMove = !nextBox.intersectsBox(playerBox)
    for (let j = 0; j < enemies.length && canMove; j++) {
      if (i !== j && enemies[j].visible && nextBox.intersectsBox(enemies[j].box)) {
        canMove = false
        break
      }
    }

    if (canMove && distance > 1.5) {
      enemy.position.copy(nextPos)
      enemy.lookAt(player.position.x, enemy.position.y, player.position.z)
    }

    if (distance < 0.9 && enemy.userData.punch && !enemy.userData.punch.isRunning()) {
      enemy.userData.punch.reset().play()
      if (attackSound.paused) attackSound.play()
      if (typeof window.setPlayerHit === 'function') {
        window.setPlayerHit(enemy.position.clone())
      }
    }
  })
}

function startSpawningEnemies() {
  spawnInterval = setInterval(() => {
    spawnEnemies()
  }, 5000)
}

onMounted(() => {
  player = window.player
  if (!player) {
    console.warn('⚠️ Enemies: jugador no cargado aún')
    return
  }

  attackSound.play()
  startSpawningEnemies()
  updateFunctions.push(updateEnemyLogic)
  window.enemies = enemies
})

onBeforeUnmount(() => {
  clearInterval(spawnInterval)
  mixers.forEach(m => m.stopAllAction())
  enemies.forEach(z => {
    scene.remove(z)
    disposeZombie(z)
  })
  enemies = []
  mixers = []

  const idx = updateFunctions.indexOf(updateEnemyLogic)
  if (idx !== -1) updateFunctions.splice(idx, 1)

  delete window.enemies
  attackSound.pause()
  attackSound.currentTime = 0
})
</script>

<style scoped>
</style>
