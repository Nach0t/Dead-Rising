<template>
  <div class="auth-container">
    <h1>INICIAR SESIÓN</h1>
    <form @submit.prevent="login" class="form-container">
      <input
        v-model="nombreUsuario"
        placeholder="Usuario"
        required
        class="input-zombie"
      />

      <div class="password-wrapper">
        <input
          :type="mostrarPass ? 'text' : 'password'"
          v-model="contraseña"
          placeholder="Contraseña"
          required
          class="input-zombie"
        />
        <span class="eye" @click="mostrarPass = !mostrarPass">👁️</span>
      </div>

      <p v-if="mensaje" class="message-zombie">{{ mensaje }}</p>

      <button type="submit" class="button-zombie submit">Entrar</button>
    </form>

    <button @click="cambiarARegistro" class="button-zombie small">
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

const login = async () => {
  mensaje.value = ''
  try {
    const res = await axios.post('http://localhost:3000/api/login', {
      nombreUsuario: nombreUsuario.value,
      contraseña: contraseña.value
    })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('nombreUsuario', nombreUsuario.value)
    emit('authenticated', nombreUsuario.value)
  } catch (err) {
    mensaje.value = err.response?.data?.error || 'Error al iniciar sesión'
  }
}

const cambiarARegistro = () => {
  nombreUsuario.value = ''
  contraseña.value = ''
  mensaje.value = ''
  emit('switchToRegister')
}
</script>
