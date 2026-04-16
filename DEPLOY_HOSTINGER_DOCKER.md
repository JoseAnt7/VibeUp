# Despliegue en VPS (Hostinger) - React + Flask + MySQL con Docker

## Qué incluye este repo

- `docker-compose.yml`: **producción** — backend y frontend solo con `image:` (pull desde Docker Hub).
- `docker-compose.local.yml`: **desarrollo local** — añade `build:` para compilar sin subir imágenes.
- `.github/workflows/deploy-docker.yml`: al hacer **push a la rama `docker`**, construye imágenes, las sube a Docker Hub y despliega en el VPS por SSH.

El volumen `mysql_data` no se borra con `docker compose pull` / `up -d` (solo recrea contenedores que cambian).

---

## 1) Requisitos en el VPS

- Docker Engine + plugin Docker Compose.
- Puerto `80` abierto.
- Repositorio Git clonado en una carpeta fija (ej. `/home/tuusuario/vibeup`).
- Rama `docker` disponible en el remoto (es la que usa el workflow).

---

## 2) Primera vez en el VPS (manual)

```bash
cd /ruta/donde/clonas
git clone -b docker https://github.com/TU_ORG/TU_REPO.git .
# o: git clone ... && git checkout docker

cp .env.example .env
cp backend/.env.example backend/.env
```

Edita `.env` en la raíz:

- `BACKEND_IMAGE` y `FRONTEND_IMAGE`: mismo formato que en Docker Hub, por ejemplo `miusuario/vibeup-backend:latest` y `miusuario/vibeup-frontend:latest`.
- Credenciales MySQL (`MYSQL_*`).

Edita `backend/.env`:

- `JWT_SECRET_KEY`, `APP_PUBLIC_URL`, correo si aplica.

Levantar (tras el primer push que haya publicado las imágenes):

```bash
docker compose pull
docker compose up -d
```

---

## 3) Desarrollo en tu PC (sin Docker Hub)

Compilar todo en local:

```bash
cp .env.example .env
# Pon BACKEND_IMAGE=vibeup-backend:local y FRONTEND_IMAGE=vibeup-frontend:local (o similar)

docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

---

## 4) CI/CD automático (rama `docker`)

Cada **push a `docker`** dispara el workflow:

1. Build + push a Docker Hub: `TU_USUARIO/vibeup-backend:latest` y `TU_USUARIO/vibeup-frontend:latest`.
2. SSH al VPS: `git pull` en la rama `docker`, `docker compose pull`, `docker compose up -d`.

### Secretos en GitHub (Settings → Secrets and variables → Actions)

| Secreto | Descripción |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | Token de acceso (no la contraseña; créalo en Docker Hub → Account Settings → Security) |
| `VPS_HOST` | IP o dominio del VPS |
| `VPS_USER` | Usuario SSH (ej. `root` o `deploy`) |
| `VPS_SSH_PRIVATE_KEY` | Contenido completo de la clave **privada** (la que corresponde a la pública en `~/.ssh/authorized_keys` del VPS) |
| `VPS_DEPLOY_PATH` | Ruta absoluta al repo en el servidor (ej. `/home/deploy/vibeup`) |
| `VPS_SSH_KEY_PASSPHRASE` | (Opcional) Si tu clave privada `id_ed25519` tiene **frase de paso**, ponla aquí. Si la clave no tiene contraseña, no crees este secreto. |

La clave privada no debe subirse al repo: solo va en **Secrets** de GitHub.

### Si el deploy falla con `ssh.ParsePrivateKey: ssh: no key found`

1. **Nombre del secreto**: debe ser exactamente `VPS_SSH_PRIVATE_KEY` (repositorio o entorno, no confundir con “Environment” si no lo usas).
2. **Contenido**: debe ser el archivo **privado** `id_ed25519` (no `id_ed25519.pub`). Copia desde la primera línea `-----BEGIN` hasta la última `-----END`, sin comillas antes ni después.
3. **Frase de paso**: si al crear la clave pusiste contraseña, añade el secreto `VPS_SSH_KEY_PASSPHRASE` o genera una clave **sin** passphrase solo para CI y añade su `.pub` al VPS.
4. **Evita BOM / caracteres raros**: al pegar en GitHub, mejor copiar desde VS Code o con `Get-Content` en PowerShell y revisar que no haya líneas vacías al inicio.

### Docker Hub

Crea dos repositorios públicos (o privados; entonces en el VPS habría que hacer `docker login` una vez):

- `vibeup-backend`
- `vibeup-frontend`

Los nombres deben coincidir con las etiquetas del workflow (`usuario/vibeup-backend` y `usuario/vibeup-frontend`).

### Qué no hace falta tocar en el VPS

- No borrar volúmenes en cada deploy.
- No reinstalar Docker salvo el primer día.

El usuario SSH debe poder ejecutar `docker` y `docker compose` (usuario en grupo `docker` o `sudo` según tu configuración).

---

## 5) HTTPS (producción)

Para HTTPS delante del puerto 80, usa Nginx en el host, Traefik o Cloudflare con certificados.

---

## Notas

- Las peticiones del frontend van a rutas relativas `/api/...` y Nginx del contenedor frontend hace proxy al backend.
- Si cambias solo código, un push a `docker` basta; el workflow actualiza imágenes y el VPS hace pull + up.
