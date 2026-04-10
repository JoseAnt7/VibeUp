import React from "react";
import { Link, Outlet } from "react-router-dom";
import "../assets/css/EmailTemplates.css";
import Logo from "../assets/img/logo.png";

const LINKS = [
    { to: "/templates/email", label: "Índice" },
    { to: "/templates/email/registro", label: "Registro" },
    { to: "/templates/email/contrasena", label: "Contraseña" },
    { to: "/templates/email/evento-apuntado", label: "Evento apuntado" },
    { to: "/templates/email/resumen-semanal", label: "Resumen semanal" },
    { to: "/templates/email/evento-3d-asistente", label: "Evento 3d (asistente)" },
    { to: "/templates/email/evento-3d-creador", label: "Evento 3d (creador)" }
];

export function EmailTemplatesLayout() {
    return (
        <div className="email-templates-preview">
            <nav className="email-templates-preview__nav" aria-label="Plantillas de correo">
                <Link to="/" className="email-templates-preview__logo-link" title="Inicio">
                    <img src={Logo} alt="Logo" className="email-templates-preview__logo" width="40" height="40" />
                </Link>
                {LINKS.map(({ to, label }) => (
                    <Link key={to} to={to}>
                        {label}
                    </Link>
                ))}
            </nav>
            <Outlet />
        </div>
    );
}
