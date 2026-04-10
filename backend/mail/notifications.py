"""Envíos de alto nivel (una función por tipo de plantilla)."""
from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional

from mail.gmail_transport import send_html_email
from mail.renderer import render_template


def send_registration_welcome(to_email: str, username: str) -> bool:
    when = datetime.utcnow().strftime("%d/%m/%Y, %H:%M UTC")
    html = render_template(
        "welcome.html",
        username=username,
        email=to_email,
        register_date=when,
    )
    return send_html_email(
        to_email,
        "Tu cuenta está lista",
        html,
        text_body=f"Hola {username}, tu registro se completó correctamente. Correo: {to_email}",
    )


def send_password_changed(
    to_email: str,
    username: str,
    changed_at: Optional[str] = None,
    device: str = "—",
    approx_location: str = "—",
) -> bool:
    when = changed_at or datetime.utcnow().strftime("%d/%m/%Y, %H:%M UTC")
    html = render_template(
        "password_changed.html",
        username=username,
        changed_at=when,
        device=device,
        approx_location=approx_location,
    )
    return send_html_email(
        to_email,
        "Contraseña actualizada",
        html,
        text_body=f"Hola {username}, tu contraseña se ha cambiado correctamente ({when}).",
    )


def send_event_rsvp_confirmation(
    to_email: str,
    username: str,
    event_title: str,
    artist_name: str,
    location: str,
    starts_at_fmt: str,
    ends_at_fmt: str,
    attendees_so_far: int,
    rsvp_at_fmt: str,
    event_image_url: Optional[str],
) -> bool:
    html = render_template(
        "event_rsvp.html",
        username=username,
        event_title=event_title,
        artist_name=artist_name,
        location=location,
        starts_at=starts_at_fmt,
        ends_at=ends_at_fmt,
        attendees_so_far=attendees_so_far,
        rsvp_at=rsvp_at_fmt,
        event_image_url=event_image_url or "",
    )
    return send_html_email(
        to_email,
        f"Te has apuntado: {event_title}",
        html,
        text_body=f"Confirmación de asistencia a {event_title} el {starts_at_fmt}.",
    )


def send_weekly_summary(
    to_email: str,
    channel_name: str,
    week_label: str,
    plays: int,
    likes: int,
    new_subscribers: int,
    top_songs: List[dict[str, Any]],
    top_albums: List[dict[str, Any]],
) -> bool:
    html = render_template(
        "weekly_summary.html",
        channel_name=channel_name,
        week_label=week_label,
        plays=plays,
        likes=likes,
        new_subscribers=new_subscribers,
        top_songs=top_songs,
        top_albums=top_albums,
    )
    return send_html_email(
        to_email,
        f"Resumen semanal · {week_label}",
        html,
        text_body=f"Resumen de {channel_name} para {week_label}.",
    )


def send_event_reminder_attendee(
    to_email: str,
    username: str,
    event_title: str,
    artist_name: str,
    location: str,
    starts_at_fmt: str,
    days_left: int,
    event_image_url: Optional[str],
) -> bool:
    html = render_template(
        "event_reminder_attendee.html",
        username=username,
        event_title=event_title,
        artist_name=artist_name,
        location=location,
        starts_at=starts_at_fmt,
        days_left=days_left,
        event_image_url=event_image_url or "",
    )
    subject = f"Faltan {days_left} días: {event_title}"
    return send_html_email(
        to_email,
        subject,
        html,
        text_body=f"Recordatorio: {event_title} el {starts_at_fmt}.",
    )


def send_event_reminder_creator(
    to_email: str,
    creator_name: str,
    event_title: str,
    starts_at_fmt: str,
    location: str,
    attendees_total: int,
    days_left: int,
    attendee_usernames: List[str],
    event_image_url: Optional[str],
) -> bool:
    html = render_template(
        "event_reminder_creator.html",
        creator_name=creator_name,
        event_title=event_title,
        starts_at=starts_at_fmt,
        location=location,
        attendees_total=attendees_total,
        days_left=days_left,
        attendee_usernames=attendee_usernames,
        event_image_url=event_image_url or "",
    )
    return send_html_email(
        to_email,
        f"Tu evento en {days_left} días · {attendees_total} asistentes",
        html,
        text_body=f"Listado de asistentes para {event_title}.",
    )
