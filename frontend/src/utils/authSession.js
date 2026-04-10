/** @typedef {'auth:session-cleared'} AuthSessionClearedEvent */

export const AUTH_SESSION_CLEARED = "auth:session-cleared";

/**
 * Decode JWT payload (client-side, no signature verification — only for `exp`).
 * @param {string | null} token
 * @returns {Record<string, unknown> | null}
 */
export function parseJwtPayload(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    try {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
        const json = decodeURIComponent(
            atob(padded)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/**
 * @param {string | null} token
 */
export function isAccessTokenExpired(token) {
    const payload = parseJwtPayload(token);
    const exp = payload && typeof payload.exp === "number" ? payload.exp : null;
    if (exp == null) return true;
    return Date.now() >= exp * 1000;
}

export function clearAuthSession() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
}

export function notifySessionCleared() {
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_CLEARED));
}

let expiryTimerId = null;

/**
 * When the access token reaches expiry, clear storage and run the callback (e.g. redirect).
 * @param {() => void} [onExpired]
 */
export function scheduleAccessTokenExpiry(onExpired) {
    if (expiryTimerId != null) {
        clearTimeout(expiryTimerId);
        expiryTimerId = null;
    }
    const token = localStorage.getItem("access_token");
    if (!token || isAccessTokenExpired(token)) {
        if (token) clearAuthSession();
        onExpired?.();
        return;
    }
    const payload = parseJwtPayload(token);
    const exp = payload && typeof payload.exp === "number" ? payload.exp : null;
    if (exp == null) {
        clearAuthSession();
        onExpired?.();
        return;
    }
    const ms = Math.max(0, exp * 1000 - Date.now()) + 250;
    expiryTimerId = window.setTimeout(() => {
        expiryTimerId = null;
        clearAuthSession();
        onExpired?.();
    }, ms);
}

export function cancelScheduledAccessTokenExpiry() {
    if (expiryTimerId != null) {
        clearTimeout(expiryTimerId);
        expiryTimerId = null;
    }
}
