# Despliegue en VPS (Hostinger) - React + Flask + MySQL con Docker

Este proyecto queda preparado con:

- `docker-compose.yml` en la raiz.
- `backend` y `frontend` definidos por `image:` (Docker Hub/GHCR).
- Servicio `mysql` en Docker con volumen persistente.

## 1) Requisitos en el VPS

- Docker Engine + Docker Compose plugin instalados.
- Puerto `80` abierto en firewall.
- Imagenes publicas (o privadas con login) para backend y frontend.

## 2) Publicar imagenes de backend y frontend

Hostinger Docker Manager no siempre compila `build:` desde repo. Por eso este compose
usa imagenes preconstruidas.

Ejemplo:

- `tuusuario/vibeup-backend:latest`
- `tuusuario/vibeup-frontend:latest`

## 3) Configurar variables en Hostinger

```bash
cp .env.example .env
```

Edita `.env` y define al menos:

- `BACKEND_IMAGE`
- `FRONTEND_IMAGE`
- `JWT_SECRET_KEY`
- `APP_PUBLIC_URL` (tu dominio o IP publica real)
- `MAIL_*` si usaras envio de correos

### Credenciales MySQL

En el archivo `.env` (raiz del proyecto) estan las variables que usa `docker-compose.yml`.
Cambialas antes de produccion:

- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`

## 4) Levantar contenedores

```bash
docker compose up -d
```

Ver logs:

```bash
docker compose logs -f
```

Estado:

```bash
docker compose ps
```

## 5) Actualizar en nuevos deploys

```bash
git pull
docker compose pull
docker compose up -d
```

## 6) Persistencia de datos

MySQL persiste en el volumen Docker:

- `mysql_data` -> `/var/lib/mysql`

## 7) HTTPS recomendado (produccion)

Este compose publica en puerto `80`. Para HTTPS, lo ideal es poner un proxy inverso delante
(Traefik, Nginx del host o Cloudflare Tunnel) con certificados Let's Encrypt.

## Notas

- Frontend debe estar construido para consumir API relativa: `/api/...`.
- Nginx en frontend redirige `/api/*` al servicio backend interno.
- Backend corre con Gunicorn en `0.0.0.0:5000`.
- Backend espera que MySQL este disponible y saludable antes de iniciar.
