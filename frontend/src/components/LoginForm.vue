<template>
  <div class="auth-container">
    <h1>INICIAR SESIÓN</h1>
    <form @submit.prevent="login" class="form-container">
      <input
        v-model="nombreUsuario"
        placeholder="Usuario"
        required
        class="input-zombie"
        :disabled="loading"
      />

      <div class="password-wrapper">
        <input
          :type="mostrarPass ? 'text' : 'password'"
          v-model="contraseña"
          placeholder="Contraseña"
          required
          class="input-zombie"
          :disabled="loading"
        />
        <span 
          class="eye" 
          @click="mostrarPass = !mostrarPass"
          role="button"
          aria-label="Mostrar u ocultar contraseña"
        >👁️</span>
      </div>

      <p v-if="mensaje" class="message-zombie">{{ mensaje }}</p>

      <button type="submit" class="button-zombie submit" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <button @click="cambiarARegistro" class="button-zombie small" :disabled="loading">
      ¿No tienes cuenta? Regístrate
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits(['authenticated', 'switchToRegister'])

const nombreUsuario = ref('')
const contraseña = ref('')
const mensaje = ref('')
const mostrarPass = ref(false)
const loading = ref(false)

const login = async () => {
  if (loading.value) return
  mensaje.value = ''
  loading.value = true

  try {
    const usuarioLimpio = nombreUsuario.value.trim()
    const res = await axios.post('http://localhost:3000/api/login', {
      nombreUsuario: usuarioLimpio,
      contraseña: contraseña.value
    })

    localStorage.setItem('token', res.data.token)
    localStorage.setItem('nombreUsuario', usuarioLimpio)
    emit('authenticated', usuarioLimpio)
  } catch (err) {
    mensaje.value = err.response?.data?.error || 'Error al conectar con el servidor'
  } finally {
    loading.value = false
  }
}

const cambiarARegistro = () => {
  nombreUsuario.value = ''
  contraseña.value = ''
  mensaje.value = ''
  emit('switchToRegister')
}
</script>