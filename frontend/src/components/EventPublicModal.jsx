import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../assets/css/Events.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUserFriends, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import Logo from "../assets/img/logo.png";
import { safeMediaUrl } from "../utils/safeMediaUrl";
import { API_BASE } from "../utils/apiBase";

function formatRange(startsAt, endsAt) {
    const a = startsAt ? new Date(startsAt) : null;
    const b = endsAt ? new Date(endsAt) : null;
    if (!a || Number.isNaN(a.getTime())) return "";
    const opt = { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" };
    const startStr = a.toLocaleString("es-ES", opt);
    if (!b || Number.isNaN(b.getTime())) return startStr;
    const endStr = b.toLocaleString("es-ES", opt);
    return `${startStr} â€” ${endStr}`;
}

export const EventPublicModal = ({ eventId, isOpen, onClose, onRsvpChange }) => {
    const navigate = useNavigate();
        const token = localStorage.getItem("access_token");

    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const [error, setError] = useState("");
    const [rsvpLoading, setRsvpLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !eventId) return;
        setLoading(true);
        setError("");
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        fetch(`${API_BASE}/api/public/events/${eventId}`, { headers })
            .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
            .then(({ ok, data }) => {
                if (!ok) {
                    setError(data.msg || "No se pudo cargar el evento");
                    setEvent(null);
                    return;
                }
                setEvent(data.event);
            })
            .catch(() => {
                setError("Error de red");
                setEvent(null);
            })
            .finally(() => setLoading(false));
    }, [isOpen, eventId, API_BASE, token]);

    const handleRsvp = async () => {
        if (!event?.id || !token || rsvpLoading) return;
        setRsvpLoading(true);
        try {
            const attending = event.is_attending;
            const method = attending ? "DELETE" : "POST";
            const res = await fetch(`${API_BASE}/api/public/events/${event.id}/attend`, {
                method,
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setEvent((prev) =>
                    prev
                        ? {
                              ...prev,
                              is_attending: !!data.attending,
                              attendee_count: data.attendee_count ?? prev.attendee_count
                          }
                        : null
                );
                onRsvpChange?.(event.id, data.attendee_count, !!data.attending);
            } else if (data.msg) {
                window.alert(data.msg);
            }
        } catch {
            // noop
        } finally {
            setRsvpLoading(false);
        }
    };

    if (!isOpen) return null;

    const modal = (
        <div className="event-modal" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
            <div className="event-modal__backdrop" onClick={onClose} />
            <div className="event-modal__panel">
                <button type="button" className="event-modal__close" onClick={onClose} aria-label="Cerrar">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                {loading ? (
                    <p className="event-modal__loading">Cargandoâ€¦</p>
                ) : error ? (
                    <p className="event-modal__error">{error}</p>
                ) : event ? (
                    <>
                        <div className="event-modal__hero">
                            <img
                                className="event-modal__hero-img"
                                src={safeMediaUrl(event.img, Logo)}
                                alt=""
                            />
                        </div>
                        <div className="event-modal__content">
                            <h2 id="event-modal-title" className="event-modal__title">
                                {event.title}
                            </h2>
                            <p className="event-modal__artist">{event.artist_name}</p>
                            <p className="event-modal__when">{formatRange(event.starts_at, event.ends_at)}</p>
                            <p className="event-modal__place">
                                <FontAwesomeIcon icon={faMapMarkerAlt} /> {event.location}
                            </p>
                            <p className="event-modal__desc">{event.description || "Sin descripciÃ³n."}</p>
                            <div className="event-modal__stats">
                                <FontAwesomeIcon icon={faUserFriends} />
                                <span>
                                    {event.attendee_count ?? 0}{" "}
                                    {(event.attendee_count ?? 0) === 1 ? "asistente" : "asistentes"}
                                </span>
                            </div>
                            {token ? (
                                <button
                                    type="button"
                                    className={`event-modal__rsvp ${event.is_attending ? "event-modal__rsvp--active" : ""}`}
                                    onClick={handleRsvp}
                                    disabled={rsvpLoading}
                                >
                                    {event.is_attending ? "Cancelar asistencia" : "Apuntarme al evento"}
                                </button>
                            ) : (
                                <p className="event-modal__hint">
                                    <button type="button" className="event-modal__link" onClick={() => navigate("/session")}>
                                        Inicia sesiÃ³n
                                    </button>{" "}
                                    para apuntarte a este evento.
                                </p>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );

    return ReactDOM.createPortal(modal, document.body);
};

