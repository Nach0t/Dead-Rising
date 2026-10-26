<template>
  <div style="display: none;"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { scene, updateFunctions } from '@/sceneGlobals'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const props = defineProps({ paused: Boolean })

let enemies = []
let mixers = []
let spawnInterval = null
let waitPlayerInterval = null
let player = null

const loader = new GLTFLoader()
const clock = new THREE.Clock()

const enemySpeed = 2.2 // Velocidad en unidades por segundo (usando delta)
const maxEnemies = 8
const stopDistance = 1.1 // Distancia a la que se detienen frente al jugador
const attackRange = 1.4  // Rango en el que pueden lanzar el golpe

const attackSound = new Audio('/sounds/zombie-scream.mp3')
attackSound.loop = false
attackSound.volume = 0.6

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
    loader.load(
      '/models/zombie.glb',
      gltf => {
        const zombie = gltf.scene
        zombie.scale.set(0.28, 0.28, 0.28)
        zombie.position.y = 0.25

        const mixer = new THREE.AnimationMixer(zombie)
        const walkAnim = gltf.animations.find(a =>
          a.name.toLowerCase().includes('walk')
        )
        const punchAnim = gltf.animations.find(a =>
          a.name.toLowerCase().includes('punch') ||
          a.name.toLowerCase().includes('attack')
        )

        if (walkAnim) {
          zombie.userData.walk = mixer.clipAction(walkAnim)
          zombie.userData.walk.play()
        }

        if (punchAnim) {
          const punchAction = mixer.clipAction(punchAnim)
          punchAction.setLoop(THREE.LoopOnce)
          punchAction.clampWhenFinished = true
          zombie.userData.punch = punchAction
        }

        zombie.box = new THREE.Box3()
        zombie.userData.isDead = false
        zombie.userData.lastAttackTime = 0

        zombie.die = () => {
          if (zombie.userData.isDead) return
          zombie.userData.isDead = true

          zombie.userData.walk?.stop()
          zombie.userData.punch?.stop()

          scene.remove(zombie)
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
      },
      undefined,
      reject
    )
  })
}

async function spawnEnemies(count = 3) {
  if (!player || props.paused || window.stopSpawning) return

  const radius = 10
  const baseAngle = Math.random() * Math.PI * 2

  for (let i = 0; i < count && enemies.length < maxEnemies; i++) {
    if (window.stopSpawning) break

    const angle = baseAngle + (i / count) * Math.PI * 2
    try {
      const { zombie, mixer } = await loadZombieModel()

      let spawnX = player.position.x + Math.cos(angle) * radius
      let spawnZ = player.position.z + Math.sin(angle) * radius

      // Respetar límites del mapa si existen
      if (window.mapLimits) {
        const { xMin, xMax, zMin, zMax } = window.mapLimits
        spawnX = Math.max(xMin, Math.min(xMax, spawnX))
        spawnZ = Math.max(zMin, Math.min(zMax, spawnZ))
      }

      zombie.position.set(spawnX, 0.25, spawnZ)
      zombie.box.setFromCenterAndSize(
        zombie.position,
        new THREE.Vector3(0.8, 1.6, 0.8)
      )

      scene.add(zombie)
      enemies.push(zombie)
      mixers.push(mixer)
    } catch (err) {
      console.error('❌ Error al generar zombie:', err)
    }
  }
}

function checkBulletCollisions() {
  const bullets = window.bullets || []
  if (!bullets.length || !enemies.length) return

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]
    if (!bullet || !bullet.box) continue

    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j]
      if (!enemy || !enemy.box || enemy.userData.isDead) continue

      enemy.box.setFromCenterAndSize(
        enemy.position,
        new THREE.Vector3(0.8, 1.6, 0.8)
      )

      if (enemy.box.intersectsBox(bullet.box)) {
        enemy.die?.()

        scene.remove(bullet)
        if (bullet.boxHelper) scene.remove(bullet.boxHelper)
        bullets.splice(i, 1)
        break
      }
    }
  }
}

function updateEnemyLogic() {
  if (props.paused || window.stopSpawning) {
    clock.getDelta() // Evitar salto brusco de tiempo al despausar
    return
  }

  const delta = Math.min(clock.getDelta(), 0.1)
  mixers.forEach(m => m.update(delta))

  if (!player) return

  checkBulletCollisions()

  const now = performance.now()

  enemies.forEach((enemy, i) => {
    if (!enemy.visible || enemy.userData.isDead) return

    enemy.box.setFromCenterAndSize(
      enemy.position,
      new THREE.Vector3(0.8, 1.6, 0.8)
    )

    // Mirar siempre hacia el jugador en el plano horizontal
    enemy.lookAt(player.position.x, enemy.position.y, player.position.z)

    const distance = enemy.position.distanceTo(player.position)

    // Movimiento hacia el jugador
    if (distance > stopDistance) {
      const direction = new THREE.Vector3()
        .subVectors(player.position, enemy.position)
        .setY(0)
        .normalize()

      const nextPos = enemy.position
        .clone()
        .addScaledVector(direction, enemySpeed * delta)

      const nextBox = new THREE.Box3().setFromCenterAndSize(
        nextPos,
        new THREE.Vector3(0.75, 1.5, 0.75)
      )

      // Evitar que los zombies se superpongan entre sí
      let canMove = true
      if (player.box && nextBox.intersectsBox(player.box)) {
        canMove = false
      }

      for (let j = 0; j < enemies.length && canMove; j++) {
        if (i !== j && enemies[j].visible && !enemies[j].userData.isDead) {
          if (nextBox.intersectsBox(enemies[j].box)) {
            canMove = false
            break
          }
        }
      }

      if (canMove) {
        enemy.position.copy(nextPos)
      }
    }

    // Lógica de ataque cuando está cerca del jugador
    if (distance <= attackRange) {
      if (now - enemy.userData.lastAttackTime > 1200) {
        enemy.userData.lastAttackTime = now

        if (enemy.userData.punch) {
          enemy.userData.punch.reset().play()
        }

        attackSound.currentTime = 0
        attackSound.play().catch(() => {})

        if (typeof window.setPlayerHit === 'function') {
          window.setPlayerHit(enemy.position.clone())
        }
      }
    }
  })
}

function startSpawningEnemies() {
  spawnEnemies(3) // Primera oleada inmediata
  spawnInterval = setInterval(() => {
    if (!props.paused && !window.stopSpawning) {
      spawnEnemies(2)
    }
  }, 5000)
}

watch(
  () => props.paused,
  isPaused => {
    if (isPaused) {
      attackSound.pause()
    }
  }
)

onMounted(() => {
  // Esperar de forma segura a que PlayerCube inicialice window.player
  waitPlayerInterval = setInterval(() => {
    if (window.player) {
      clearInterval(waitPlayerInterval)
      player = window.player
      startSpawningEnemies()
      updateFunctions.push(updateEnemyLogic)
      window.enemies = enemies
    }
  }, 100)
})

onBeforeUnmount(() => {
  clearInterval(spawnInterval)
  clearInterval(waitPlayerInterval)

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