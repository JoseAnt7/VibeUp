/**
 * URL segura para src de <img> / <audio>: bloquea javascript:, data: peligrosos, // (protocol-relative).
 * Permite http(s), rutas relativas (/…), y blob: (vistas previas locales antes de subir).
 */
export function safeMediaUrl(url, fallback = null) {
    if (url == null || url === "") return fallback;
    const s = String(url).trim();
    if (s.startsWith("blob:")) return s;
    if (s.startsWith("/") && !s.startsWith("//")) return s;
    try {
        const u = new URL(s);
        if (u.protocol === "http:" || u.protocol === "https:") return s;
    } catch {
        /* no es URL absoluta */
    }
    return fallback;
}
