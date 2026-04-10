"""Construcción del cliente Gmail y envío MIME."""
from __future__ import annotations

import base64
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from mail import settings

logger = logging.getLogger(__name__)


def _credentials() -> Optional[Credentials]:
    if not settings.mail_is_configured():
        return None
    creds = Credentials(
        token=None,
        refresh_token=settings.GMAIL_REFRESH_TOKEN,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GMAIL_CLIENT_ID,
        client_secret=settings.GMAIL_CLIENT_SECRET,
        scopes=settings.GMAIL_SEND_SCOPE,
    )
    creds.refresh(Request())
    return creds


def send_html_email(
    to_addr: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None,
) -> bool:
    """
    Envía un correo con Gmail API (users.messages.send).
    Retorna True si se envió, False si se omitió o falló (se loguea el error).
    """
    if not settings.mail_should_send():
        if settings.MAIL_ENABLED and not settings.mail_is_configured():
            logger.warning(
                "Correo no enviado a %s: credenciales Gmail incompletas (suele faltar "
                "GMAIL_REFRESH_TOKEN en .env). Desde backend/: python -m mail.oauth_setup",
                to_addr,
            )
        else:
            logger.debug("Correo omitido: MAIL_ENABLED desactivado.")
        return False

    creds = _credentials()
    if not creds:
        return False

    try:
        service = build("gmail", "v1", credentials=creds, cache_discovery=False)
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.GMAIL_SENDER_EMAIL
        msg["To"] = to_addr
        if text_body:
            msg.attach(MIMEText(text_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")
        service.users().messages().send(userId="me", body={"raw": raw}).execute()
        logger.info("Correo enviado a %s — %s", to_addr, subject)
        return True
    except HttpError as e:
        logger.exception("Gmail API error: %s", e)
    except Exception as e:
        logger.exception("Error enviando correo: %s", e)
    return False
