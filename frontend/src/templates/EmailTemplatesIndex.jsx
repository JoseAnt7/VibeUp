import React from "react";
import { Link } from "react-router-dom";
import "../assets/css/EmailTemplates.css";
import Logo from "../assets/img/logo.png";

const ITEMS = [
    { href: "/templates/email/registro", title: "Registro completado", desc: "Usuario se ha registrado con éxito." },
    { href: "/templates/email/contrasena", title: "Contraseña actualizada", desc: "Confirmación de cambio de contraseña." },
    { href: "/templates/email/evento-apuntado", title: "Te has apuntado a un evento", desc: "Confirmación de asistencia." },
    { href: "/templates/email/resumen-semanal", title: "Resumen semanal", desc: "Reproducciones, likes y contenido destacado." },
    { href: "/templates/email/evento-3d-asistente", title: "Recordatorio (3 días)", desc: "Faltan 3 días para el evento (asistente)." },
    { href: "/templates/email/evento-3d-creador", title: "Recordatorio (3 días)", desc: "Listado de asistentes para el creador del evento." }
];

export function EmailTemplatesIndex() {
    return (
        <div className="email-templates-preview__index">
            <p className="email-templates-preview__index-brand">
                <img src={Logo} alt="Logo" width="56" height="56" style={{ display: "block" }} />
            </p>
            <h1>Plantillas de correo (prueba)</h1>
            <p>Vista previa con datos ficticios. Mismo lenguaje visual que la app (acento verde, tarjetas, temas claro/oscuro).</p>
            <ul className="email-templates-preview__list">
                {ITEMS.map((item) => (
                    <li key={item.href}>
                        <Link to={item.href}>
                            {item.title}
                            <span style={{ display: "block", fontWeight: 400, opacity: 0.75, marginTop: 4 }}>
                                {item.desc}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
