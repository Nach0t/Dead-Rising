<template>
  <div class="ranking-screen">
    <div class="top-bar">
      <span class="back-arrow" @click="$emit('volver')" role="button" aria-label="Volver">🔙</span>
      <h1>🏆 Ranking por Nivel</h1>
    </div>

    <div class="ranking-scroll">
      <div
        v-for="nivel in niveles"
        :key="nivel.nombre"
        class="ranking-bloque"
      >
        <h2>{{ nivel.nombre }}</h2>

        <table v-if="nivel.jugadores.length">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>Zombies</th>
              <th>Tiempo</th>
              <th>Puntaje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(j, i) in nivel.jugadores" :key="j._id || i">
              <td>{{ i + 1 }}</td>
              <td>{{ j.nombreUsuario }}</td>
              <td>{{ j.zombies }}</td>
              <td>{{ j.tiempo }}s</td>
              <td>{{ j.puntaje }}</td>
            </tr>
          </tbody>
        </table>

        <p v-else class="no-players">No hay jugadores en este nivel.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const emit = defineEmits(['volver'])

const niveles = ref([
  { nombre: 'Don Pollo', jugadores: [] },
  { nombre: 'Evie', jugadores: [] },
  { nombre: 'Ruby-Chan', jugadores: [] },
  { nombre: 'Frances', jugadores: [] }
])

onMounted(async () => {
  try {
    const res = await axios.get('/ranking')
    const rankings = res.data

    // Distribuir jugadores en sus respectivos niveles
    for (const jugador of rankings) {
      const bloque = niveles.value.find(n => n.nombre === jugador.nivel)
      if (bloque) {
        bloque.jugadores.push(jugador)
      }
    }

    // Ordenar de mayor a menor puntaje en cada nivel
    niveles.value.forEach(nivel => {
      nivel.jugadores.sort((a, b) => b.puntaje - a.puntaje)
    })
  } catch (err) {
    console.error('❌ Error al obtener rankings:', err)
  }
})
</script>