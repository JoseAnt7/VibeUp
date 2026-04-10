import React from "react";
import { EmailLayout } from "./EmailLayout";

/** Datos de prueba ficticios */
const MOCK = {
    username: "maria_lopez",
    email: "maria.lopez@ejemplo.com",
    registerDate: "2 de abril de 2026, 10:42"
};

export function EmailRegisterSuccess() {
    return (
        <EmailLayout metaLabel="Bienvenida" title="Tu cuenta está lista">
            <p className="email-template__greeting">Hola {MOCK.username},</p>
            <p>Te damos la bienvenida. Tu registro se ha completado correctamente.</p>
            <p className="email-template__muted">
                Correo asociado: <strong>{MOCK.email}</strong>
                <br />
                Fecha de alta: {MOCK.registerDate}
            </p>
            <p>Ya puedes iniciar sesión, explorar artistas, crear listas y, si lo deseas, abrir tu estudio para publicar música.</p>
            <a className="email-template__btn" href="/session">
                Iniciar sesión
            </a>
            <div className="email-template__card">
                <p className="email-template__card-title">Próximos pasos sugeridos</p>
                <ul className="email-template__list">
                    <li>Completa tu perfil y preferencias de notificaciones.</li>
                    <li>Descubre música en la página de inicio y en búsqueda.</li>
                    <li>Suscríbete a tus artistas favoritos para no perderte nada.</li>
                </ul>
            </div>
        </EmailLayout>
    );
}
