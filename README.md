# 🧟 Dead Rising - Zombie Survival FPS

**Dead Rising** es un juego en primera persona desarrollado con Vue y Three.js. El jugador debe sobrevivir lo máximo posible eliminando zombies y gestionando su salud.

## 📦 Estructura del proyecto

- `frontend/` - Interfaz del juego en Vue 3 + Three.js
- `backend/` - API Node.js con MongoDB para guardar ranking y usuarios
- `tests/` - Pruebas unitarias y de integración
- `.github/workflows/` - CI con Teorema de la Caja: Testear, Construir, Publicar

## 🚀 Ejecución

Puedes ejecutar el proyecto directamente con:

```bash
./run_all.sh
```

En Windows:

```bat
run_all.bat
```

O bien manualmente:

```bash
pnpm install
pnpm dev
```

## 🐳 Docker

```bash
docker compose up --build
```

## 🧪 Test

```bash
pnpm test
```

## ✍️ Autores

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://github.com/Nach0t" target="_blank">
          <img src="https://github.com/Nach0t.png" width="100" style="border-radius:50%" alt="Nach0t"/><br />
          <sub><b>Ignacio Rehbein</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/fernando200317" target="_blank">
          <img src="https://github.com/fernando200317.png" width="100" style="border-radius:50%" alt="fernando200317"/><br />
          <sub><b>Fernando Rivera</b></sub>
        </a>
      </td>
    </tr>
  </table>
</div>
