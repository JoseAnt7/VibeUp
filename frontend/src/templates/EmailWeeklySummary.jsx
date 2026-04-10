import React from "react";
import { EmailLayout } from "./EmailLayout";

/** Métricas y rankings ficticios para la plantilla */
const MOCK = {
    channelName: "Canal de prueba · Luna Beats",
    weekLabel: "24 mar — 30 mar 2026",
    plays: 12840,
    likes: 942,
    newSubscribers: 37,
    topSongs: [
        { title: "Neón nocturno", plays: 2102, likes: 188 },
        { title: "Ritmo en la sala", plays: 1844, likes: 156 },
        { title: "Bajo la lluvia (live)", plays: 1510, likes: 121 },
        { title: "Tarde de domingo", plays: 1203, likes: 98 },
        { title: "Eco en stereo", plays: 987, likes: 87 }
    ],
    topAlbums: [
        { title: "Sesiones de invierno", plays: 5602 },
        { title: "Remixes vol. 1", plays: 3201 },
        { title: "Acústico en directo", plays: 2890 }
    ]
};

export function EmailWeeklySummary() {
    return (
        <EmailLayout metaLabel="Estadísticas" title="Tu resumen semanal">
            <p className="email-template__greeting">Hola equipo de {MOCK.channelName},</p>
            <p>
                Aquí tienes un resumen <strong>de prueba</strong> de la semana <strong>{MOCK.weekLabel}</strong>.
            </p>
            <div className="email-template__stat-grid">
                <div className="email-template__stat">
                    <span className="email-template__stat-value">{MOCK.plays.toLocaleString("es-ES")}</span>
                    <span className="email-template__stat-label">Reproducciones</span>
                </div>
                <div className="email-template__stat">
                    <span className="email-template__stat-value">{MOCK.likes.toLocaleString("es-ES")}</span>
                    <span className="email-template__stat-label">Likes</span>
                </div>
                <div className="email-template__stat">
                    <span className="email-template__stat-value">{MOCK.newSubscribers}</span>
                    <span className="email-template__stat-label">Nuevos suscriptores</span>
                </div>
            </div>
            <div className="email-template__card">
                <p className="email-template__card-title">Canciones más escuchadas</p>
                <table className="email-template__table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Reproducciones</th>
                            <th>Likes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK.topSongs.map((s) => (
                            <tr key={s.title}>
                                <td>{s.title}</td>
                                <td>{s.plays.toLocaleString("es-ES")}</td>
                                <td>{s.likes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="email-template__card">
                <p className="email-template__card-title">Álbumes más escuchados</p>
                <table className="email-template__table">
                    <thead>
                        <tr>
                            <th>Álbum</th>
                            <th>Reproducciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK.topAlbums.map((a) => (
                            <tr key={a.title}>
                                <td>{a.title}</td>
                                <td>{a.plays.toLocaleString("es-ES")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <a className="email-template__btn" href="/studio">
                Abrir Studio
            </a>
        </EmailLayout>
    );
}
