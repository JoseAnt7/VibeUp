# Despliegue en VPS (Hostinger) - React + Flask + MySQL con Docker

Este proyecto queda preparado con:

- `docker-compose.yml` en la raiz.
- `backend` y `frontend` definidos por `build:` (igual de simple que antes con SQLite).
- Servicio `mysql` en Docker con volumen persistente.

## 1) Requisitos en el VPS

- Docker Engine + Docker Compose plugin instalados.
- Puerto `80` abierto en firewall.

## 2) Configurar variables

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Edita `.env` (raiz) para MySQL:

- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`

Edita `backend/.env`:

- `JWT_SECRET_KEY`
- `APP_PUBLIC_URL` (tu dominio o IP publica real)
- `MAIL_*` si vas a usar correo

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

MySQL persiste en el volumen Docker:

- `mysql_data` -> `/var/lib/mysql`

## 6) HTTPS recomendado (produccion)

Este compose publica en puerto `80`. Para HTTPS, lo ideal es poner un proxy inverso delante
(Traefik, Nginx del host o Cloudflare Tunnel) con certificados Let's Encrypt.

## Notas

- Frontend debe estar construido para consumir API relativa: `/api/...`.
- Nginx en frontend redirige `/api/*` al servicio backend interno.
- Backend corre con Gunicorn en `0.0.0.0:5000`.
- Backend espera que MySQL este disponible y saludable antes de iniciar.
