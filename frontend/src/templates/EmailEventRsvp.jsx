import React from "react";
import { EmailLayout } from "./EmailLayout";
import eventCoverImg from "../assets/img/Gemini_Generated_Image_exqsouexqsouexqs.png";

const MOCK = {
    username: "ana_sound",
    eventTitle: "Charla: Música y composición en vivo",
    eventImage: eventCoverImg,
    artistName: "Imajoven Audiovisual",
    location: "Auditorio Central, Calle Ficticia 42, Madrid",
    startsAt: "sábado 12 de abril de 2026, 20:15",
    endsAt: "domingo 13 de abril de 2026, 00:30",
    attendeesSoFar: 262,
    rsvpAt: "28 de marzo de 2026"
};

export function EmailEventRsvp() {
    return (
        <EmailLayout
            metaLabel="Eventos"
            title="Te has apuntado al evento"
            coverImage={{ src: MOCK.eventImage, alt: `Cartel: ${MOCK.eventTitle}` }}
        >
            <p className="email-template__greeting">Hola {MOCK.username},</p>
            <p>
                Tu asistencia a <strong>{MOCK.eventTitle}</strong> queda confirmada.
            </p>
            <div className="email-template__card">
                <p className="email-template__card-title">Detalle del evento (prueba)</p>
                <table className="email-template__table">
                    <tbody>
                        <tr>
                            <th scope="row">Organiza</th>
                            <td>{MOCK.artistName}</td>
                        </tr>
                        <tr>
                            <th scope="row">Inicio</th>
                            <td>{MOCK.startsAt}</td>
                        </tr>
                        <tr>
                            <th scope="row">Fin</th>
                            <td>{MOCK.endsAt}</td>
                        </tr>
                        <tr>
                            <th scope="row">Lugar</th>
                            <td>{MOCK.location}</td>
                        </tr>
                        <tr>
                            <th scope="row">Asistentes apuntados</th>
                            <td>{MOCK.attendeesSoFar}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="email-template__muted">Registro realizado el {MOCK.rsvpAt}.</p>
            <p>Puedes cancelar tu asistencia desde la ficha del evento en la aplicación.</p>
            <a className="email-template__btn" href="/">
                Ver el evento en la app
            </a>
        </EmailLayout>
    );
}
