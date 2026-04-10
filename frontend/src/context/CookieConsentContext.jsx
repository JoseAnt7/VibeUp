import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CookieBanner } from "../components/CookieBanner";
import { CookiePolicyModal } from "../components/CookiePolicyModal";
import {
    COOKIE_CONSENT_STORAGE_KEY,
    getStoredCookieConsent,
    setStoredCookieConsent,
} from "../utils/cookieConsentStorage";
import "../assets/css/CookieConsent.css";

const CookieConsentContext = createContext(null);

export function CookieConsentProvider({ children }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [bannerVisible, setBannerVisible] = useState(() => getStoredCookieConsent() === null);

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key !== COOKIE_CONSENT_STORAGE_KEY && e.key !== null) return;
            setBannerVisible(getStoredCookieConsent() === null);
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const submitChoice = useCallback((choice) => {
        setStoredCookieConsent(choice);
        setBannerVisible(false);
        setModalOpen(false);
    }, []);

    const openPolicy = useCallback(() => setModalOpen(true), []);
    const closeModal = useCallback(() => setModalOpen(false), []);

    const value = { openPolicy, closeModal, modalOpen, submitChoice };

    return (
        <CookieConsentContext.Provider value={value}>
            {children}
            <CookieBanner
                visible={bannerVisible}
                onAccept={() => submitChoice("accepted")}
                onReject={() => submitChoice("rejected")}
                onOpenPolicy={openPolicy}
            />
            <CookiePolicyModal
                open={modalOpen}
                onClose={closeModal}
                onAccept={() => submitChoice("accepted")}
                onReject={() => submitChoice("rejected")}
            />
        </CookieConsentContext.Provider>
    );
}

export function useCookieConsent() {
    const ctx = useContext(CookieConsentContext);
    if (!ctx) {
        throw new Error("useCookieConsent debe usarse dentro de CookieConsentProvider");
    }
    return ctx;
}
