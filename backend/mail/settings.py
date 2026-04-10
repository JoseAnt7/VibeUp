"""
Configuración de correo (Gmail API).

──────────────────────────────────────────────────────────────────────────
DÓNDE PONER TUS CLAVES (recomendado: archivo .env en la carpeta backend/)
──────────────────────────────────────────────────────────────────────────

1) GOOGLE CLOUD CONSOLE  →  https://console.cloud.google.com
   - Crea o elige un proyecto.
   - "APIs y servicios" → "Biblioteca" → busca "Gmail API" → HABILITAR.

2) PANTALLA DE CONSENTIMIENTO OAUTH  (menú "Pantalla de consentimiento de OAuth")
   - Tipo: Externo (o Interno si usas Workspace).
   - Añade tu propio Gmail como usuario de prueba mientras la app esté en pruebas.

3) CREDENCIALES  →  "Crear credenciales"  →  "ID de cliente de OAuth"
   - Tipo de aplicación: "Aplicación de escritorio" (la más simple para obtener refresh token).
   - Descarga el JSON. Renómbralo a  client_secret.json  y colócalo en backend/
     (NO lo subas a Git: ya debe estar en .gitignore).

4) Ejecuta UNA VEZ en tu máquina (con venv activado), desde la carpeta backend:
       python -m mail.oauth_setup
   Sigue el navegador, acepta permisos. Al final se imprimirá el REFRESH_TOKEN.
   Cópialo abajo en .env como GMAIL_REFRESH_TOKEN.

5) En .env del backend asigna también:
   - GMAIL_CLIENT_ID          → "client_id" del JSON de OAuth (o del archivo descargado).
   - GMAIL_CLIENT_SECRET      → "client_secret" del mismo sitio.
   - GMAIL_REFRESH_TOKEN      → el que te dio oauth_setup.
   - GMAIL_SENDER_EMAIL       → el mismo Gmail que usaste para autorizar (ej. yo@gmail.com).
   - MAIL_ENABLED=true        → para activar envío real (false en desarrollo sin credenciales).

6) URLs públicas (enlaces e imágenes en el HTML del correo):
   - APP_PUBLIC_URL           → URL de tu front desplegado, ej. https://musicapp.com
   - MAIL_LOGO_URL            → (opcional) URL ABSOLUTA del logo visible en internet.
                              Si no la pones, se usa APP_PUBLIC_URL + "/logo-email.png"
                              (debes colocar ese asset en tu hosting o CDN).

──────────────────────────────────────────────────────────────────────────
ÁMBITO OAUTH REQUERIDO: https://www.googleapis.com/auth/gmail.send
──────────────────────────────────────────────────────────────────────────
"""
import os

# Activa el envío real solo si es true y hay credenciales completas
MAIL_ENABLED = os.environ.get("MAIL_ENABLED", "false").strip().lower() in (
    "1",
    "true",
    "yes",
    "on",
)

# OAuth 2.0 — Pantalla "Credenciales" de Google Cloud (ID de cliente OAuth 2.0)
# Pega aquí los valores del JSON o de la tabla de la consola:
GMAIL_CLIENT_ID = os.environ.get("GMAIL_CLIENT_ID", "").strip()
GMAIL_CLIENT_SECRET = os.environ.get("GMAIL_CLIENT_SECRET", "").strip()

# Token obtenido ejecutando:  python -m mail.oauth_setup
GMAIL_REFRESH_TOKEN = os.environ.get("GMAIL_REFRESH_TOKEN", "").strip()

# Buzón desde el que se envía (debe ser la cuenta que autorizó la app)
GMAIL_SENDER_EMAIL = os.environ.get("GMAIL_SENDER_EMAIL", "").strip()

# Enlaces en plantillas (sin barra final)
APP_PUBLIC_URL = os.environ.get("APP_PUBLIC_URL", "http://localhost:5173").rstrip("/")

# Logo en correos: URL absoluta recomendada (muchas bandejas bloquean rutas relativas)
MAIL_LOGO_URL = os.environ.get("MAIL_LOGO_URL", "").strip() or (
    f"{APP_PUBLIC_URL}/logo-email.png"
)

GMAIL_SEND_SCOPE = ["https://www.googleapis.com/auth/gmail.send"]


def mail_is_configured() -> bool:
    return bool(
        GMAIL_CLIENT_ID
        and GMAIL_CLIENT_SECRET
        and GMAIL_REFRESH_TOKEN
        and GMAIL_SENDER_EMAIL
    )


def mail_should_send() -> bool:
    return MAIL_ENABLED and mail_is_configured()
