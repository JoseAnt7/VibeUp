import React, { useEffect, useState } from "react";
import { Navbar_Artist } from "../../components/Navbar.jsx";
import { Sidebar } from "../../components/Sidebar.jsx";
import '../../assets/css/Studio.css';
import { Dashboard } from "../../components/studio/Dashboard.jsx";
import { Content } from "../../components/studio/Content.jsx";
import { CreateArtistProfileModal } from "../../components/studio/CreateArtistProfileModal.jsx";
import { StudioAnalytics } from "../../components/studio/StudioAnalytics.jsx";
import { StudioEvents } from "../../components/studio/StudioEvents.jsx";

export const Artist = () => {

    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const [artist, setArtist] = useState(null);
    const [checkingArtist, setCheckingArtist] = useState(true);
    const [mustCreateProfile, setMustCreateProfile] = useState(false);

    const [view, setView] = useState("dashboard");
    const [analyticsTab, setAnalyticsTab] = useState("views");

    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

    useEffect(() => {
        if (!token) {
            setCheckingArtist(false);
            setMustCreateProfile(false);
            return;
        }

        fetch(`${API_BASE}/api/me/artist`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async (r) => {
                const data = await r.json();
                if (!r.ok) {
                    // Si el endpoint falla, forzamos onboarding para no dejar Studio inconsistente.
                    return { is_artist: false, artist: null };
                }
                return data;
            })
            .then(data => {
                setArtist(data.artist || null);
                setMustCreateProfile(!data.is_artist);
            })
            .finally(() => setCheckingArtist(false));

    }, [token, API_BASE]);

    const goToStats = (tab) => {
        setAnalyticsTab(tab);
        setView("stats");
    };

    const handleSidebarView = (key) => {
        if (!key) return;
        setView(key);
        if (key === "stats") {
            setAnalyticsTab("views");
        }
    };

    const renderView = () => {
        switch (view) {
            case "dashboard":
                return <Dashboard onGoToStats={goToStats} />;
            case "content":
                return <Content />;
            case "stats":
                return (
                    <StudioAnalytics
                        activeTab={analyticsTab}
                        onTabChange={setAnalyticsTab}
                    />
                );
            case "events":
                return <StudioEvents />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="layout">
            <Navbar_Artist />

            <div className="layout__body">
                <Sidebar 
                    user={artist?.name} 
                    active={view} 
                    onChangeView={handleSidebarView}
                    img={artist?.img} 
                />

                <main className="layout__content">
                    {checkingArtist ? null : renderView()}
                </main>
            </div>

            {!checkingArtist && (
                <CreateArtistProfileModal
                    isOpen={mustCreateProfile}
                    username={user?.username || ""}
                    onCreated={(newArtist) => {
                        setArtist(newArtist);
                        setMustCreateProfile(false);
                    }}
                />
            )}
        </div>
    );
};