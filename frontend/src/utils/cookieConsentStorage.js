/** Clave en localStorage; persiste la decisión en este navegador (visitante o con sesión). */
export const COOKIE_CONSENT_STORAGE_KEY = "vibeup_cookie_consent";

/** @returns {"accepted" | "rejected" | null} */
export function getStoredCookieConsent() {
    try {
        const v = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
        if (v === "accepted" || v === "rejected") return v;
        return null;
    } catch {
        return null;
    }
}

/** @param {"accepted" | "rejected"} choice */
export function setStoredCookieConsent(choice) {
    try {
        localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);
    } catch {
        /* modo privado u otro bloqueo */
    }
}
