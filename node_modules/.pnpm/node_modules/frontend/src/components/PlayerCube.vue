<template>
  <div>
    <!-- HUD SUPERIOR -->
    <div class="hud-top">
      <div class="hud-left">
        <div class="player-name">{{ nombreJugador }}</div>
        <div class="health-bar-container">
          <div class="health-bar" :style="{ width: health + '%', backgroundColor: healthColor }"></div>
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
      <div class="damage-sector" :style="{ transform: `rotate(${damageAngle}deg)` }"></div>
    </div>

    <div v-if="health <= 0" class="death-screen">
      <h1>💀 ¡Perdiste!</h1>
      <h2>Que manco</h2>
      <button @click="volverAlMenu" class="btn-volver">Volver al menú</button>
    </div>

    <div @click="enablePointerLock" class="pointer-lock-area"></div>
    <div class="crosshair">+</div>

    <div v-if="mostrarResumen" class="resumen-tab">
      <h2>Resumen</h2>
      <p><strong>Jugador:</strong> {{ nombreJugador }}</p>
      <p><strong>Tiempo:</strong> {{ tiempoFormateado }}</p>
      <p><strong>Zombies eliminados:</strong> {{ zombiesEliminados }}</p>
      <p><strong>Vida:</strong> {{ health }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { scene, camera, updateFunctions } from '@/sceneGlobals'
import axios from 'axios'

const props = defineProps({ paused: Boolean })
const emit = defineEmits(['goToMenu'])

let player
let intervaloTiempo
let isPointerLocked = false
const juegoTerminado = ref(false)
const bullets = []
const bulletSpeed = 1
let bulletTemplate = null
const shootSound = new Audio('/sounds/shoot.mp3')

const clock = new THREE.Clock()
const pitchObject = new THREE.Object3D()
const yawObject = new THREE.Object3D()
pitchObject.add(camera)
yawObject.add(pitchObject)
scene.add(yawObject)

let speed = 0.01
const gravity = -0.01
let isJumping = false
let verticalSpeed = 0
const groundY = 0.4

const gotHit = ref(false)
const health = ref(10)
let canBeHit = true
const immunityTime = 2000

const nombreJugador = localStorage.getItem('nombreUsuario') || 'Jugador'
const zombiesEliminados = ref(0)
const tiempo = ref(0)
let rankingGuardado = false
const mostrarResumen = ref(false)

const tiempoFormateado = computed(() => {
  const min = Math.floor(tiempo.value / 60)
  const seg = tiempo.value % 60
  return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`
})

function volverAlMenu() {
  emit('goToMenu')
}

onMounted(() => {
  intervaloTiempo = setInterval(() => {
    if (!juegoTerminado.value) tiempo.value++
  }, 1000)

  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
  document.addEventListener('pointerlockchange', onPointerLockChange)
  document.addEventListener('mousemove', onMouseMove)

  document.addEventListener('keydown', e => {
    if (e.code === 'Tab') {
      e.preventDefault()
      mostrarResumen.value = !mostrarResumen.value
    }
  })

  window.addEventListener('mousedown', e => {
    if (e.button === 0 && !props.paused && health.value > 0) shoot()
  })

  player = new THREE.Object3D()
  player.position.set(10.25, groundY, 0.5)
  scene.add(player)

  player.box = new THREE.Box3().setFromCenterAndSize(player.position, new THREE.Vector3(1, 2, 1))

  yawObject.position.copy(player.position)
  camera.position.set(0, -0.05, -0.25)

  loadBulletModel(() => console.log('✔ Bala cargada'))

  updateFunctions.push(() => {
    if (props.paused || health.value <= 0) return

    const delta = clock.getDelta()
    updateBullets(delta)

    const velocity = new THREE.Vector3()
    velocity.set(0, 0, 0)
    if (keys['w']) velocity.z -= 1
    if (keys['s']) velocity.z += 1
    if (keys['a']) velocity.x -= 1
    if (keys['d']) velocity.x += 1

    if (velocity.length() > 0) {
  velocity.normalize().multiplyScalar(speed)
  // Movimiento en dirección cardinal fija
  const direction = new THREE.Vector3(velocity.x, 0, velocity.z)
  const nextPos = player.position.clone().add(direction)
  const nextBox = new THREE.Box3().setFromCenterAndSize(nextPos, new THREE.Vector3(1, 2, 1))

      let collision = false
      if (Array.isArray(window.mapObstacles)) {
        for (const wallBox of window.mapObstacles) {
          if (nextBox.intersectsBox(wallBox)) {
            collision = true
            break
          }
        }
      }

      if (!collision) {
        player.position.copy(nextPos)
        yawObject.position.copy(player.position)
      }
    }

    if (keys[' '] && !isJumping) {
      verticalSpeed = 0.10
      isJumping = true
    }

    if (isJumping) {
      verticalSpeed += gravity
      player.position.y += verticalSpeed
      yawObject.position.y = player.position.y
      if (player.position.y <= groundY) {
        player.position.y = groundY
        yawObject.position.y = groundY
        verticalSpeed = 0
        isJumping = false
      }
    }

    if (window.mapLimits) {
      const { xMin, xMax, zMin, zMax } = window.mapLimits
      player.position.x = Math.max(xMin, Math.min(xMax, player.position.x))
      player.position.z = Math.max(zMin, Math.min(zMax, player.position.z))
    }
    player.position.y = Math.max(groundY, player.position.y)
    yawObject.position.copy(player.position)
    player.box.setFromCenterAndSize(player.position, new THREE.Vector3(1, 2, 1))
  })

  window.player = player
})

watch(health, async val => {
  if (val <= 0 && !rankingGuardado) {
    juegoTerminado.value = true
    speed = 0
    canBeHit = false
    window.stopSpawning = true
    clearInterval(intervaloTiempo)

    const puntaje = zombiesEliminados.value * 10 + tiempo.value
    try {
      await axios.post('http://localhost:3000/ranking', {
        nombreUsuario: nombreJugador,
        zombies: zombiesEliminados.value,
        tiempo: tiempo.value,
        puntaje
      })
      rankingGuardado = true
    } catch (err) {
      console.error('❌ Error al enviar ranking:', err)
    }
  }
})

window.incrementZombieKills = () => {
  zombiesEliminados.value++
  console.log('✅ Zombie eliminado. Total:', zombiesEliminados.value)
}

const healthColor = computed(() => {
  if (health.value > 60) return '#2ecc71'
  else if (health.value > 35) return '#f1c40f'
  else return '#e74c3c'
})

window.setPlayerHit = () => {
  if (!canBeHit || health.value <= 0) return
  gotHit.value = true
  health.value = Math.max(0, health.value - 5)
  canBeHit = false
  setTimeout(() => {
    gotHit.value = false
    canBeHit = true
  }, immunityTime)
}

window.getZombieKillFunction = () => zombiesEliminados

function loadBulletModel(cb) {
  const loader = new GLTFLoader()
  loader.load('/models/bala_bullet.glb', gltf => {
    bulletTemplate = gltf.scene
    bulletTemplate.scale.set(0.05, 0.05, 0.05)
    cb()
  })
}

function shoot() {
  if (!bulletTemplate || props.paused || health.value <= 0) return

  const bullet = bulletTemplate.clone(true)
  const offset = new THREE.Vector3(0, -0.05, -0.4)
  const worldPos = offset.applyMatrix4(camera.matrixWorld)
  bullet.position.copy(worldPos)

  const direction = new THREE.Vector3()
  camera.getWorldDirection(direction)
  bullet.direction = direction.normalize()
  bullet.speed = bulletSpeed
  bullet.distanceTravelled = 0

  bullet.box = new THREE.Box3().setFromCenterAndSize(bullet.position, new THREE.Vector3(0.5, 0.5, 0.5))
  bullet.boxHelper = new THREE.BoxHelper(bullet, 0xff0000)
  scene.add(bullet.boxHelper)

  scene.add(bullet)
  bullets.push(bullet)
  window.bullets = bullets

  shootSound.currentTime = 0
  shootSound.play()

  setTimeout(() => {
    if (scene.children.includes(bullet)) scene.remove(bullet)
    if (bullet.boxHelper) scene.remove(bullet.boxHelper)
    const i = bullets.indexOf(bullet)
    if (i !== -1) bullets.splice(i, 1)
  }, 4000)
}

function updateBullets(delta) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]
    const moveDistance = bullet.speed * delta
    bullet.position.addScaledVector(bullet.direction, moveDistance)
    bullet.distanceTravelled += moveDistance

    bullet.box.setFromCenterAndSize(bullet.position, new THREE.Vector3(0.5, 0.5, 0.5))
    if (bullet.boxHelper) bullet.boxHelper.update()

    if (bullet.distanceTravelled > 100) {
      scene.remove(bullet)
      if (bullet.boxHelper) scene.remove(bullet.boxHelper)
      bullets.splice(i, 1)
    }
  }
}

function enablePointerLock() {
  document.body.requestPointerLock?.()
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

function onKeyDown(e) { keys[e.key.toLowerCase()] = true }
function onKeyUp(e) { keys[e.key.toLowerCase()] = false }

const keys = {}
</script>

<style scoped>
.btn-volver {
  margin-top: 20px;
  background-color: black;
  color: white;
  padding: 10px 20px;
  border: 2px solid red;
  font-family: 'Creepster', cursive;
  cursor: pointer;
  font-size: 18px;
  border-radius: 8px;
  transition: 0.3s;
}

.btn-volver:hover {
  background-color: red;
  color: yellow;
}
</style>
