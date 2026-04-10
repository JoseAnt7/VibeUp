import { useLocation } from "react-router-dom";

/**
 * @param {{ visible: boolean, onAccept: () => void, onReject: () => void, onOpenPolicy: () => void }} props
 */
export function CookieBanner({ visible, onAccept, onReject, onOpenPolicy }) {
    const location = useLocation();
    const abovePlayer =
        location.pathname === "/" ||
        location.pathname.startsWith("/search") ||
        /^\/artist\//.test(location.pathname);

    if (!visible) return null;

    const bannerMods = abovePlayer
        ? "cookie-consent__banner cookie-consent__banner--above-player"
        : "cookie-consent__banner cookie-consent__banner--bottom";

    return (
        <aside className={bannerMods} role="dialog" aria-label="Preferencias de cookies" aria-live="polite">
            <div className="cookie-consent__banner-inner">
                <p className="cookie-consent__banner-copy">
                    Utilizamos cookies para que la web funcione correctamente, para medir el uso (reproducciones,
                    canciones populares) y, en la versión gratuita, para mostrar publicidad acorde a tus hábitos.
                    Puedes aceptarlas, rechazarlas o leer la política completa.
                </p>
                <div className="cookie-consent__banner-actions">
                    <button type="button" className="cookie-consent__btn cookie-consent__btn--link" onClick={onOpenPolicy}>
                        Ver política de cookies
                    </button>
                    <button type="button" className="cookie-consent__btn cookie-consent__btn--ghost" onClick={onReject}>
                        Rechazar
                    </button>
                    <button type="button" className="cookie-consent__btn cookie-consent__btn--primary" onClick={onAccept}>
                        Aceptar
                    </button>
                </div>
            </div>
        </aside>
    );
}
