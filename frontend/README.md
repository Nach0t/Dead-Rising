# 🎮 Frontend - Dead Rising

Este es el frontend de **Dead Rising**, un FPS de supervivencia zombie. Desarrollado con **Vue 3** y **Three.js**, permite renderizar la escena 3D, controlar al jugador, interactuar con los zombies y sincronizar datos con el backend.

---

## 🚀 Funcionalidades principales

- Renderizado 3D con Three.js (zombies, escenario, jugador)
- Control de movimiento y disparos del jugador
- Interfaz HUD: vida, puntuación, munición
- Sistema de login y registro conectado al backend
- Consulta y envío de puntuación al ranking global
- Almacenamiento de sesión JWT

---

## 📁 Estructura del proyecto

```
frontend/
│
├── public/             # Archivos públicos (index.html, favicon)
├── src/
│   ├── main.js         # Inicialización de Vue y Three.js
│   ├── App.vue         # Componente raíz
│   ├── components/     # HUD, login, paneles, interfaz
│   ├── scenes/         # Código 3D (modelos, luces, cámara, lógica de juego)
│   ├── composables/    # Hooks Vue personalizados (useAuth, useGame)
│   ├── store/          # Pinia: auth, game state, config
│   ├── assets/         # Modelos, texturas, sonidos
│   ├── styles/         # Estilos globales y específicos
│   └── utils/          # Funciones auxiliares (fetch, debounce, cálculos)
├── .env.example        # Ejemplo de configuración
├── vite.config.js      # Configuración de Vite (build, alias, env)
└── package.json        # Scripts y dependencias
```

---

## ⚙️ Configuración

Crea un archivo `.env` en la carpeta `frontend/` con el siguiente contenido:

```
VITE_BACKEND_URL=http://localhost:8000
VITE_ASSETS_PATH=/assets/
```

Puedes adaptar `VITE_BACKEND_URL` si el backend corre en otro host/puerto o en producción.

---

## 🧩 Instalación

1. Asegúrate de tener Node.js y un gestor de paquetes (npm, yarn o pnpm)

2. Instala dependencias:

```bash
cd frontend
npm install
# o
yarn
# o
pnpm install
```

3. Copia y edita el archivo de entorno:

```bash
cp .env.example .env
```

---

## 💻 Scripts de desarrollo

```bash
npm run dev       # Ejecuta servidor de desarrollo (hot reload)
npm run build     # Compila el frontend para producción
npm run preview   # Previsualiza la build de producción
```

---

## 🌐 Integración con backend

- El frontend se comunica con el backend usando `fetch` y `axios`.
- Se envían credenciales a `/auth/login`, `/auth/register`, `/ranking`, etc.
- El token JWT se almacena en `localStorage` y se incluye en las cabeceras de las peticiones protegidas.
- `VITE_BACKEND_URL` controla la URL base de la API.

---

## 🧪 Test

Si el proyecto tiene configurado Jest o Vitest:

```bash
npm run test
```

---

## 🐳 Docker

Puedes dockerizar el frontend y backend juntos desde la raíz del proyecto. Ejemplo en `docker-compose.yml`:

```yaml
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

## 📌 Notas adicionales

- Puedes optimizar los modelos 3D y texturas para mejor rendimiento.
- Cambia el título del juego en `public/index.html`.
- Puedes personalizar controles y cámara en `scenes/engine.js`.
- Si se hospeda en un dominio distinto al backend, asegúrate de habilitar CORS.

---
