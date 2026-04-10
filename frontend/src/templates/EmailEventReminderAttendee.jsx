import React from "react";
import { EmailLayout } from "./EmailLayout";
import eventCoverImg from "../assets/img/9b14f22434de498b8f023bc40a747c2f.jpg";

const MOCK = {
    username: "pedro_escucha",
    eventTitle: "Noche Indie en la Nave",
    eventImage: eventCoverImg,
    artistName: "Colectivo Aurora",
    location: "La Nave, Polígono Creativo Ficticio 7, Sevilla",
    startsAt: "viernes 5 de abril de 2026, 21:30",
    daysLeft: 3
};

export function EmailEventReminderAttendee() {
    return (
        <EmailLayout
            metaLabel="Recordatorio"
            title={`Faltan ${MOCK.daysLeft} días para tu evento`}
            coverImage={{ src: MOCK.eventImage, alt: `Cartel: ${MOCK.eventTitle}` }}
        >
            <p className="email-template__greeting">Hola {MOCK.username},</p>
            <p>
                Te recordamos que en <strong>{MOCK.daysLeft} días</strong> tienes el evento al que te apuntaste:
            </p>
            <div className="email-template__card">
                <p className="email-template__card-title">{MOCK.eventTitle}</p>
                <table className="email-template__table">
                    <tbody>
                        <tr>
                            <th scope="row">Artista / organizador</th>
                            <td>{MOCK.artistName}</td>
                        </tr>
                        <tr>
                            <th scope="row">Cuándo</th>
                            <td>{MOCK.startsAt}</td>
                        </tr>
                        <tr>
                            <th scope="row">Dónde</th>
                            <td>{MOCK.location}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>Revisa la ubicación y la hora de apertura. Si no vas a poder asistir, cancela tu plaza para que otra persona pueda usarla.</p>
            <a className="email-template__btn" href="/">
                Ver evento en la app
            </a>
        </EmailLayout>
    );
}
