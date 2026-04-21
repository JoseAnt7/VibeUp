# Despliegue en VPS (Hostinger) - React + Flask + MySQL con Docker

## Qué incluye este repo

- `docker-compose.yml`: **MySQL** + **backend** y **frontend** construidos con `build:` (sin Docker Hub).
- Volumen `mysql_data` para persistir la base de datos.

Actualizar el código en el servidor:

```bash
docker compose up -d --build
```

El volumen de MySQL **no se borra** con ese comando (solo se recrean contenedores cuando cambia la imagen o la definición).

---

## 1) Requisitos

- Docker Engine + Docker Compose.
- Puerto `80` abierto.

---

## 2) Primera vez

```bash
cd /ruta/al/proyecto
cp .env.example .env
cp backend/.env.example backend/.env
```

Edita `.env` (raíz): credenciales MySQL (`MYSQL_*`).

Edita `backend/.env`: `JWT_SECRET_KEY`, `APP_PUBLIC_URL`, correo si aplica.

Levantar:

```bash
docker compose up -d --build
```

---

## 3) Actualizar tras cambios en el código

```bash
git pull
docker compose up -d --build
```

---

## 4) Hostinger Docker Manager

Si el panel solo hace **pull** de imágenes y no ejecuta `build`, puede fallar con servicios que usan `build:`.
En ese caso despliega por **SSH** en el VPS con los comandos de arriba, o usa otro flujo que permita build.

---

## 5) HTTPS (producción)

Para HTTPS delante del puerto 80, usa Nginx en el host, Traefik o Cloudflare con certificados.

---

## Notas

- El frontend llama a `/api/...` y Nginx en el contenedor `frontend` hace proxy al backend.
