<template>
  <div class="ranking-screen">
    <div class="top-bar">
      <span class="back-arrow" @click="$emit('volver')">🔙</span>
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
            <tr v-for="(j, i) in nivel.jugadores" :key="j._id">
              <td>{{ i + 1 }}</td>
              <td>{{ j.nombreUsuario }}</td>
              <td>{{ j.zombies }}</td>
              <td>{{ j.tiempo }}s</td>
              <td>{{ j.puntaje }}</td>
            </tr>
          </tbody>
        </table>

        <p v-else>No hay jugadores en este nivel.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const rankings = ref([])
const niveles = ref([
  { nombre: 'Don Pollo', jugadores: [] },
  { nombre: 'Evie', jugadores: [] },
  { nombre: 'Ruby-Chan', jugadores: [] },
  { nombre: 'Frances', jugadores: [] }
])

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/ranking')
    rankings.value = res.data

    for (const jugador of rankings.value) {
      const bloque = niveles.value.find(n => n.nombre === jugador.nivel)
      if (bloque) bloque.jugadores.push(jugador)
    }
  } catch (err) {
    console.error('Error al obtener rankings', err)
  }
})
</script>

<style scoped>
.ranking-screen {
  text-align: center;
  min-height: 100vh;
  background: url('/src/assets/zombie-menu.png') no-repeat center center/cover;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  box-sizing: border-box;
}

.top-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.back-arrow {
  position: absolute;
  left: 10px;
  font-size: 1.8rem;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease;
}
.back-arrow:hover {
  transform: scale(1.2);
}

.ranking-screen h1 {
  font-family: 'Creepster', cursive;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 2px 2px 6px black;
}

.ranking-scroll {
  width: 100%;
  max-width: 900px;
  max-height: 75vh;
  overflow-y: auto;
  padding-right: 8px;
}

.ranking-scroll::-webkit-scrollbar {
  width: 8px;
}
.ranking-scroll::-webkit-scrollbar-thumb {
  background: red;
  border-radius: 5px;
}
.ranking-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.ranking-bloque {
  margin: 1.2rem auto;
  padding: 1rem;
  border: 2px solid red;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.7);
  box-shadow: 0 0 12px red;
  width: 90%;
  max-width: 700px;
}

.ranking-bloque h2 {
  font-family: 'Creepster', cursive;
  font-size: 1.7rem;
  margin-bottom: 0.8rem;
  color: gold;
}

table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 0.4rem;
  border: 1px solid red;
}
th {
  background-color: darkred;
}
</style>
