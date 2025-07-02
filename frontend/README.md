# 🎮 Frontend - Dead Rising

Este es el frontend de **Dead Rising**, un FPS de supervivencia zombie. Desarrollado con **Vue 3** y **Three.js**, permite renderizar una escena 3D inmersiva, controlar al jugador, interactuar con zombies y sincronizar datos con el backend.

---

## 🚀 Funcionalidades principales

- Renderizado 3D con **Three.js** (escenario, zombies, jugador)
- Control en primera persona con mouse y teclado
- Disparo y detección de colisiones
- HUD con vida, tiempo, puntuación y ranking
- Sistema de login y registro con token JWT
- Envío de estadísticas al backend (ranking global)

---

## 📁 Estructura del proyecto

```
frontend/
│
├── public/             # Archivos públicos (index.html, favicon)
├── src/
│   ├── main.js         # Inicialización de Vue
│   ├── App.vue         # Componente raíz del juego
│   ├── components/     # HUD, menús, login/registro
│   ├── scenes/         # Lógica 3D y motor del juego
│   ├── composables/    # Hooks reutilizables (auth, juego)
│   ├── store/          # Estado global (Pinia)
│   ├── assets/         # Modelos, texturas, sonidos
│   ├── styles/         # Estilos globales
│   └── utils/          # Funciones auxiliares (fetch, lógica)
├── .env.example        # Archivo de ejemplo con variables de entorno
├── vite.config.js      # Configuración de Vite
└── package.json        # Scripts y dependencias
```

---

## 🧩 Instalación local

1. **Clona el repositorio**:

```bash
git clone https://github.com/Nach0t/Dead-Rising.git
cd Dead-Rising/frontend
```

2. **Instala las dependencias**:

```bash
pnpm install
# o alternativamente
npm install
```

3. **Configura las variables de entorno**:

```bash
cp .env.example .env
```

Edita `.env` si el backend corre en otra URL/puerto:

```env
VITE_BACKEND_URL=http://localhost:8000
VITE_ASSETS_PATH=/assets/
```

4. **Lanza el servidor de desarrollo**:

```bash
pnpm run dev
# o
npm run dev
```

Esto abrirá la app en `http://localhost:5173/`

---

## 💻 Scripts disponibles

```bash
pnpm run dev       # Servidor de desarrollo (hot reload)
pnpm run build     # Build de producción
pnpm run preview   # Previsualización de la build
pnpm run test      # Ejecuta tests si están configurados
```

---

## 🐳 Docker (opcional)

Puedes lanzar frontend y backend juntos con `docker compose`:

```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    env_file: ./frontend/.env
    depends_on:
      - backend
```

```bash
docker compose up --build
```

---

## 🌐 Comunicación con backend

- Se usan `axios` y `fetch` para las peticiones.
- JWT se guarda en `localStorage` y se envía en las cabeceras.
- Endpoints clave:
  - `/auth/login`, `/auth/register`
  - `/ranking`, `/game/score`

---

## 📌 Notas adicionales

- Asegúrate de que el backend esté corriendo antes de iniciar el frontend.
- Si cambias el dominio o puerto, edita `VITE_BACKEND_URL`.
- Si usas un servidor externo, configura CORS en el backend.
- Puedes personalizar controles, sensibilidad y cámara en `scenes/`.
