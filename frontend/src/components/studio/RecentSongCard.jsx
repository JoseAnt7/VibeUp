import React, { useEffect, useState } from "react";
import { UploadMusicModal } from "./UploadMusicModal";
import { safeMediaUrl } from "../../utils/safeMediaUrl";
import { API_BASE } from "../../utils/apiBase";

export const RecentSongCard = () => {

        const token = localStorage.getItem('access_token');

    const [recentSong, setRecentSong] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        if (!token) return;

        fetchRecentSong();
    }, [token]);

    const fetchRecentSong = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/api/songs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const data = await response.json();

            if (data.songs && data.songs.length > 0) {
                // Obtener la última canción (la más reciente)
                const lastSong = data.songs[data.songs.length - 1];
                setRecentSong(lastSong);
                setError(null);
            }
        } catch (err) {
            setError("Error al cargar la canción reciente");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="recent-song-card">
                <div className="recent-song-card__skeleton">Cargando...</div>
            </div>
        );
    }

    if (error || !recentSong) {
        return null;
    }

    const formatDuration = (seconds) => {
        if (!seconds) return "-";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatAvgWatch = (seconds) => {
        const s = Number(seconds || 0);
        if (!s) return "-";
        const mins = Math.floor(s / 60);
        const secs = Math.round(s % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const coverUrl = safeMediaUrl(recentSong.img);

    return (
        <>
            <div className="recent-song-card">

                {/* HEADER */}
                <div className="recent-song-card__header">
                    <h3 className="recent-song-card__title">ltima canción subida</h3>
                    <span className="recent-song-card__badge">Publicado</span>
                </div>

                {/* CARD CONTENEDOR */}
                <div className="recent-song-card__container">

                    {/* LEFT - IMAGEN */}
                    <div className="recent-song-card__image-wrapper">
                        {coverUrl ? (
                            <img 
                                src={coverUrl} 
                                alt={recentSong.title}
                                className="recent-song-card__image"
                            />
                        ) : (
                            <div className="recent-song-card__image-placeholder">
                                
                            </div>
                        )}
                    </div>

                    {/* RIGHT - INFORMACIN */}
                    <div className="recent-song-card__info">

                        <div className="recent-song-card__content">
                            <h4 className="recent-song-card__song-title">
                                {recentSong.title}
                            </h4>

                            <div className="recent-song-card__stats">
                                <div className="recent-song-card__stat">
                                    <span className="recent-song-card__stat-label">Duración</span>
                                    <span className="recent-song-card__stat-value">
                                        {formatDuration(recentSong.duration)}
                                    </span>
                                </div>

                                <div className="recent-song-card__stat">
                                    <span className="recent-song-card__stat-label">Likes</span>
                                    <span className="recent-song-card__stat-value">
                                        {recentSong.likes || 0}
                                    </span>
                                </div>

                                <div className="recent-song-card__stat">
                                    <span className="recent-song-card__stat-label">Reproducciones</span>
                                    <span className="recent-song-card__stat-value">
                                        {recentSong.plays || 0}
                                    </span>
                                </div>

                                <div className="recent-song-card__stat">
                                    <span className="recent-song-card__stat-label">Tiempo medio</span>
                                    <span className="recent-song-card__stat-value">
                                        {formatAvgWatch(recentSong.avg_listen_seconds)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div className="recent-song-card__actions">
                            <button className="recent-song-card__btn recent-song-card__btn--view">
                                Ver detalles
                            </button>
                            <button 
                                className="recent-song-card__btn recent-song-card__btn--upload"
                                onClick={() => setOpenModal(true)}
                            >
                                Subir otra
                            </button>
                        </div>

                    </div>

                </div>

            </div>

            {/* MODAL */}
            <UploadMusicModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
            />
        </>
    );
};

