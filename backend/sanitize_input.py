"""Sanitización de entradas: HTML inyectado (XSS almacenado) y URLs peligrosas en atributos."""
from __future__ import annotations

import re
from typing import Any, Optional
from urllib.parse import urlparse

import bleach

_CTRL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def strip_control_chars(s: str) -> str:
    return _CTRL.sub("", s)


def sanitize_text(value: Any, max_length: int = 10_000) -> str:
    if value is None:
        return ""
    raw = strip_control_chars(str(value))
    cleaned = bleach.clean(raw, tags=[], attributes={}, strip=True)
    cleaned = cleaned.strip()
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length]
    return cleaned


def sanitize_email(value: Any) -> Optional[str]:
    if value is None:
        return None
    s = sanitize_text(str(value), 254).lower()
    if not s or not _EMAIL_RE.match(s):
        return None
    return s


def sanitize_optional_url(value: Any, max_length: int = 2048) -> Optional[str]:
    """http(s), o ruta relativa que empiece por un solo '/'. Rechaza javascript:, data:, //..., etc."""
    if value is None:
        return None
    s = strip_control_chars(str(value).strip())
    if not s:
        return None
    if len(s) > max_length:
        return None
    if s.startswith("/") and not s.startswith("//"):
        return s
    try:
        parsed = urlparse(s)
        if parsed.scheme in ("http", "https"):
            return s
    except Exception:
        pass
    return None
