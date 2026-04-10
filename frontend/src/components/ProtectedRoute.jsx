import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    clearAuthSession,
    isAccessTokenExpired,
    notifySessionCleared,
} from "../utils/authSession";

export const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');

            if (!token || isAccessTokenExpired(token)) {
                clearAuthSession();
                notifySessionCleared();
                navigate('/session', { replace: true });
                return;
            }

            try {
                const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
                const res = await fetch(`${API_BASE}/api/validate-token`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) {
                    clearAuthSession();
                    notifySessionCleared();
                    navigate('/session', { replace: true });
                    return;
                }

                setIsAuthenticated(true);
            } catch (err) {
                console.error("Error validating token:", err);
                if (isAccessTokenExpired(token)) {
                    clearAuthSession();
                    notifySessionCleared();
                    navigate('/session', { replace: true });
                    return;
                }
                setIsAuthenticated(true);
            }
        };

        checkAuth();
    }, [navigate]);

    // Mientras se valida el token, mostrar nada o un loader
    if (isAuthenticated === null) {
        return null;
    }

    return isAuthenticated ? children : null;
};
