<template>
  <div class="auth-container">
    <h1>REGISTRO</h1>
    <form @submit.prevent="register">
      <input v-model="nombreUsuario" placeholder="Usuario" class="input-zombie" required />

      <div class="password-wrapper">
        <input
          :type="mostrarPass ? 'text' : 'password'"
          v-model="contraseña"
          placeholder="Contraseña"
          class="input-zombie"
          minlength="6"
          maxlength="12"
          required
        />
        <span class="eye" @click="mostrarPass = !mostrarPass">👁️</span>
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
        />
        <span class="eye" @click="mostrarPassConfirm = !mostrarPassConfirm">👁️</span>
      </div>

      <p v-if="mensaje" class="message-zombie">{{ mensaje }}</p>

      <button type="submit" class="button-zombie submit">Registrar</button>
    </form>

    <button @click="cambiarAVistaLogin" class="button-zombie small">
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

// Limpiar al cambiar a esta vista
watch(() => nombreUsuario.value, () => mensaje.value = '')
watch(() => contraseña.value, () => mensaje.value = '')
watch(() => confirmarContraseña.value, () => mensaje.value = '')

const validarContraseña = (pass) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,12}$/
  return regex.test(pass)
}

const register = async () => {
  mensaje.value = ''

  if (contraseña.value !== confirmarContraseña.value) {
    mensaje.value = 'Las contraseñas no coinciden'
    return
  }

  if (!validarContraseña(contraseña.value)) {
    mensaje.value = 'La contraseña no cumple los requisitos'
    return
  }

  try {
    const res = await axios.post('http://localhost:3000/api/register', {
      nombreUsuario: nombreUsuario.value,
      contraseña: contraseña.value
    })

    localStorage.setItem('token', res.data.token)
    emit('authenticated')
  } catch (err) {
    mensaje.value = err.response?.data?.error || 'Error al registrar'
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
