"""Renderiza plantillas HTML (Jinja2) para correo."""
import os

from jinja2 import Environment, FileSystemLoader, select_autoescape

from mail import settings

_TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "mail_templates")

_env = Environment(
    loader=FileSystemLoader(_TEMPLATE_DIR),
    autoescape=select_autoescape(["html", "xml"]),
)


def render_template(name: str, **context) -> str:
    ctx = {
        "app_public_url": settings.APP_PUBLIC_URL,
        "logo_url": settings.MAIL_LOGO_URL,
        **context,
    }
    return _env.get_template(name).render(**ctx)
