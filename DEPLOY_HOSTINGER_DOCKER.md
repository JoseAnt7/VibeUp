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

## 4b) Deploy automático con GitHub Actions (sin Docker Hub)

El workflow `.github/workflows/deploy-vps.yml` hace solo esto en el VPS:

1. `cd` a la carpeta del proyecto (`VPS_DEPLOY_PATH`).
2. `git checkout` y `git pull` de la **misma rama** que disparó el workflow (`main` o `docker`, según el push).
3. `docker compose up -d --build` (compila en el servidor, sin subir imágenes a ningún registro).

### Secretos en GitHub (Settings → Secrets and variables → Actions)

| Secreto | Obligatorio | Descripción |
|--------|-------------|-------------|
| `VPS_HOST` | Sí | IP o dominio del VPS |
| `VPS_USER` | Sí | Usuario SSH (ej. `root`) |
| `VPS_SSH_PRIVATE_KEY` | Sí | Contenido completo de la clave **privada** (ej. `id_ed25519`) |
| `VPS_DEPLOY_PATH` | Sí | Ruta absoluta al repo en el VPS (ej. `/root/VibeUp`) |
| `VPS_SSH_KEY_PASSPHRASE` | No | Solo si tu clave privada tiene frase de paso |

### Requisitos en el VPS (una sola vez)

- Repo clonado en `VPS_DEPLOY_PATH` con el mismo remoto que GitHub (HTTPS o SSH).
- El usuario SSH debe poder ejecutar `docker` y `docker compose` (grupo `docker` o `sudo`).
- `git pull` sin pedir contraseña: por ejemplo clave SSH de **deploy** añadida en GitHub (Deploy keys) o credencial guardada en el servidor.

### Rama del workflow

Se dispara con **push a `main` o `docker`**. En el VPS se hace `checkout` y `pull` de esa misma rama. Si quieres otras ramas, edita `branches:` en `deploy-vps.yml`.

---

## 5) HTTPS (producción)

Para HTTPS delante del puerto 80, usa Nginx en el host, Traefik o Cloudflare con certificados.

---

## Notas

- El frontend llama a `/api/...` y Nginx en el contenedor `frontend` hace proxy al backend.
