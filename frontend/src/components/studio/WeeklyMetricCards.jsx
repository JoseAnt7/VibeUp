import React, { useEffect, useState } from "react";
import { API_BASE } from "../../utils/apiBase";

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatWeekRangeLabel(isoStart, isoEnd) {
    if (!isoStart || !isoEnd) return "Esta semana";
    const a = new Date(`${isoStart}T12:00:00Z`);
    const b = new Date(`${isoEnd}T12:00:00Z`);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "Esta semana";
    const d1 = a.getUTCDate();
    const d2 = b.getUTCDate();
    const m1 = MONTHS_ES[a.getUTCMonth()];
    const m2 = MONTHS_ES[b.getUTCMonth()];
    const y1 = a.getUTCFullYear();
    const y2 = b.getUTCFullYear();
    if (m1 === m2 && y1 === y2) {
        return `${d1}â€“${d2} ${m1} ${y1}`;
    }
    return `${d1} ${m1} â€“ ${d2} ${m2} ${y2}`;
}

function formatMmSs(seconds) {
    const s = Math.max(0, Math.round(Number(seconds || 0)));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * @param {{ onGoToStats: (tab: 'views' | 'watch' | 'subs') => void }} props
 */
export const WeeklyMetricCards = ({ onGoToStats }) => {
        const token = localStorage.getItem("access_token");

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        week_start: "",
        week_end: "",
        plays: 0,
        avg_listen_seconds: null,
        new_subscriptions: 0,
        listen_events_count: 0,
    });

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetch(`${API_BASE}/api/me/analytics/week-summary`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => {
                if (d.msg) return;
                setData({
                    week_start: d.week_start || "",
                    week_end: d.week_end || "",
                    plays: typeof d.plays === "number" ? d.plays : 0,
                    avg_listen_seconds:
                        d.avg_listen_seconds == null ? null : Number(d.avg_listen_seconds),
                    new_subscriptions: typeof d.new_subscriptions === "number" ? d.new_subscriptions : 0,
                    listen_events_count: typeof d.listen_events_count === "number" ? d.listen_events_count : 0,
                });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [API_BASE, token]);

    const rangeLabel = formatWeekRangeLabel(data.week_start, data.week_end);
    const avgLabel =
        data.listen_events_count > 0 && data.avg_listen_seconds != null
            ? formatMmSs(data.avg_listen_seconds)
            : "â€”";

    const blocks = [
        {
            key: "views",
            title: "Visitas esta semana",
            hint: "Reproducciones Ãºnicas por IP en tus canciones",
            value: loading ? "â€¦" : String(data.plays),
            tab: "views",
        },
        {
            key: "watch",
            title: "Tiempo medio esta semana",
            hint: "Media por sesiÃ³n de escucha registrada",
            value: loading ? "â€¦" : avgLabel,
            tab: "watch",
        },
        {
            key: "subs",
            title: "Nuevas suscripciones",
            hint: "Suscripciones nuevas a tu canal en esta semana",
            value: loading ? "â€¦" : String(data.new_subscriptions),
            tab: "subs",
        },
    ];

    return (
        <>
            {blocks.map((b) => (
                <div key={b.key} className="week-metric-card">
                    <div className="week-metric-card__top">
                        <span className="week-metric-card__badge">Semana actual</span>
                        <span className="week-metric-card__range">{rangeLabel}</span>
                    </div>
                    <h3 className="week-metric-card__title">{b.title}</h3>
                    <p className="week-metric-card__hint">{b.hint}</p>
                    <p className="week-metric-card__value">{b.value}</p>
                    <button
                        type="button"
                        className="week-metric-card__more"
                        onClick={() => onGoToStats(b.tab)}
                    >
                        Ver mÃ¡s
                    </button>
                </div>
            ))}
        </>
    );
};

