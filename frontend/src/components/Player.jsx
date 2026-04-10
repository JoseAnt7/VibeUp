import React, { useEffect, useRef, useState } from "react";
import '../assets/css/Player.css';
import Logo from '../assets/img/logo.png';
import { safeMediaUrl } from '../utils/safeMediaUrl';

export const Player = ({ song, playbackContext, queueIndex, onSongEnd }) => {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
    const audioRef = useRef(null);
    const currentSongIdRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const update = () => {
            if (!audio.duration) return;
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        audio.addEventListener("timeupdate", update);

        return () => {
            audio.removeEventListener("timeupdate", update);
        };
    }, [song]); // 🔥 importante

    useEffect(() => {
        const reportListenTime = async () => {
            const audio = audioRef.current;
            const songId = currentSongIdRef.current;
            if (!audio || !songId || !audio.currentTime) return;
            try {
                await fetch(`${API_BASE}/api/public/songs/${songId}/listen`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ listened_seconds: audio.currentTime })
                });
            } catch {
                // noop
            }
        };

        reportListenTime();
        if (song && audioRef.current) {
            const u = safeMediaUrl(song.url, '');
            if (!u) {
                currentSongIdRef.current = null;
                return;
            }
            currentSongIdRef.current = song.id;
            audioRef.current.src = u;
            audioRef.current.play();
            setIsPlaying(true);
            fetch(`${API_BASE}/api/public/songs/${song.id}/play`, { method: "POST" }).catch(() => { });
        }
    }, [song, API_BASE]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            const songId = currentSongIdRef.current;
            if (songId) {
                fetch(`${API_BASE}/api/public/songs/${songId}/listen`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ listened_seconds: audio.currentTime || 0 })
                }).catch(() => { });
            }
            if (onSongEnd) onSongEnd();
        };

        audio.addEventListener("ended", handleEnded);
        return () => {
            audio.removeEventListener("ended", handleEnded);
        };
    }, [onSongEnd, API_BASE]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }

        setIsPlaying(!isPlaying);
    };

    if (!song) return null;

    return (
    <div className="player">

        {/* LEFT */}
        <div className="player__left">
            <img src={safeMediaUrl(song.img, Logo)} alt={song.title} />
            <div className="player__info">
                <div className="player__title">{song.title}</div>
                {playbackContext?.albumTitle ? (
                    <div className="player__subtitle">
                        {playbackContext.albumTitle} - {(queueIndex || 0) + 1} de {playbackContext.totalSongs}
                    </div>
                ) : null}
            </div>
        </div>

        {/* CENTER */}
        <div className="player__center">
            <div className="player__controls">
                <button onClick={togglePlay}>
                    {isPlaying ? "⏸" : "▶"}
                </button>
            </div>

            <input
                className="player__progress"
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => {
                    const audio = audioRef.current;
                    if (!audio) return;
                    audio.currentTime = (e.target.value / 100) * audio.duration;
                }}
            />
        </div>

        {/* RIGHT */}
        <div className="player__right">
            <input
                className="player__volume"
                type="range"
                min="0"
                max="1"
                step="0.01"
                onChange={(e) => audioRef.current.volume = e.target.value}
            />
        </div>

        <audio ref={audioRef} />
    </div>
);
};