<template>
  <div class="auth-container">
    <h1>REGISTRO</h1>
    <form @submit.prevent="register">
      <input
        v-model="nombreUsuario"
        placeholder="Usuario"
        class="input-zombie"
        required
        :disabled="loading"
      />

      <div class="password-wrapper">
        <input
          :type="mostrarPass ? 'text' : 'password'"
          v-model="contraseña"
          placeholder="Contraseña"
          class="input-zombie"
          minlength="6"
          maxlength="12"
          required
          :disabled="loading"
        />
        <span 
          class="eye" 
          @click="mostrarPass = !mostrarPass"
          role="button"
          aria-label="Mostrar u ocultar contraseña"
        >👁️</span>
      </div>

      <div class="requirements">
        Requisitos: *Una mayúscula. *Una minúscula. *Un número. <br />
        Mínimo 6 y máximo 12 caracteres.
      </div>

      <div class="password-wrapper">
        <input
          :type="mostrarPassConfirm ? 'text' : 'password'"
          v-model="confirmarContraseña"
          placeholder="Confirmar contraseña"
          class="input-zombie"
          minlength="6"
          maxlength="12"
          required
          :disabled="loading"
        />
        <span 
          class="eye" 
          @click="mostrarPassConfirm = !mostrarPassConfirm"
          role="button"
          aria-label="Mostrar u ocultar confirmación de contraseña"
        >👁️</span>
      </div>

      <p v-if="mensaje" class="message-zombie">{{ mensaje }}</p>

      <button type="submit" class="button-zombie submit" :disabled="loading">
        {{ loading ? 'Registrando...' : 'Registrar' }}
      </button>
    </form>

    <button @click="cambiarAVistaLogin" class="button-zombie small" :disabled="loading">
      ¿Ya tienes cuenta? Inicia sesión
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const emit = defineEmits(['authenticated', 'switchToLogin'])

const nombreUsuario = ref('')
const contraseña = ref('')
const confirmarContraseña = ref('')
const mensaje = ref('')
const mostrarPass = ref(false)
const mostrarPassConfirm = ref(false)
const loading = ref(false)

// Limpiar mensaje de error al escribir en cualquier campo
watch([nombreUsuario, contraseña, confirmarContraseña], () => {
  if (mensaje.value) mensaje.value = ''
})

const validarContraseña = (pass) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,12}$/
  return regex.test(pass)
}

const register = async () => {
  if (loading.value) return
  mensaje.value = ''

  if (contraseña.value !== confirmarContraseña.value) {
    mensaje.value = 'Las contraseñas no coinciden'
    return
  }

  if (!validarContraseña(contraseña.value)) {
    mensaje.value = 'La contraseña no cumple los requisitos'
    return
  }

  loading.value = true

  try {
    const usuarioLimpio = nombreUsuario.value.trim()
    const res = await axios.post('/api/register', {
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

const cambiarAVistaLogin = () => {
  nombreUsuario.value = ''
  contraseña.value = ''
  confirmarContraseña.value = ''
  mensaje.value = ''
  emit('switchToLogin')
}
</script>