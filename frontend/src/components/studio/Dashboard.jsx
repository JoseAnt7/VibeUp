// components/studio/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Card } from "./Card";
import { StatsCard } from "./StatsCard";
import { UploadMusicModal } from "./UploadMusicModal";
import { RecentSongCard } from "./RecentSongCard";
import { WeeklyMetricCards } from "./WeeklyMetricCards";
import { API_BASE } from "../../utils/apiBase";

/**
 * @param {{ onGoToStats?: (tab: 'views' | 'watch' | 'subs') => void }} props
 */
export const Dashboard = ({ onGoToStats }) => {

    const [openModal, setOpenModal] = useState(false);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

        const token = localStorage.getItem('access_token');

    useEffect(() => {
        if (!token) return;

        fetchSongs();
    }, [token]);

    const fetchSongs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/api/songs`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.songs) {
                setSongs(data.songs);
            }
        } catch (err) {
            console.error("Error fetching songs:", err);
        } finally {
            setLoading(false);
        }
    };

    // Determinar si hay canciones publicadas
    const hasSongs = songs && songs.length > 0;

    return (
        <div className="studio">

            <h2 className="studio__title">Panel de control del canal</h2>

            <div className="studio__grid">

                <div className="studio__hero-row">
                    {!hasSongs ? (
                        <Card className="studio__upload studio__hero-main">
                            <div className="upload">
                                <div className="upload__icon"></div>
                                <p className="upload__text">
                                    ¿Quieres ver las métricas de la música que subas?
                                </p>
                                <button
                                    className="upload__button"
                                    onClick={() => setOpenModal(true)}
                                >
                                    Subir música
                                </button>
                                <UploadMusicModal
                                    isOpen={openModal}
                                    onClose={() => setOpenModal(false)}
                                />
                            </div>
                        </Card>
                    ) : (
                        <div className="studio__hero-main">
                            <RecentSongCard />
                        </div>
                    )}

                    <div className="studio__hero-aside">
                        <StatsCard onGoToStats={onGoToStats} />
                    </div>
                </div>

                {onGoToStats ? (
                    <div className="studio__week-metrics" aria-label="Métricas semanales">
                        <WeeklyMetricCards onGoToStats={onGoToStats} />
                    </div>
                ) : null}

                <Card className="studio__education-span">
                    <div className="education">
                        <h4>Explora las oportunidades de VibeUp</h4>
                        <img
                            src="https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg"
                            alt=""
                        />
                        <p className="education__text">
                            Lanza tus proyectos este 2026. ¿A qué esperas?
                        </p>
                    </div>
                </Card>

            </div>
        </div>
    );
};
