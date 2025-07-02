# 🧠 Backend - Dead Rising

Este es el backend de **Dead Rising**, un juego FPS de supervivencia zombie. Desarrollado en **Node.js** con **Express** y **MongoDB**, gestiona el sistema de autenticación, ranking de jugadores y almacenamiento de estadísticas.

---

## 🚀 Funcionalidades principales

- Registro e inicio de sesión con JWT
- Almacenamiento de jugadores, puntuaciones y estadísticas en MongoDB
- Consulta del ranking global
- Middleware de autenticación
- API REST con rutas protegidas y públicas


---

## ⚙️ Variables de entorno

Asegúrate de crear un archivo `.env` en `backend/` con lo siguiente:

```
MONGO_URI=mongodb://127.0.0.1:27017/testdb
JWT_SECRET=chokominto
```

---

## 🧪 Cómo ejecutar

1. Clona el repositorio:

```bash
git clone https://github.com/Nach0t/Dead-Rising.git
cd Dead-Rising/backend
```

2. Instala dependencias:

```bash
pnpm install
# o
npm install
```

3. Ejecuta el backend:

```bash
pnpm start
# o
npm start
```

---

## 🧪 Tests

Si tienes configurado Jest o Vitest:

```bash
pnpm test
# o
npm test
```

---

## 🐳 Docker (opcional)

Puedes levantar el backend con MongoDB usando Docker Compose desde la raíz del proyecto:

```bash
docker compose up --build
```

---

## 🔐 Endpoints principales

- `POST /register` → Registro de nuevo jugador
- `POST /login` → Login y obtención de token
- `GET /me` → Información del jugador autenticado
- `POST /ranking` → Envío de puntuación
- `GET /ranking` → Consulta del ranking global

---

## 📌 Notas

- Usa `pnpm` para compatibilidad con el entorno de CI/CD.
- Asegúrate de que MongoDB esté corriendo o usa Docker.
- El backend corre por defecto en `http://localhost:3000/`.
