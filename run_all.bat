@echo off
setlocal
title Dead Rising - Launcher

REM Ejecutar siempre desde la carpeta del repositorio, aunque el BAT se abra desde otro lugar.
cd /d "%~dp0"
if errorlevel 1 (
  echo [ERROR] No se pudo acceder a la carpeta del proyecto.
  pause
  exit /b 1
)

REM Comprobar dependencias necesarias.
where docker >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Docker no esta instalado o no esta en PATH.
  pause
  exit /b 1
)
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js no esta instalado o no esta en PATH.
  pause
  exit /b 1
)
where pnpm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] pnpm no esta instalado. Instala pnpm con: npm install -g pnpm
  pause
  exit /b 1
)

echo.
echo [1/3] Iniciando MongoDB en Docker...
pushd "%~dp0backend\docker"
if errorlevel 1 (
  echo [ERROR] No se encuentra backend\docker.
  pause
  exit /b 1
)
docker compose up -d
if errorlevel 1 (
  popd
  echo [ERROR] No se pudo iniciar MongoDB. Comprueba que Docker Desktop este abierto.
  pause
  exit /b 1
)
popd

echo.
echo [2/3] Instalando e iniciando el backend...
pushd "%~dp0backend"
if errorlevel 1 (
  echo [ERROR] No se encuentra la carpeta backend.
  pause
  exit /b 1
)
call pnpm install
if errorlevel 1 (
  popd
  echo [ERROR] Fallo la instalacion de dependencias del backend.
  pause
  exit /b 1
)

REM El backend corre en Windows, por eso MongoDB debe apuntar al puerto publicado en localhost,
REM no al hostname "mongo", que solo existe dentro de la red de Docker.
start "Dead Rising Backend" cmd /k "set MONGO_URI=mongodb://127.0.0.1:27017/dead_rising&&set JWT_SECRET=chokominto&&pnpm start"
popd

echo.
echo [3/3] Instalando e iniciando el frontend...
pushd "%~dp0frontend"
if errorlevel 1 (
  echo [ERROR] No se encuentra la carpeta frontend.
  pause
  exit /b 1
)
call pnpm install
if errorlevel 1 (
  popd
  echo [ERROR] Fallo la instalacion de dependencias del frontend.
  pause
  exit /b 1
)
start "Dead Rising Frontend" cmd /k "pnpm run dev"
popd

echo.
echo [OK] Lanzamiento iniciado.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo API:      http://localhost:3000
echo.
echo Para detener el juego, cierra las ventanas de backend y frontend.
echo MongoDB sigue en Docker; para pararlo, ejecuta docker compose down desde backend\docker.
pause
