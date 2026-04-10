import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EventFormModal } from "./EventFormModal";
import { StudioEventDetailModal } from "./StudioEventDetailModal";
import { safeMediaUrl } from "../../utils/safeMediaUrl";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

function pad2(n) {
    return String(n).padStart(2, "0");
}

function dateKey(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseEventDay(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return dateKey(d);
}

function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d, n) {
    const x = new Date(d);
    x.setMonth(x.getMonth() + n);
    return x;
}

function buildCalendarCells(monthDate) {
    const first = startOfMonth(monthDate);
    const year = first.getFullYear();
    const month = first.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    // Monday = 0 column in WEEKDAYS (L M X J V S D)
    let startOffset = first.getDay(); // 0 Sun ... 6 Sat
    startOffset = startOffset === 0 ? 6 : startOffset - 1;
    const cells = [];
    let i = 0;
    const total = 42;
    while (i < total) {
        const dayNum = i - startOffset + 1;
        if (dayNum < 1 || dayNum > lastDay) {
            cells.push({ inMonth: false, date: null, key: `empty-${i}` });
        } else {
            cells.push({
                inMonth: true,
                date: new Date(year, month, dayNum),
                key: `${year}-${month}-${dayNum}`
            });
        }
        i += 1;
    }
    return cells;
}

export const StudioEvents = () => {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
    const token = localStorage.getItem("access_token");

    const [events, setEvents] = useState([]);
    const [nameFilter, setNameFilter] = useState("");
    const [locFilter, setLocFilter] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [monthCursor, setMonthCursor] = useState(() => new Date());

    const [formOpen, setFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [detailEvent, setDetailEvent] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const loadEvents = useCallback(() => {
        if (!token) return;
        fetch(`${API_BASE}/api/me/events`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data.events)) setEvents(data.events);
            })
            .catch(() => setEvents([]));
    }, [API_BASE, token]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    useEffect(() => {
        const h = () => loadEvents();
        window.addEventListener("studio-events-refresh", h);
        return () => window.removeEventListener("studio-events-refresh", h);
    }, [loadEvents]);

    const datesWithEvents = useMemo(() => {
        const s = new Set();
        events.forEach((ev) => {
            const k = parseEventDay(ev.starts_at);
            if (k) s.add(k);
        });
        return s;
    }, [events]);

    const filtered = useMemo(() => {
        const n = nameFilter.trim().toLowerCase();
        const l = locFilter.trim().toLowerCase();
        return events.filter((ev) => {
            if (n && !(ev.title || "").toLowerCase().includes(n)) return false;
            if (l && !(ev.location || "").toLowerCase().includes(l)) return false;
            if (selectedDate) {
                const k = parseEventDay(ev.starts_at);
                if (k !== selectedDate) return false;
            }
            return true;
        });
    }, [events, nameFilter, locFilter, selectedDate]);

    const cells = useMemo(() => buildCalendarCells(monthCursor), [monthCursor]);

    const monthLabel = monthCursor.toLocaleString("es-ES", { month: "long", year: "numeric" });

    const handleDelete = async (ev) => {
        if (!window.confirm(`¿Eliminar el evento "${ev.title}"? Esta acción es irreversible.`)) return;
        const res = await fetch(`${API_BASE}/api/me/events/${ev.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    };

    const openDetail = (ev) => {
        setDetailEvent(ev);
        setDetailOpen(true);
    };

    return (
        <div className="studio-events">
            <div className="studio-events__intro">
                <h1 className="studio-events__heading">Eventos</h1>
                <p className="studio-events__sub">Gestiona tus eventos y consulta asistentes.</p>
            </div>

            <div className="studio-events__filters">
                <div className="studio-events__field">
                    <label htmlFor="ev-filter-name">Nombre</label>
                    <input
                        id="ev-filter-name"
                        type="search"
                        placeholder="Filtrar por título…"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
                </div>
                <div className="studio-events__field">
                    <label htmlFor="ev-filter-loc">Ubicación</label>
                    <input
                        id="ev-filter-loc"
                        type="search"
                        placeholder="Filtrar por ubicación…"
                        value={locFilter}
                        onChange={(e) => setLocFilter(e.target.value)}
                    />
                </div>
                {selectedDate ? (
                    <button type="button" className="studio-events__clear-date" onClick={() => setSelectedDate(null)}>
                        Quitar filtro de fecha ({selectedDate})
                    </button>
                ) : null}
            </div>

            <div className="studio-events__calendar-wrap">
                <div className="studio-events__calendar-head">
                    <button type="button" className="studio-events__cal-nav" onClick={() => setMonthCursor((d) => addMonths(d, -1))} aria-label="Mes anterior">
                        ‹
                    </button>
                    <span className="studio-events__cal-title">{monthLabel}</span>
                    <button type="button" className="studio-events__cal-nav" onClick={() => setMonthCursor((d) => addMonths(d, 1))} aria-label="Mes siguiente">
                        ›
                    </button>
                </div>
                <div className="studio-events__weekdays">
                    {WEEKDAYS.map((w) => (
                        <span key={w} className="studio-events__weekday">
                            {w}
                        </span>
                    ))}
                </div>
                <div className="studio-events__grid">
                    {cells.map((c) => {
                        if (!c.inMonth || !c.date) {
                            return <div key={c.key} className="studio-events__day studio-events__day--empty" />;
                        }
                        const k = dateKey(c.date);
                        const has = datesWithEvents.has(k);
                        const sel = selectedDate === k;
                        return (
                            <button
                                key={c.key}
                                type="button"
                                className={`studio-events__day ${has ? "studio-events__day--has-event" : ""} ${sel ? "studio-events__day--selected" : ""}`}
                                onClick={() => setSelectedDate((prev) => (prev === k ? null : k))}
                            >
                                <span className="studio-events__day-num">{c.date.getDate()}</span>
                                {has ? <span className="studio-events__dot" aria-hidden /> : null}
                            </button>
                        );
                    })}
                </div>
                <p className="studio-events__legend">
                    <span className="studio-events__dot studio-events__dot--inline" /> Día con evento · Pulsa un día para filtrar
                </p>
            </div>

            <div className="content__table">
                <div className="content__header content__header--events">
                    <span>Imagen</span>
                    <span>Título</span>
                    <span>Inicio</span>
                    <span>Fin</span>
                    <span>Ubicación</span>
                    <span>Asistentes</span>
                    <span>Acciones</span>
                </div>

                {filtered.map((ev) => {
                    const cover = safeMediaUrl(ev.img);
                    return (
                    <div
                        key={ev.id}
                        className="content__row content__row--events"
                        role="button"
                        tabIndex={0}
                        onClick={() => openDetail(ev)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openDetail(ev);
                            }
                        }}
                    >
                        <div className="content__cell">
                            {cover ? <img src={cover} alt="" /> : <div className="content__placeholder" />}
                        </div>
                        <div className="content__cell">{ev.title}</div>
                        <div className="content__cell content__cell--muted">
                            {ev.starts_at ? new Date(ev.starts_at).toLocaleString("es-ES") : "—"}
                        </div>
                        <div className="content__cell content__cell--muted">
                            {ev.ends_at ? new Date(ev.ends_at).toLocaleString("es-ES") : "—"}
                        </div>
                        <div className="content__cell">{ev.location}</div>
                        <div className="content__cell">{ev.attendee_count ?? 0}</div>
                        <div className="content__cell content__cell--actions" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                className="content__action"
                                onClick={() => {
                                    setEditingEvent(ev);
                                    setFormOpen(true);
                                }}
                            >
                                Editar
                            </button>
                            <button type="button" className="content__action content__action--danger" onClick={() => handleDelete(ev)}>
                                Eliminar
                            </button>
                        </div>
                    </div>
                    );
                })}
            </div>

            {filtered.length === 0 ? <p className="studio-events__empty">No hay eventos con estos filtros.</p> : null}

            <EventFormModal
                isOpen={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditingEvent(null);
                }}
                event={editingEvent}
                onSaved={(saved) => {
                    if (editingEvent) {
                        setEvents((prev) => prev.map((e) => (e.id === saved.id ? { ...e, ...saved } : e)));
                    } else {
                        setEvents((prev) => [saved, ...prev]);
                    }
                }}
            />

            <StudioEventDetailModal
                event={detailEvent}
                isOpen={detailOpen}
                onClose={() => {
                    setDetailOpen(false);
                    setDetailEvent(null);
                }}
            />
        </div>
    );
};
