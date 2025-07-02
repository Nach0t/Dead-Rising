# 🧠 Backend - Dead Rising

Este es el backend de **Dead Rising**, un juego FPS de supervivencia zombie. Esta API fue desarrollada usando **FastAPI**, y se encarga de gestionar usuarios, autenticación, rankings y puntuaciones.

---

## 🚧 Funcionalidades principales

- 📥 Registro de nuevos jugadores
- 🔐 Inicio de sesión con autenticación JWT
- 🧠 Consulta del perfil de jugador autenticado
- 🏆 Envío y consulta de puntajes para el ranking global
- ✅ Validación de datos con Pydantic
- 🗄️ Persistencia de datos usando SQLite y SQLAlchemy

---

## 📁 Estructura del proyecto

```
backend/
│
├── main.py              # Punto de entrada principal
├── database.py          # Conexión y configuración de la base de datos
├── models/              # Modelos de base de datos con SQLAlchemy
├── schemas/             # Esquemas Pydantic para validar datos
├── routes/              # Archivos con endpoints divididos por funcionalidad
├── auth/                # Funciones de seguridad y generación de tokens JWT
├── utils/               # Funciones auxiliares para distintos módulos
├── requirements.txt     # Dependencias del backend
└── .env (opcional)      # Variables de entorno
```

---

## ⚙️ Configuración

Puedes configurar el backend mediante un archivo `.env` en la carpeta `backend/`. Ejemplo:

```
DATABASE_URL=sqlite:///./database.db
JWT_SECRET=tu_clave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

- Si no configuras `.env`, se utilizarán valores por defecto.
- Puedes cambiar SQLite por PostgreSQL modificando `DATABASE_URL`.

---

## 🔧 Cómo ejecutar el backend

1. Clona el repositorio:

```bash
git clone https://github.com/Nach0t/Dead-Rising.git
cd Dead-Rising/backend
```

2. (Opcional) Crea y activa un entorno virtual:

```bash
python -m venv venv
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

3. Instala las dependencias:

```bash
pip install -r requirements.txt
```

4. Ejecuta el servidor:

```bash
python main.py
```

---

## 🌐 Acceso a la API

Una vez iniciado el servidor, puedes acceder desde:

- Swagger UI (documentación interactiva):
  http://127.0.0.1:8000/docs
- Redoc (documentación alternativa):
  http://127.0.0.1:8000/redoc
- OpenAPI (JSON):
  http://127.0.0.1:8000/openapi.json

---

## 🧪 Test

Para ejecutar los tests (si hay una carpeta `tests/` configurada):

```bash
pytest tests/
```

---

## 🐳 Docker

Puedes levantar el backend automáticamente usando Docker Compose (desde la raíz del proyecto):

```bash
docker compose up --build
```

Esto:

- Instala dependencias automáticamente
- Levanta el servidor con FastAPI
- Usa SQLite como base de datos por defecto

---

## 🔐 Endpoints principales

- `POST /auth/register` → Registrar nuevo usuario
- `POST /auth/login` → Iniciar sesión y obtener token JWT
- `GET /me` → Ver datos del jugador autenticado
- `POST /ranking` → Enviar puntuación
- `GET /ranking` → Ver ranking global

---

## 📦 Recomendaciones

- Usa SQLite solo en desarrollo. Para producción, cambia a PostgreSQL o MySQL.
- Mantén el archivo `.env` fuera del control de versiones (usa `.gitignore`).
- Siempre valida los datos en `schemas/` antes de operar con la base de datos.

---
