import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar_Home } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Player } from "../components/Player";
import { API_BASE } from "../utils/apiBase";
import { safeMediaUrl } from "../utils/safeMediaUrl";
import { toSlug } from "../utils/slug";
import Logo from "../assets/img/logo.png";
import "../assets/css/PublicDetail.css";

export const AlbumPublic = () => {
    const { albumSlug } = useParams();
    const navigate = useNavigate();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentSong, setCurrentSong] = useState(null);
    const [queueIndex, setQueueIndex] = useState(0);
    const [playerQueue, setPlayerQueue] = useState([]);

    useEffect(() => {
        setLoading(true);
        setError("");
        fetch(`${API_BASE}/api/public/albums-with-songs`)
            .then((r) => r.json())
            .then((data) => {
                const found = (data.albums || []).find((a) => toSlug(a.title) === albumSlug);
                if (!found) {
                    setError("No se encontró el álbum.");
                    setAlbum(null);
                    return;
                }
                setAlbum(found);
            })
            .catch(() => setError("Error al cargar el álbum."))
            .finally(() => setLoading(false));
    }, [albumSlug]);

    const songs = useMemo(() => (album?.songs || []).filter((s) => s.url), [album]);

    const playSong = (songId = null) => {
        if (!songs.length) return;
        const start = songId
            ? Math.max(songs.findIndex((s) => s.id === songId), 0)
            : 0;
        setPlayerQueue(songs);
        setQueueIndex(start);
        setCurrentSong(songs[start]);
    };

    const handleSongEnded = () => {
        const nextIndex = queueIndex + 1;
        if (nextIndex >= playerQueue.length) return;
        setQueueIndex(nextIndex);
        setCurrentSong(playerQueue[nextIndex]);
    };

    return (
        <div className="public-detail public-detail--with-player">
            <Navbar_Home />
            <main className="public-detail__main">
                <button type="button" className="public-detail__back" onClick={() => navigate(-1)}>
                    Volver
                </button>
                {loading ? (
                    <div className="public-detail__state">
                        <p>Cargando álbum...</p>
                    </div>
                ) : error ? (
                    <div className="public-detail__state">
                        <p>{error}</p>
                    </div>
                ) : album ? (
                    <>
                        <section className="public-detail__hero">
                            <img src={safeMediaUrl(album.img, Logo)} alt={album.title} />
                            <div className="public-detail__hero-meta">
                                <p className="public-detail__eyebrow">Álbum</p>
                                <h1>{album.title}</h1>
                                <p className="public-detail__artist">{album.artist_name || "Artista desconocido"}</p>
                                <p className="public-detail__count">
                                    {(album.songs || []).length} {(album.songs || []).length === 1 ? "canción" : "canciones"}
                                </p>
                                <button type="button" className="public-detail__play-all" onClick={() => playSong()}>
                                    Reproducir álbum
                                </button>
                            </div>
                        </section>
                        <section className="public-detail__list">
                            <h2>Canciones</h2>
                            {(album.songs || []).length ? (
                                (album.songs || []).map((song) => (
                                    <button
                                        key={song.id}
                                        type="button"
                                        className="public-detail__row"
                                        onClick={() => playSong(song.id)}
                                        disabled={!song.url}
                                    >
                                        <img src={safeMediaUrl(song.img || album.img, Logo)} alt={song.title} />
                                        <span>{song.title}</span>
                                    </button>
                                ))
                            ) : (
                                <p>Este álbum no tiene canciones aún.</p>
                            )}
                        </section>
                    </>
                ) : null}
            </main>
            <Footer />
            <Player
                song={currentSong}
                playbackContext={album ? { albumTitle: album.title, totalSongs: playerQueue.length } : null}
                queueIndex={queueIndex}
                onSongEnd={handleSongEnded}
            />
        </div>
    );
};
