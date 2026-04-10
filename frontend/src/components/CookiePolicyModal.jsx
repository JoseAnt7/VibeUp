import { useEffect, useRef } from "react";

const BROWSER_LINKS = {
    edge: "https://support.microsoft.com/es-es/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
    firefox: "https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web",
    chrome: "https://support.google.com/chrome/answer/95647?hl=es",
    safari: "https://support.apple.com/es-es/guide/safari/sfri11471/mac",
};

/**
 * @param {{ open: boolean, onClose: () => void, onAccept: () => void, onReject: () => void }} props
 */
export function CookiePolicyModal({ open, onClose, onAccept, onReject }) {
    const closeBtnRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeBtnRef.current?.focus();
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="cookie-consent__modal-backdrop"
            role="presentation"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="cookie-consent__modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cookie-consent-modal-title"
            >
                <header className="cookie-consent__modal-header">
                    <h2 id="cookie-consent-modal-title" className="cookie-consent__modal-title">
                        Política de cookies
                    </h2>
                    <button
                        ref={closeBtnRef}
                        type="button"
                        className="cookie-consent__modal-close"
                        aria-label="Cerrar"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>
                <div className="cookie-consent__modal-body">
                    <h2>1. ¿Qué son las cookies?</h2>
                    <p>
                        Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web.
                        Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre
                        los hábitos de navegación de un usuario o de su equipo.
                    </p>

                    <h2>2. ¿Qué tipos de cookies utiliza esta página web?</h2>
                    <p>En <strong>VibeUp</strong> utilizamos las siguientes:</p>
                    <div className="cookie-consent__table-wrap">
                        <table className="cookie-consent__table">
                            <thead>
                                <tr>
                                    <th scope="col">Tipo de cookie</th>
                                    <th scope="col">Finalidad</th>
                                    <th scope="col">Duración</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">Técnicas</th>
                                    <td>
                                        Necesarias para el inicio de sesión, el funcionamiento del reproductor y la
                                        gestión de la suscripción de 0,99€.
                                    </td>
                                    <td>Sesión / persistente</td>
                                </tr>
                                <tr>
                                    <th scope="row">Analíticas</th>
                                    <td>
                                        Nos permiten cuantificar el número de usuarios y realizar la medición y análisis
                                        estadístico de la utilización que hacen los usuarios (tiempo de reproducción,
                                        canciones populares).
                                    </td>
                                    <td>Terceros (Google Analytics / propias)</td>
                                </tr>
                                <tr>
                                    <th scope="row">Publicitarias</th>
                                    <td>
                                        Gestionan la frecuencia y el contenido de los anuncios que ves en la versión
                                        gratuita de la app.
                                    </td>
                                    <td>Terceros</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2>3. Desactivación o eliminación de cookies</h2>
                    <p>
                        Usted puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la
                        configuración del navegador.
                    </p>
                    <ul>
                        <li>
                            <a href={BROWSER_LINKS.edge} target="_blank" rel="noopener noreferrer">
                                Microsoft Edge
                            </a>
                        </li>
                        <li>
                            <a href={BROWSER_LINKS.firefox} target="_blank" rel="noopener noreferrer">
                                Mozilla Firefox
                            </a>
                        </li>
                        <li>
                            <a href={BROWSER_LINKS.chrome} target="_blank" rel="noopener noreferrer">
                                Google Chrome
                            </a>
                        </li>
                        <li>
                            <a href={BROWSER_LINKS.safari} target="_blank" rel="noopener noreferrer">
                                Safari (Apple)
                            </a>
                        </li>
                    </ul>
                    <p>
                        Para más información puede consultar la guía de cookies de la{" "}
                        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
                            AEPD
                        </a>
                        .
                    </p>
                </div>
                <footer className="cookie-consent__modal-footer">
                    <button type="button" className="cookie-consent__btn cookie-consent__btn--ghost" onClick={onClose}>
                        Cerrar sin decidir
                    </button>
                    <button type="button" className="cookie-consent__btn cookie-consent__btn--ghost" onClick={onReject}>
                        Rechazar
                    </button>
                    <button type="button" className="cookie-consent__btn cookie-consent__btn--primary" onClick={onAccept}>
                        Aceptar
                    </button>
                </footer>
            </div>
        </div>
    );
}
