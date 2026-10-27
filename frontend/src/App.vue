<template>
  <div id="app">
    <!-- Intro Video -->
    <div v-if="showIntro" class="intro-video">
      <video ref="introVideo" @ended="onIntroEnd" class="video-element" playsinline>
        <source src="/video/intro.mp4" type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </video>
    </div>

    <!-- Login/Register -->
    <div v-else-if="!isAuthenticated" class="menu">
      <LoginForm
        v-if="showLogin"
        @authenticated="onAuthenticated"
        @switchToRegister="showLogin = false"
      />
      <RegisterForm
        v-else
        @authenticated="onAuthenticated"
        @switchToLogin="showLogin = true"
      />
    </div>

    <!-- Menú principal -->
    <div v-else-if="showMenu" class="menu">
      <div class="welcome-message">¡Bienvenido, {{ nombreUsuario }}!</div>
      <h1>Dead Rising</h1>
      <div class="menu-buttons">
        <button @click="startGame">Iniciar</button>
        <button @click="toggleInstructions">¿Cómo jugar?</button>
        <button @click="mostrarRanking">🏆 Ver Ranking</button>
        <button @click="logout" class="logout-button">Cerrar sesión</button>
      </div>
      <div v-if="showInstructions" class="instructions">
        <p>🧟 Usa <b>W, A, S, D</b> para moverte, click izquierdo para disparar.</p>
        <p>🎯 ¡Evita que los zombies te toquen o perderás vida!</p>
      </div>
    </div>

    <!-- Vista de Ranking -->
    <Ranking v-else-if="showRanking" @volver="volverMenu" />

    <!-- Juego -->
    <GameScene v-else @goToMenu="returnToMenu" />

    <!-- Botón "Volver al inicio" al morir -->
    <div v-if="muerto" class="death-overlay">
      <button class="btn-back-menu" @click="returnToMenu">Volver al inicio</button>
    </div>
  </div>
</template>

<script>
import GameScene from '@/components/GameScene.vue'
import LoginForm from '@/components/LoginForm.vue'
import RegisterForm from '@/components/RegisterForm.vue'
import Ranking from '@/components/Ranking.vue'
import { renderer, scene, camera, updateFunctions } from './sceneGlobals'

export default {
  name: 'App',
  components: { GameScene, LoginForm, RegisterForm, Ranking },
  data() {
    return {
      showIntro: true,
      showMenu: false,
      showLogin: true,
      showInstructions: false,
      showRanking: false,
      isAuthenticated: false,
      nombreUsuario: '',
      animationFrameId: null,
      enterHoldStart: null,
      enterHoldTimeout: null,
      muerto: false,
      
      // Referencias para remover listeners limpiamente
      handleKeyDownGlobal: null,
      handleKeyUpGlobal: null,
      playVideoWithSoundOnce: null
    }
  },
  methods: {
    onAuthenticated(nombre) {
      this.nombreUsuario = nombre || 'Jugador'
      localStorage.setItem('nombreUsuario', this.nombreUsuario)
      this.isAuthenticated = true
      this.showMenu = true
    },
    logout() {
      this.isAuthenticated = false
      this.showMenu = false
      this.showLogin = true
      this.nombreUsuario = ''
      localStorage.removeItem('nombreUsuario')
    },
    onIntroEnd() {
      this.showIntro = false
    },
    skipIntro() {
      const video = this.$refs.introVideo
      if (video) {
        video.pause()
        video.currentTime = 0
      }
      this.onIntroEnd()
    },
    startGame() {
      this.showMenu = false
    },
    toggleInstructions() {
      this.showInstructions = !this.showInstructions
    },
    mostrarRanking() {
      this.showMenu = false
      this.showRanking = true
    },
    volverMenu() {
      this.showRanking = false
      this.showMenu = true
    },
    returnToMenu() {
      this.showMenu = true
      this.muerto = false
      window.stopSpawning = false
      window.muerto = false
    }
  },
  mounted() {
    const guardado = localStorage.getItem('nombreUsuario')
    if (guardado) {
      this.nombreUsuario = guardado
      this.isAuthenticated = true
      this.showMenu = true
    }

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate)
      
      for (let i = 0; i < updateFunctions.length; i++) {
        updateFunctions[i]()
      }

      try {
        renderer.render(scene, camera)
      } catch (e) {
        console.error('Render error:', e)
      }

      if (window.muerto && !this.muerto) {
        this.muerto = true
      }
    }
    animate()

    const video = this.$refs.introVideo
    this.playVideoWithSoundOnce = () => {
      if (video) {
        video.muted = false
        video.volume = 1.0
        video.play().catch(e => console.warn('Autoplay failed:', e))
      }
      window.removeEventListener('keydown', this.playVideoWithSoundOnce)
      window.removeEventListener('mousedown', this.playVideoWithSoundOnce)
    }

    window.addEventListener('keydown', this.playVideoWithSoundOnce)
    window.addEventListener('mousedown', this.playVideoWithSoundOnce)

    this.handleKeyDownGlobal = e => {
      if (e.key === 'Enter' && !this.enterHoldStart) {
        this.enterHoldStart = Date.now()
        this.enterHoldTimeout = setTimeout(() => {
          if (this.showIntro) this.skipIntro()
        }, 5000)
      }

      if (e.key === 'Escape' && this.muerto) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    this.handleKeyUpGlobal = e => {
      if (e.key === 'Enter') {
        this.enterHoldStart = null
        clearTimeout(this.enterHoldTimeout)
      }
    }

    window.addEventListener('keydown', this.handleKeyDownGlobal)
    window.addEventListener('keyup', this.handleKeyUpGlobal)
  },
  beforeUnmount() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId)

    if (this.handleKeyDownGlobal) window.removeEventListener('keydown', this.handleKeyDownGlobal)
    if (this.handleKeyUpGlobal) window.removeEventListener('keyup', this.handleKeyUpGlobal)
    if (this.playVideoWithSoundOnce) {
      window.removeEventListener('keydown', this.playVideoWithSoundOnce)
      window.removeEventListener('mousedown', this.playVideoWithSoundOnce)
    }

    updateFunctions.length = 0
    while (scene.children.length > 0) {
      const obj = scene.children[0]
      scene.remove(obj)
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        Array.isArray(obj.material)
          ? obj.material.forEach(m => m.dispose())
          : obj.material.dispose()
      }
    }
    renderer.dispose()
  }
}
</script>