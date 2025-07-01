import * as THREE from 'three'
import { camera } from '@/sceneGlobals'

const speed = 0.1
const gravity = -0.01
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

export function initMovement(scene, player) {
  if (initialized) return
  initialized = true

  yawObject.position.copy(player.position)
  scene.add(yawObject)

  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === document.body
  })

  document.addEventListener('mousemove', e => {
    if (!isPointerLocked) return
    const sensitivity = 0.002
    yawObject.rotation.y -= e.movementX * sensitivity
    pitchObject.rotation.x -= e.movementY * sensitivity
    pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitchObject.rotation.x))
  })

  document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true)
  document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false)

  window.addEventListener('click', () => {
    document.body.requestPointerLock?.()
  })
}

export function handleMovement(player) {
  const velocity = new THREE.Vector3()
  if (keys['w']) velocity.z -= 1
  if (keys['s']) velocity.z += 1
  if (keys['a']) velocity.x -= 1
  if (keys['d']) velocity.x += 1

  if (velocity.length() > 0) {
    velocity.normalize().multiplyScalar(speed)
    const direction = velocity.applyEuler(yawObject.rotation)
    const nextPos = player.position.clone().add(direction)
    player.position.copy(nextPos)
    yawObject.position.copy(player.position)
  }

  if (keys[' '] && !isJumping) {
    verticalSpeed = 0.12
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

  // Cámara fija en primera persona
  camera.position.set(0, 1.5, 0)
}
