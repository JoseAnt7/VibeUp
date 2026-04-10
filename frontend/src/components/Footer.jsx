import React from "react";
import { Link } from "react-router-dom";
import { useCookieConsent } from "../context/CookieConsentContext";
import "../assets/css/LegalPage.css";

export const Footer = () => {
    const { openPolicy } = useCookieConsent();

    return (
        <footer className="site-footer" role="contentinfo">
            <div className="site-footer__inner">
                <nav className="site-footer__nav" aria-label="Enlaces legales">
                    <ul className="site-footer__list">
                        <li className="site-footer__item">
                            <Link className="site-footer__link" to="/aviso-legal">
                                Aviso Legal
                            </Link>
                        </li>
                        <li className="site-footer__item">
                            <Link className="site-footer__link" to="/politica-privacidad">
                                Política de Privacidad
                            </Link>
                        </li>
                        <li className="site-footer__item">
                            <Link
                                className="site-footer__link"
                                to="/condiciones-contenido-licencia-artista"
                            >
                                Condiciones de Contenido y Licencia de Artista
                            </Link>
                        </li>
                        <li className="site-footer__item">
                            <button
                                type="button"
                                className="site-footer__link site-footer__link--button"
                                onClick={openPolicy}
                            >
                                Política de cookies
                            </button>
                        </li>
                    </ul>
                </nav>
                <p className="site-footer__copy">© {new Date().getFullYear()} VibeUp</p>
            </div>
        </footer>
    );
};
