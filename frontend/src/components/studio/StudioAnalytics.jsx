import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../assets/css/Studio.css";

const TAB_META = [
    { key: "views", label: "Visitas" },
    { key: "watch", label: "Tiempo medio" },
    { key: "subs", label: "Suscriptores" }
];

function formatMmSs(seconds) {
    const s = Math.max(0, Math.round(Number(seconds || 0)));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
}

function LineChart({ dates, values, valueFormatter, ariaLabel }) {
    const wrapRef = useRef(null);
    const [hover, setHover] = useState(null);
    const w = 900;
    const h = 260;
    const pad = 28;

    const max = Math.max(...values, 0);
    const min = 0;
    const range = Math.max(1, max - min);

    const points = values.map((v, i) => {
        const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1);
        const y = h - pad - ((v - min) * (h - pad * 2)) / range;
        return { x, y, v, i };
    });

    const d = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(" ");

    const areaD = `${d} L ${pad + (w - pad * 2)} ${h - pad} L ${pad} ${h - pad} Z`;

    const ticks = useMemo(() => {
        const idxs = [0, 5, 9, 14, 18, 23, values.length - 1].filter((i) => i >= 0 && i < values.length);
        return Array.from(new Set(idxs));
    }, [values.length]);

    return (
        <div ref={wrapRef} className="analytics__chart" aria-label={ariaLabel}>
            <svg className="analytics__svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={ariaLabel}>
                <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="analytics__axis" />
                <line x1={pad} y1={pad} x2={pad} y2={h - pad} className="analytics__axis" />

                <path d={areaD} className="analytics__area" />
                <path d={d} className="analytics__line" />

                {points.map((p) => (
                    <circle
                        key={p.i}
                        cx={p.x}
                        cy={p.y}
                        r="5"
                        className="analytics__dot"
                        onMouseEnter={() => setHover({ i: p.i, x: p.x, y: p.y, v: p.v })}
                        onMouseLeave={() => setHover(null)}
                    />
                ))}
            </svg>

            {hover ? (
                <div
                    className="analytics__tooltip"
                    style={{
                        left: `${(hover.x / w) * 100}%`,
                        top: `${(hover.y / h) * 100}%`
                    }}
                >
                    <div className="analytics__tooltip-title">{dates[hover.i]}</div>
                    <div className="analytics__tooltip-value">{valueFormatter(hover.v)}</div>
                </div>
            ) : null}

            <div className="analytics__xlabels">
                {ticks.map((i) => (
                    <span key={i} className="analytics__xlabel">
                        {dates[i].slice(5).replace("-", "/")}
                    </span>
                ))}
            </div>
        </div>
    );
}

/**
 * @param {{ activeTab?: 'views' | 'watch' | 'subs', onTabChange?: (t: 'views' | 'watch' | 'subs') => void }} props
 */
export const StudioAnalytics = ({ activeTab: controlledTab, onTabChange }) => {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
    const token = localStorage.getItem("access_token");

    const [internalTab, setInternalTab] = useState("views");
    const activeTab = controlledTab ?? internalTab;
    const setActiveTab = onTabChange ?? setInternalTab;
    const [data, setData] = useState({
        dates: [],
        views: [],
        avg_listen_seconds: [],
        subs: [],
        max_views: 0,
        total_views: 0,
        total_subs: 0,
        total_listen_seconds: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetch(`${API_BASE}/api/me/analytics?days=28`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((r) => r.json())
            .then((d) => setData(d))
            .catch(() => setData({ dates: [], views: [], avg_listen_seconds: [], subs: [], max_views: 0 }))
            .finally(() => setLoading(false));
    }, [API_BASE, token]);

    const headline = useMemo(() => {
        if (activeTab === "views") {
            return `Has conseguido ${data.max_views || 0} visitas en los últimos 28 días`;
        }
        if (activeTab === "watch") {
            return `Tu contenido se ha reproducido ${formatMmSs(data.total_listen_seconds || 0)} en total en los últimos 28 días`;
        }
        return `Has conseguido ${data.total_subs || 0} suscripciones en los últimos 28 días`;
    }, [activeTab, data.max_views, data.total_listen_seconds, data.total_subs]);

    const tabValues = useMemo(() => {
        if (activeTab === "views") return { values: data.views || [], fmt: (v) => `${v}`, label: "Visitas" };
        if (activeTab === "watch") return { values: data.avg_listen_seconds || [], fmt: (v) => formatMmSs(v), label: "Tiempo medio" };
        return { values: data.subs || [], fmt: (v) => `${v}`, label: "Suscriptores" };
    }, [activeTab, data]);

    return (
        <div className="analytics">
            <div className="analytics__top">
                <div className="analytics__tabs">
                    {TAB_META.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            className={`analytics__tab ${activeTab === t.key ? "analytics__tab--active" : ""}`}
                            onClick={() => setActiveTab(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="analytics__range">Últimos 28 días</div>
            </div>

            <h2 className="analytics__headline">{headline}</h2>

            <div className="analytics__grid">
                <div className="analytics__main">
                    {loading ? (
                        <div className="analytics__loading">Cargando métricas...</div>
                    ) : (
                        <LineChart
                            dates={data.dates || []}
                            values={tabValues.values || []}
                            valueFormatter={tabValues.fmt}
                            ariaLabel={tabValues.label}
                        />
                    )}
                </div>

                <aside className="analytics__side">
                    <div className="analytics__card">
                        <h3 className="analytics__card-title">Tiempo real</h3>
                        <p className="analytics__card-sub">Actualizando</p>
                        <div className="analytics__card-kpi">
                            <span className="analytics__card-kpi-value">
                                {Array.isArray(data.subs) ? data.subs.reduce((a, b) => a + b, 0) : 0}
                            </span>
                            <span className="analytics__card-kpi-label">Suscriptores (28d)</span>
                        </div>
                        <div className="analytics__card-kpi">
                            <span className="analytics__card-kpi-value">
                                {Array.isArray(data.views) ? data.views.reduce((a, b) => a + b, 0) : 0}
                            </span>
                            <span className="analytics__card-kpi-label">Visitas (28d)</span>
                        </div>
                        <button type="button" className="analytics__card-btn">Ver más</button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

