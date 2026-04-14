# Despliegue en VPS (Hostinger) - React + Flask con Docker

Este proyecto queda preparado con:

- `docker-compose.yml` en la raíz.
- `backend/Dockerfile` (Flask + Gunicorn).
- `frontend/Dockerfile` (build Vite + Nginx).
- `frontend/nginx.conf` con proxy `/api` -> backend.
- `.dockerignore` para backend y frontend.

## 1) Requisitos en el VPS

- Docker Engine + Docker Compose plugin instalados.
- Puerto `80` abierto en firewall.

## 2) Clonar y configurar

```bash
git clone <tu-repo>
cd Agentes
cp backend/.env.example backend/.env
```

Edita `backend/.env` y define al menos:

- `JWT_SECRET_KEY`
- `APP_PUBLIC_URL` (tu dominio real)
- `MAIL_*` si usarás envío de correos
- `DATABASE_URL` solo si vas a usar MySQL externo

## 3) Levantar contenedores

```bash
docker compose up -d --build
```

Ver logs:

```bash
docker compose logs -f
```

Estado:

```bash
docker compose ps
```

## 4) Actualizar en nuevos deploys

```bash
git pull
docker compose up -d --build
```

## 5) Persistencia de datos

Si no defines `DATABASE_URL`, Flask usará SQLite y se persiste en el volumen:

- `backend_instance` -> `/app/instance/dev.db`

## 6) HTTPS recomendado (producción)

Este compose publica en puerto `80`. Para HTTPS, lo ideal es poner un proxy inverso delante
(Traefik, Nginx del host o Cloudflare Tunnel) con certificados Let's Encrypt.

## Notas

- Frontend se compila con `VITE_API_BASE=""`, por lo que consume API relativa: `/api/...`.
- Nginx en frontend redirige `/api/*` al servicio backend interno.
- Backend corre con Gunicorn en `0.0.0.0:5000`.
