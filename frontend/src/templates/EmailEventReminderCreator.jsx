import React from "react";
import { EmailLayout } from "./EmailLayout";
import eventCoverImg from "../assets/img/9b14f22434de498b8f023bc40a747c2f.jpg";

const MOCK = {
    creatorName: "Colectivo Aurora",
    eventTitle: "Noche Indie en la Nave",
    eventImage: eventCoverImg,
    startsAt: "viernes 5 de abril de 2026, 21:30",
    location: "La Nave, Polígono Creativo Ficticio 7, Sevilla",
    attendeesTotal: 48,
    daysLeft: 3,
    attendeesSample: [
        "pedro_escucha",
        "ana_sound",
        "maria_lopez",
        "carlos_demo",
        "lucia_wave",
        "jorge_tempo",
        "sofia_plug",
        "martin_amps",
        "elena_loop",
        "vik_tuner"
    ]
};

export function EmailEventReminderCreator() {
    const rest = Math.max(0, MOCK.attendeesTotal - MOCK.attendeesSample.length);

    return (
        <EmailLayout
            metaLabel="Eventos · Creador"
            title={`Faltan ${MOCK.daysLeft} días: personas apuntadas`}
            coverImage={{ src: MOCK.eventImage, alt: `Cartel: ${MOCK.eventTitle}` }}
        >
            <p className="email-template__greeting">Hola {MOCK.creatorName},</p>
            <p>
                Tu evento <strong>{MOCK.eventTitle}</strong> es en <strong>{MOCK.daysLeft} días</strong>. Este
                correo incluye un listado <strong>de prueba</strong> de personas que se han apuntado.
            </p>
            <div className="email-template__card">
                <p className="email-template__card-title">Evento</p>
                <table className="email-template__table">
                    <tbody>
                        <tr>
                            <th scope="row">Inicio</th>
                            <td>{MOCK.startsAt}</td>
                        </tr>
                        <tr>
                            <th scope="row">Lugar</th>
                            <td>{MOCK.location}</td>
                        </tr>
                        <tr>
                            <th scope="row">Total de asistentes</th>
                            <td>{MOCK.attendeesTotal}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="email-template__card">
                <p className="email-template__card-title">Usuarios apuntados (muestra ficticia)</p>
                <ol className="email-template__list">
                    {MOCK.attendeesSample.map((u) => (
                        <li key={u}>
                            <strong>{u}</strong>
                        </li>
                    ))}
                </ol>
                {rest > 0 ? (
                    <p className="email-template__muted" style={{ marginTop: 10 }}>
                        … y {rest} personas más. En la app verás la lista completa en Studio → Eventos.
                    </p>
                ) : null}
            </div>
            <a className="email-template__btn" href="/studio">
                Gestionar eventos en Studio
            </a>
        </EmailLayout>
    );
}
