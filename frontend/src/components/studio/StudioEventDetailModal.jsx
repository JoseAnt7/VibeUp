import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { API_BASE } from "../../utils/apiBase";

function formatRange(startsAt, endsAt) {
    const a = startsAt ? new Date(startsAt) : null;
    const b = endsAt ? new Date(endsAt) : null;
    if (!a || Number.isNaN(a.getTime())) return "";
    const opt = { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" };
    const s = a.toLocaleString("es-ES", opt);
    if (!b || Number.isNaN(b.getTime())) return s;
    return `${s}  ${b.toLocaleString("es-ES", opt)}`;
}

export const StudioEventDetailModal = ({ event, isOpen, onClose }) => {
        const token = localStorage.getItem("access_token");

    const [loading, setLoading] = useState(false);
    const [attendees, setAttendees] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (!isOpen || !event?.id || !token) return;
        setLoading(true);
        fetch(`${API_BASE}/api/me/events/${event.id}/attendees`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((r) => r.json())
            .then((data) => {
                setAttendees(Array.isArray(data.attendees) ? data.attendees : []);
                setTotal(typeof data.total === "number" ? data.total : (data.attendees || []).length);
            })
            .catch(() => {
                setAttendees([]);
                setTotal(0);
            })
            .finally(() => setLoading(false));
    }, [isOpen, event?.id, API_BASE, token]);

    if (!isOpen || !event) return null;

    const modal = (
        <div className="studio-event-detail" role="dialog" aria-modal="true">
            <div className="studio-event-detail__backdrop" onClick={onClose} />
            <div className="studio-event-detail__panel">
                <button type="button" className="studio-event-detail__close" onClick={onClose} aria-label="Cerrar">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <h2 className="studio-event-detail__title">{event.title}</h2>
                <p className="studio-event-detail__meta">{formatRange(event.starts_at, event.ends_at)}</p>
                <p className="studio-event-detail__meta">{event.location}</p>
                <p className="studio-event-detail__desc">{event.description || "Sin descripción."}</p>
                <div className="studio-event-detail__count">
                    <FontAwesomeIcon icon={faUserFriends} />
                    <span>
                        Total asistentes: {loading ? "" : total}
                    </span>
                </div>
                <h3 className="studio-event-detail__list-title">Personas apuntadas</h3>
                {loading ? (
                    <p className="studio-event-detail__hint">Cargando lista</p>
                ) : attendees.length === 0 ? (
                    <p className="studio-event-detail__hint">Nadie se ha apuntado aún.</p>
                ) : (
                    <ul className="studio-event-detail__list">
                        {attendees.map((a) => (
                            <li key={a.user_id} className="studio-event-detail__list-item">
                                {a.username}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );

    return ReactDOM.createPortal(modal, document.body);
};

