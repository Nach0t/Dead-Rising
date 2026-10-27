<template>
  <div>
    <!-- HUD SUPERIOR -->
    <div class="hud-top">
      <div class="hud-left">
        <div class="player-name">{{ nombreJugador }}</div>
        <div class="health-bar-container">
          <div
            class="health-bar"
            :style="{ width: health + '%', backgroundColor: healthColor }"
          ></div>
        </div>
      </div>

      <div class="hud-center">
        <div class="cronometro">{{ tiempoFormateado }}</div>
      </div>

      <div class="hud-right">
        <img src="/src/assets/logo.png" alt="logo" class="zombie-logo" />
        <div class="zombie-kills">x{{ zombiesEliminados }}</div>
      </div>
    </div>

    <!-- Indicador de dirección del daño -->
    <div v-if="damageAngle !== null" class="damage-ring">
      <div
        class="damage-sector"
        :style="{ transform: `rotate(${damageAngle}deg)` }"
      ></div>
    </div>

    <!-- Pantalla de derrota -->
    <div v-if="health <= 0" class="death-screen">
      <h1>💀 ¡Perdiste!</h1>
      <h2>Que manco</h2>
      <button @click="volverAlMenu" class="btn-volver">Volver al menú</button>
    </div>

    <!-- Área de bloqueo de puntero y mira -->
    <div
      v-if="!paused && health > 0"
      @click="enablePointerLock"
      class="pointer-lock-area"
    ></div>
    <div v-if="!paused && health > 0" class="crosshair">+</div>

    <!-- Resumen con TAB -->
    <div v-if="mostrarResumen" class="resumen-tab">
      <h2>Resumen</h2>
      <p><strong>Jugador:</strong> {{ nombreJugador }}</p>
      <p><strong>Tiempo:</strong> {{ tiempoFormateado }}</p>
      <p><strong>Zombies eliminados:</strong> {{ zombiesEliminados }}</p>
      <p><strong>Vida:</strong> {{ health }}%</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { scene, camera, updateFunctions } from '@/sceneGlobals'
import axios from 'axios'

const props = defineProps({
  paused: Boolean,
  nivel: { type: String, default: 'Don Pollo' }
})
const emit = defineEmits(['goToMenu'])

// Estado reactivo del jugador y partida
const health = ref(100)
const gotHit = ref(false)
const damageAngle = ref(null)
const juegoTerminado = ref(false)
const zombiesEliminados = ref(0)
const tiempo = ref(0)
const mostrarResumen = ref(false)

// Exponer health para que GameScene.vue pueda consultarlo al pausar
defineExpose({ health })

const nombreJugador = localStorage.getItem('nombreUsuario') || 'Jugador'
let rankingGuardado = false
let canBeHit = true
const immunityTime = 1500
let intervaloTiempo = null
let damageResetTimeout = null

// Variables Three.js y físicas
let player = null
let isPointerLocked = false
const keys = {}
const clock = new THREE.Clock()

const pitchObject = new THREE.Object3D()
const yawObject = new THREE.Object3D()

let speed = 5.0 // Velocidad basada en delta time
const gravity = -25.0
let isJumping = false
let verticalSpeed = 0
const groundY = 0.4

// Balas y sonido
const bullets = []
const bulletSpeed = 30
let bulletTemplate = null
const shootSound = new Audio('/sounds/shoot.mp3')

const tiempoFormateado = computed(() => {
  const min = Math.floor(tiempo.value / 60)
  const seg = tiempo.value % 60
  return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`
})

const healthColor = computed(() => {
  if (health.value > 60) return '#2ecc71'
  if (health.value > 35) return '#f1c40f'
  return '#e74c3c'
})

function volverAlMenu() {
  if (document.pointerLockElement) {
    document.exitPointerLock?.()
  }
  emit('goToMenu')
}

function enablePointerLock() {
  if (!props.paused && health.value > 0) {
    document.body.requestPointerLock?.()
  }
}

function onPointerLockChange() {
  isPointerLocked = document.pointerLockElement === document.body
}

function onMouseMove(e) {
  if (!isPointerLocked || props.paused || health.value <= 0) return
  const sensitivity = 0.002
  yawObject.rotation.y -= e.movementX * sensitivity
  pitchObject.rotation.x -= e.movementY * sensitivity
  const limit = Math.PI / 2 - 0.01
  pitchObject.rotation.x = Math.max(-limit, Math.min(limit, pitchObject.rotation.x))
}

function onKeyDown(e) {
  if (e.code === 'Tab') {
    e.preventDefault()
    mostrarResumen.value = !mostrarResumen.value
    return
  }
  keys[e.key.toLowerCase()] = true
}

function onKeyUp(e) {
  keys[e.key.toLowerCase()] = false
}

function onMouseDown(e) {
  if (e.button === 0 && isPointerLocked && !props.paused && health.value > 0) {
    shoot()
  }
}

function loadBulletModel() {
  // ModelLoader guarda cada recurso como { scene, animations }.
  // Aceptar también el formato antiguo por compatibilidad durante la transición.
  const cachedBullet = window.modelCache?.balaModel
  if (cachedBullet) {
    bulletTemplate = cachedBullet.scene ?? cachedBullet
    return
  }

  const loader = new GLTFLoader()
  loader.load('/models/bala_bullet.glb', gltf => {
    bulletTemplate = gltf.scene
    bulletTemplate.scale.set(0.05, 0.05, 0.05)
  })
}

function shoot() {
  if (!bulletTemplate || props.paused || health.value <= 0) return

  const bullet = bulletTemplate.clone(true)
  bullet.visible = true

  const offset = new THREE.Vector3(0, -0.05, -0.4)
  const worldPos = offset.applyMatrix4(camera.matrixWorld)
  bullet.position.copy(worldPos)

  const direction = new THREE.Vector3()
  camera.getWorldDirection(direction)
  bullet.direction = direction.normalize()
  bullet.speed = bulletSpeed
  bullet.distanceTravelled = 0

  bullet.box = new THREE.Box3().setFromCenterAndSize(
    bullet.position,
    new THREE.Vector3(0.4, 0.4, 0.4)
  )

  scene.add(bullet)
  bullets.push(bullet)
  window.bullets = bullets

  shootSound.currentTime = 0
  shootSound.play().catch(() => {})
}

function updateBullets(delta) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]
    const moveDistance = bullet.speed * delta
    bullet.position.addScaledVector(bullet.direction, moveDistance)
    bullet.distanceTravelled += moveDistance

    bullet.box.setFromCenterAndSize(
      bullet.position,
      new THREE.Vector3(0.4, 0.4, 0.4)
    )

    if (bullet.distanceTravelled > 60) {
      scene.remove(bullet)
      bullets.splice(i, 1)
    }
  }
}

function checkObstacleCollision(position) {
  if (!Array.isArray(window.mapObstacles)) return false
  const testBox = new THREE.Box3().setFromCenterAndSize(
    position,
    new THREE.Vector3(0.8, 1.8, 0.8)
  )
  for (const wallBox of window.mapObstacles) {
    if (testBox.intersectsBox(wallBox)) return true
  }
  return false
}

function updatePlayerLogic() {
  if (props.paused || health.value <= 0) {
    clock.getDelta() // Evitar salto brusco de delta al despausar
    return
  }

  const delta = Math.min(clock.getDelta(), 0.1)
  updateBullets(delta)

  const inputVelocity = new THREE.Vector3(0, 0, 0)
  if (keys['w']) inputVelocity.z -= 1
  if (keys['s']) inputVelocity.z += 1
  if (keys['a']) inputVelocity.x -= 1
  if (keys['d']) inputVelocity.x += 1

  if (inputVelocity.lengthSq() > 0) {
    inputVelocity.normalize().multiplyScalar(speed * delta)

    // Movimiento relativo hacia donde mira la cámara horizontalmente
    const euler = new THREE.Euler(0, yawObject.rotation.y, 0, 'YXZ')
    const direction = inputVelocity.applyEuler(euler)

    // Comprobar colisión separada por ejes (permite deslizarse por paredes)
    const nextPosX = player.position.clone().add(new THREE.Vector3(direction.x, 0, 0))
    if (!checkObstacleCollision(nextPosX)) {
      player.position.x = nextPosX.x
    }

    const nextPosZ = player.position.clone().add(new THREE.Vector3(0, 0, direction.z))
    if (!checkObstacleCollision(nextPosZ)) {
      player.position.z = nextPosZ.z
    }
  }

  // Salto y gravedad
  if (keys[' '] && !isJumping) {
    verticalSpeed = 7.5
    isJumping = true
  }

  if (isJumping) {
    player.position.y += verticalSpeed * delta
    verticalSpeed += gravity * delta

    if (player.position.y <= groundY) {
      player.position.y = groundY
      verticalSpeed = 0
      isJumping = false
    }
  }

  // Límites del mapa
  if (window.mapLimits) {
    const { xMin, xMax, zMin, zMax } = window.mapLimits
    player.position.x = Math.max(xMin, Math.min(xMax, player.position.x))
    player.position.z = Math.max(zMin, Math.min(zMax, player.position.z))
  }

  player.position.y = Math.max(groundY, player.position.y)
  yawObject.position.copy(player.position)
  player.box.setFromCenterAndSize(player.position, new THREE.Vector3(0.8, 1.8, 0.8))
}

// Funciones globales para comunicación con Enemies.vue
const incrementZombieKillsHandler = () => {
  zombiesEliminados.value++
}

const setPlayerHitHandler = (attackerPosition = null) => {
  if (!canBeHit || health.value <= 0 || props.paused) return
  gotHit.value = true
  health.value = Math.max(0, health.value - 25)
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

  damageResetTimeout = setTimeout(() => {
    gotHit.value = false
    canBeHit = true
    damageAngle.value = null
    damageResetTimeout = null
  }, immunityTime)
}

const getZombieKillFunctionHandler = () => zombiesEliminados

window.incrementZombieKills = incrementZombieKillsHandler
window.setPlayerHit = setPlayerHitHandler
window.getZombieKillFunction = getZombieKillFunctionHandler

// Liberar el puntero automáticamente si se pausa o muere
watch(() => props.paused, isPaused => {
  if (isPaused && document.pointerLockElement) {
    document.exitPointerLock?.()
  }
})

watch(health, async val => {
  if (val <= 0 && !rankingGuardado) {
    juegoTerminado.value = true
    speed = 0
    canBeHit = false
    window.stopSpawning = true
    clearInterval(intervaloTiempo)

    if (document.pointerLockElement) {
      document.exitPointerLock?.()
    }

    const puntaje = zombiesEliminados.value * 10 + tiempo.value
    try {
      await axios.post('/ranking', {
        nombreUsuario: nombreJugador,
        zombies: zombiesEliminados.value,
        tiempo: tiempo.value,
        puntaje,
        nivel: props.nivel
      })
      rankingGuardado = true
    } catch (err) {
      console.error('❌ Error al enviar ranking:', err)
    }
  }
})

onMounted(() => {
  window.stopSpawning = false

  pitchObject.add(camera)
  yawObject.add(pitchObject)
  scene.add(yawObject)

  player = new THREE.Object3D()
  player.position.set(10.25, groundY, 0.5)
  player.box = new THREE.Box3().setFromCenterAndSize(
    player.position,
    new THREE.Vector3(0.8, 1.8, 0.8)
  )
  scene.add(player)

  yawObject.position.copy(player.position)
  camera.position.set(0, 0.6, 0) // Altura de los ojos en primera persona

  loadBulletModel()

  intervaloTiempo = setInterval(() => {
    if (!juegoTerminado.value && !props.paused) {
      tiempo.value++
    }
  }, 1000)

  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
  document.addEventListener('pointerlockchange', onPointerLockChange)
  document.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mousedown', onMouseDown)

  updateFunctions.push(updatePlayerLogic)
  window.player = player
})

onBeforeUnmount(() => {
  clearInterval(intervaloTiempo)
  if (damageResetTimeout) {
    clearTimeout(damageResetTimeout)
    damageResetTimeout = null
  }

  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
  document.removeEventListener('pointerlockchange', onPointerLockChange)
  document.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousedown', onMouseDown)

  const idx = updateFunctions.indexOf(updatePlayerLogic)
  if (idx !== -1) updateFunctions.splice(idx, 1)

  bullets.forEach(b => scene.remove(b))
  bullets.length = 0

  if (player) scene.remove(player)
  scene.remove(yawObject)

  if (window.incrementZombieKills === incrementZombieKillsHandler) delete window.incrementZombieKills
  if (window.setPlayerHit === setPlayerHitHandler) delete window.setPlayerHit
  if (window.getZombieKillFunction === getZombieKillFunctionHandler) delete window.getZombieKillFunction

  delete window.player
  delete window.bullets
})
</script>