import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar_Home } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { API_BASE } from "../utils/apiBase";
import { safeMediaUrl } from "../utils/safeMediaUrl";
import Logo from "../assets/img/logo.png";
import "../assets/css/PublicDetail.css";

function formatRange(startsAt, endsAt) {
    const a = startsAt ? new Date(startsAt) : null;
    const b = endsAt ? new Date(endsAt) : null;
    if (!a || Number.isNaN(a.getTime())) return "";
    const opt = { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" };
    const startStr = a.toLocaleString("es-ES", opt);
    if (!b || Number.isNaN(b.getTime())) return startStr;
    return `${startStr} — ${b.toLocaleString("es-ES", opt)}`;
}

export const EventPublic = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("access_token");
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rsvpLoading, setRsvpLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError("");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        fetch(`${API_BASE}/api/public/events/${eventId}`, { headers })
            .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
            .then(({ ok, data }) => {
                if (!ok) {
                    setError(data.msg || "No se pudo cargar el evento.");
                    return;
                }
                setEvent(data.event);
            })
            .catch(() => setError("Error de red cargando evento."))
            .finally(() => setLoading(false));
    }, [eventId, token]);

    const handleRsvp = async () => {
        if (!event?.id || !token || rsvpLoading) return;
        setRsvpLoading(true);
        try {
            const method = event.is_attending ? "DELETE" : "POST";
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
            }
        } finally {
            setRsvpLoading(false);
        }
    };

    return (
        <div className="public-detail">
            <Navbar_Home />
            <main className="public-detail__main">
                <button type="button" className="public-detail__back" onClick={() => navigate(-1)}>
                    Volver
                </button>
                {loading ? (
                    <p>Cargando evento...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : event ? (
                    <section className="public-detail__event">
                        <img src={safeMediaUrl(event.img, Logo)} alt={event.title} />
                        <h1>{event.title}</h1>
                        <p>{event.artist_name || ""}</p>
                        <p>{formatRange(event.starts_at, event.ends_at)}</p>
                        <p>{event.location || ""}</p>
                        <p>{event.description || "Sin descripción."}</p>
                        <p>{event.attendee_count || 0} asistentes</p>
                        {token ? (
                            <button type="button" className="public-detail__play-all" onClick={handleRsvp} disabled={rsvpLoading}>
                                {event.is_attending ? "Cancelar asistencia" : "Apuntarme al evento"}
                            </button>
                        ) : (
                            <button type="button" className="public-detail__play-all" onClick={() => navigate("/session")}>
                                Inicia sesión para apuntarte
                            </button>
                        )}
                    </section>
                ) : null}
            </main>
            <Footer />
        </div>
    );
};
