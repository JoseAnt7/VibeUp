// components/studio/StatsCard.jsx
import React, { useEffect, useState } from "react";
import { Card } from "./Card";
import { API_BASE } from "../../utils/apiBase";

/**
 * @param {{ onGoToStats?: (tab?: 'views' | 'watch' | 'subs') => void }} props
 */
export const StatsCard = ({ onGoToStats }) => {
        const token = localStorage.getItem("access_token");
    const [subscriberCount, setSubscriberCount] = useState(0);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_BASE}/api/me/channel-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((r) => r.json())
            .then((data) => {
                if (typeof data.subscriber_count === "number") {
                    setSubscriberCount(data.subscriber_count);
                }
            })
            .catch(() => { });
    }, [API_BASE, token]);

    return (
        <Card>
            <div className="stats">
                <h3 className="stats__title">EstadÃ­sticas del canal</h3>

                <div className="stats__section">
                    <p className="stats__label">Suscriptores actuales</p>
                    <p className="stats__value">{subscriberCount}</p>
                </div>

                <div className="stats__divider"></div>

                <div className="stats__section">
                    <p className="stats__label">Resumen</p>
                    <p className="stats__sub">Ãšltimos 28 dÃ­as</p>

                    <div className="stats__row">
                        <span>Visualizaciones</span>
                        <span>0</span>
                    </div>

                    <div className="stats__row">
                        <span>Tiempo de visualizaciÃ³n (horas)</span>
                        <span>0.0</span>
                    </div>
                </div>

                <button
                    type="button"
                    className="stats__button"
                    onClick={() => onGoToStats?.("views")}
                >
                    Ir a las estadÃ­sticas del canal
                </button>
            </div>
        </Card>
    );
};

