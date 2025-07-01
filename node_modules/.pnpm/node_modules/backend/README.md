# 🧠 Backend - Dead Rising

API Node.js con Express y MongoDB que permite:

- Registrar usuarios
- Iniciar sesión
- Guardar ranking al morir
- Recuperar datos de los mejores jugadores

## ⚙️ Configuración

Variables de entorno (`.env`):

```
MONGO_URI=mongodb://127.0.0.1:27017/testdb
JWT_SECRET=chokominto
```

## 🔧 Scripts

```bash
pnpm install
pnpm start
```

## 🧪 Test

```bash
pnpm test
```

## 🐳 Docker

Se levanta automáticamente junto a MongoDB mediante Docker Compose.
