import React from "react";
import "../assets/css/EmailTemplates.css";
import Logo from "../assets/img/logo.png";

/**
 * Wrapper visual tipo correo electrónico (vista previa en la app).
 * @param {{ coverImage?: { src: string, alt?: string } }} props — imagen del evento (opcional)
 */
export function EmailLayout({ metaLabel = "Notificación", title, children, footerExtra, coverImage }) {
    return (
        <div className="email-template">
            <div className="email-template__shell">
                <div className="email-template__brand">
                    <img src={Logo} alt="Logo" className="email-template__logo" />
                </div>
                <header className="email-template__hero">
                    <p className="email-template__hero-label">{metaLabel}</p>
                    <h1 className="email-template__hero-title">{title}</h1>
                </header>
                {coverImage?.src ? (
                    <div className="email-template__cover">
                        <img
                            src={coverImage.src}
                            alt={coverImage.alt || ""}
                            className="email-template__cover-img"
                        />
                    </div>
                ) : null}
                <div className="email-template__body">{children}</div>
                <footer className="email-template__footer">
                    <p>
                        Vista previa de plantilla de correo.{" "}
                        <a href="/">Ir al inicio</a>
                    </p>
                    {footerExtra ? <p style={{ marginTop: 8 }}>{footerExtra}</p> : null}
                </footer>
            </div>
        </div>
    );
}
