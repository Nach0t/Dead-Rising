import * as THREE from 'three'
import { camera } from '@/sceneGlobals'

const speed = 5.0      // Velocidad basada en unidades por segundo
const gravity = -25.0  // Gravedad ajustada para delta time
let isJumping = false
let verticalSpeed = 0
const groundY = 0.4
const keys = {}

const pitchObject = new THREE.Object3D()
const yawObject = new THREE.Object3D()
pitchObject.add(camera)
yawObject.add(pitchObject)

let isPointerLocked = false
let initialized = false

// Referencias a los listeners para poder removerlos luego (limpieza de memoria)
let onPointerLockChange, onMouseMove, onKeyDown, onKeyUp, onClick

export function initMovement(scene, player) {
  if (initialized) return
  initialized = true

  yawObject.position.copy(player.position)
  scene.add(yawObject)

  onPointerLockChange = () => {
    isPointerLocked = document.pointerLockElement === document.body
  }
  document.addEventListener('pointerlockchange', onPointerLockChange)

  onMouseMove = e => {
    if (!isPointerLocked) return
    const sensitivity = 0.002
    yawObject.rotation.y -= e.movementX * sensitivity
    pitchObject.rotation.x -= e.movementY * sensitivity
    
    // Limitar la rotación vertical para no doblar el cuello de más
    const limit = Math.PI / 2 - 0.01
    pitchObject.rotation.x = Math.max(-limit, Math.min(limit, pitchObject.rotation.x))
  }
  document.addEventListener('mousemove', onMouseMove)

  onKeyDown = e => {
    if (e.code === 'Tab') return // Prevenir conflictos con la tecla Tab
    keys[e.key.toLowerCase()] = true
  }
  document.addEventListener('keydown', onKeyDown)

  onKeyUp = e => keys[e.key.toLowerCase()] = false
  document.addEventListener('keyup', onKeyUp)

  onClick = () => {
    if (!isPointerLocked) {
      document.body.requestPointerLock?.()
    }
  }
  window.addEventListener('click', onClick)
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

export function handleMovement(player, delta = 0.016, paused = false) {
  if (paused) return

  const inputVelocity = new THREE.Vector3()
  if (keys['w']) inputVelocity.z -= 1
  if (keys['s']) inputVelocity.z += 1
  if (keys['a']) inputVelocity.x -= 1
  if (keys['d']) inputVelocity.x += 1

  if (inputVelocity.lengthSq() > 0) {
    inputVelocity.normalize().multiplyScalar(speed * delta)
    const direction = inputVelocity.applyEuler(yawObject.rotation)

    // Colisión eje por eje para permitir deslizamiento en paredes
    const nextPosX = player.position.clone().add(new THREE.Vector3(direction.x, 0, 0))
    if (!checkObstacleCollision(nextPosX)) {
      player.position.x = nextPosX.x
    }

    const nextPosZ = player.position.clone().add(new THREE.Vector3(0, 0, direction.z))
    if (!checkObstacleCollision(nextPosZ)) {
      player.position.z = nextPosZ.z
    }

    yawObject.position.copy(player.position)
  }

  // Salto
  if (keys[' '] && !isJumping) {
    verticalSpeed = 7.5
    isJumping = true
  }

  // Gravedad y salto con Delta Time
  if (isJumping) {
    player.position.y += verticalSpeed * delta
    verticalSpeed += gravity * delta
    yawObject.position.y = player.position.y

    if (player.position.y <= groundY) {
      player.position.y = groundY
      yawObject.position.y = groundY
      verticalSpeed = 0
      isJumping = false
    }
  }

  // Límites del mapa si están definidos globalmente
  if (window.mapLimits) {
    const { xMin, xMax, zMin, zMax } = window.mapLimits
    player.position.x = Math.max(xMin, Math.min(xMax, player.position.x))
    player.position.z = Math.max(zMin, Math.min(zMax, player.position.z))
    yawObject.position.copy(player.position)
  }

  // Posición de la cámara en primera persona
  camera.position.set(0, 0.6, 0)
}

// Función para limpiar eventos al destruir la escena o volver al menú
export function destroyMovement(scene) {
  if (!initialized) return
  document.removeEventListener('pointerlockchange', onPointerLockChange)
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('click', onClick)

  scene.remove(yawObject)
  initialized = false
}