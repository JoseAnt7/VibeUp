import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Home } from "./Pages/Home";
import { Forms } from "./Pages/Formularios-sesion";
import { Panel_Usuario } from "./Pages/Panel_Usuario-Test";
import { Upload_test } from "./Pages/Upload_test";
import { Artist } from "./Pages/artista/Artist";
import { AccountSettings } from "./Pages/AccountSettings";
import { SearchResults } from "./Pages/SearchResults";
import { ArtistPublic } from "./Pages/ArtistPublic";
import { AlbumPublic } from "./Pages/AlbumPublic";
import { EventPublic } from "./Pages/EventPublic";
import { AvisoLegal } from "./Pages/AvisoLegal";
import { PoliticaPrivacidad } from "./Pages/PoliticaPrivacidad";
import { CondicionesContenidoLicenciaArtista } from "./Pages/CondicionesContenidoLicenciaArtista";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { EmailTemplatesLayout } from "./templates/EmailTemplatesLayout";
import { EmailTemplatesIndex } from "./templates/EmailTemplatesIndex";
import { EmailRegisterSuccess } from "./templates/EmailRegisterSuccess";
import { EmailPasswordChanged } from "./templates/EmailPasswordChanged";
import { EmailEventRsvp } from "./templates/EmailEventRsvp";
import { EmailWeeklySummary } from "./templates/EmailWeeklySummary";
import { EmailEventReminderAttendee } from "./templates/EmailEventReminderAttendee";
import { EmailEventReminderCreator } from "./templates/EmailEventReminderCreator";
import {
  clearAuthSession,
  isAccessTokenExpired,
  scheduleAccessTokenExpiry,
  cancelScheduledAccessTokenExpiry,
  notifySessionCleared,
} from "./utils/authSession";
import { CookieConsentProvider } from "./context/CookieConsentContext";

const PROTECTED_PREFIXES = ["/studio", "/user", "/account-settings"];

function SessionSync() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const redirectIfProtected = () => {
      const path = window.location.pathname;
      if (PROTECTED_PREFIXES.some((p) => path.startsWith(p))) {
        navigate("/session", { replace: true });
      }
    };

    const onExpired = () => {
      notifySessionCleared();
      redirectIfProtected();
    };

    const sync = () => {
      cancelScheduledAccessTokenExpiry();
      const token = localStorage.getItem("access_token");

      if (!token) {
        if (localStorage.getItem("user")) {
          clearAuthSession();
          notifySessionCleared();
        }
        return;
      }

      if (isAccessTokenExpired(token)) {
        clearAuthSession();
        onExpired();
        return;
      }

      scheduleAccessTokenExpiry(onExpired);
    };

    sync();

    const onFocus = () => sync();
    const onStorage = (e) => {
      if (e.key === "access_token" || e.key === "user") sync();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);

    return () => {
      cancelScheduledAccessTokenExpiry();
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [location.pathname, navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <CookieConsentProvider>
        <SessionSync />
        <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/session" element={<Forms/>} />
        <Route path="/user" element={<ProtectedRoute><Panel_Usuario /></ProtectedRoute>} />
        <Route path="/upload" element={<Upload_test />} />
        <Route path="/studio" element={<ProtectedRoute><Artist /></ProtectedRoute>} />
        <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/artist/:artistName" element={<ArtistPublic />} />
        <Route path="/album/:albumSlug" element={<AlbumPublic />} />
        <Route path="/event/:eventId" element={<EventPublic />} />
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
        <Route
          path="/condiciones-contenido-licencia-artista"
          element={<CondicionesContenidoLicenciaArtista />}
        />

        <Route path="/templates/email" element={<EmailTemplatesLayout />}>
          <Route index element={<EmailTemplatesIndex />} />
          <Route path="registro" element={<EmailRegisterSuccess />} />
          <Route path="contrasena" element={<EmailPasswordChanged />} />
          <Route path="evento-apuntado" element={<EmailEventRsvp />} />
          <Route path="resumen-semanal" element={<EmailWeeklySummary />} />
          <Route path="evento-3d-asistente" element={<EmailEventReminderAttendee />} />
          <Route path="evento-3d-creador" element={<EmailEventReminderCreator />} />
        </Route>
      </Routes>
      </CookieConsentProvider>
    </BrowserRouter>
  );
}

export default App;