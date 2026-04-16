const rawApiBase = import.meta.env.VITE_API_BASE;

// In production behind Nginx we want relative requests to /api.
// In local dev, VITE_API_BASE can still point to http://localhost:5000.
export const API_BASE = rawApiBase ? rawApiBase.replace(/\/+$/, "") : "/api";
