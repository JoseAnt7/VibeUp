const rawApiBase = import.meta.env.VITE_API_BASE;

// Requests in the app already include "/api/...".
// In production behind Nginx we want a relative empty base.
// In local dev, VITE_API_BASE can still point to http://localhost:5000.
export const API_BASE = rawApiBase ? rawApiBase.replace(/\/+$/, "") : "";
