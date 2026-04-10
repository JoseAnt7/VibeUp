"""
Obtiene GMAIL_REFRESH_TOKEN (y opcionalmente muestra client id) UNA SOLA VEZ.

PASOS:
  1) Google Cloud Console → Credenciales → ID de cliente OAuth → Tipo "Escritorio".
  2) Descarga el JSON y guárdalo como  backend/client_secret.json
     (o define GOOGLE_OAUTH_CREDENTIALS_FILE con la ruta completa).

  3) Desde la carpeta backend, con el venv activado:
         python -m mail.oauth_setup

  4) Abre el navegador, inicia sesión con el Gmail que enviará los correos
     y acepta el permiso "Enviar correo en tu nombre".

  5) Copia el refresh_token que imprime a tu .env:
         GMAIL_REFRESH_TOKEN=...

  Ámbito solicitado: gmail.send
"""
from __future__ import annotations

import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

try:
    from dotenv import load_dotenv

    load_dotenv(os.path.join(backend_dir, ".env"))
except ImportError:
    pass

from google_auth_oauthlib.flow import InstalledAppFlow  # noqa: E402

from mail.settings import GMAIL_SEND_SCOPE  # noqa: E402


def main() -> None:
    path = os.environ.get("GOOGLE_OAUTH_CREDENTIALS_FILE", "client_secret.json")
    if not os.path.isabs(path):
        path = os.path.join(backend_dir, path)
    if not os.path.isfile(path):
        print(f"No se encuentra el archivo de credenciales OAuth: {path}")
        print("Descárgalo desde Google Cloud Console (OAuth cliente → JSON) y colócalo ahí.")
        sys.exit(1)

    flow = InstalledAppFlow.from_client_secrets_file(path, GMAIL_SEND_SCOPE)
    creds = flow.run_local_server(port=0, prompt="consent")

    print("\n=== Copia estos valores a tu .env del backend ===\n")
    if creds.refresh_token:
        print(f"GMAIL_REFRESH_TOKEN={creds.refresh_token}")
    else:
        print("No se obtuvo refresh_token. Prueba revocando acceso en Google y repite, o usa prompt=consent.")
    print(f"GMAIL_CLIENT_ID={creds.client_id}")
    print(f"GMAIL_CLIENT_SECRET={creds.client_secret}")
    print("\nGMAIL_SENDER_EMAIL=tu_correo@gmail.com   # el mismo con el que autorizaste")
    print("MAIL_ENABLED=true")
    print("\n==================================================\n")


if __name__ == "__main__":
    main()
