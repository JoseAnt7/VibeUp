import React, { useEffect, useState } from "react";
import { UploadMusicModal } from "./UploadMusicModal";
import { CreateAlbumModal } from "./CreateAlbumModal";
import { safeMediaUrl } from "../../utils/safeMediaUrl";

export const Content = () => {

    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
    const token = localStorage.getItem('access_token');

    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [activeTab, setActiveTab] = useState("songs");

    const [songModalOpen, setSongModalOpen] = useState(false);
    const [albumModalOpen, setAlbumModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState(null);
    const [editingAlbum, setEditingAlbum] = useState(null);

    useEffect(() => {
        if (!token) return;

        fetch(`${API_BASE}/api/songs`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.songs) setSongs(data.songs);
            });

        fetch(`${API_BASE}/api/albums`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.albums) setAlbums(data.albums);
            });

    }, [API_BASE, token]);

    const handleDeleteSong = async (song) => {
        if (!window.confirm(`¿Estás seguro de que quieres borrar esta canción?\n\n${song.title}\n\nEsta acción será irreversible.`)) return;
        const res = await fetch(`${API_BASE}/api/songs/${song.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setSongs((prev) => prev.filter((s) => s.id !== song.id));
    };

    const handleDeleteAlbum = async (album) => {
        if (!window.confirm(`¿Estás seguro de que quieres borrar este álbum?\n\n${album.title}\n\nEsta acción será irreversible.`)) return;
        const res = await fetch(`${API_BASE}/api/albums/${album.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setAlbums((prev) => prev.filter((a) => a.id !== album.id));
    };

    return (
        <div className="content">

            {/* TABS */}
            <div className="content__tabs">
                <button
                    className={`content__tab ${activeTab === "songs" ? "content__tab--active" : ""}`}
                    onClick={() => setActiveTab("songs")}
                >
                    Música
                </button>

                <button
                    className={`content__tab ${activeTab === "albums" ? "content__tab--active" : ""}`}
                    onClick={() => setActiveTab("albums")}
                >
                    Álbumes
                </button>
            </div>

            {/* TAB CONTENIDO */}
            {activeTab === "songs" && (
                <div className="content__table">

                    <div className="content__header content__header--songs">
                        <span>Imagen</span>
                        <span>Título</span>
                        <span>Categoría</span>
                        <span>Reproducciones</span>
                        <span>Likes</span>
                        <span>Duración</span>
                        <span>Archivo</span>
                        <span>Acciones</span>
                    </div>

                    {songs.map(song => {
                        const songImg = safeMediaUrl(song.img);
                        return (
                        <div key={song.id} className="content__row content__row--songs">

                            <div className="content__cell">
                                {songImg ? (
                                    <img src={songImg} alt="" />
                                ) : (
                                    <div className="content__placeholder"></div>
                                )}
                            </div>

                            <div className="content__cell">
                                {song.title}
                            </div>

                            <div className="content__cell">
                                {song.category || "-"}
                            </div>

                            <div className="content__cell">
                                {song.plays || 0}
                            </div>

                            <div className="content__cell">
                                {song.likes || 0}
                            </div>

                            <div className="content__cell">
                                {song.duration ? `${song.duration}s` : "-"}
                            </div>

                            <div className="content__cell">
                                {song.url ? "Audio disponible" : "-"}
                            </div>

                            <div className="content__cell content__cell--actions">
                                <button
                                    className="content__action"
                                    type="button"
                                    onClick={() => {
                                        setEditingSong(song);
                                        setSongModalOpen(true);
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    className="content__action content__action--danger"
                                    type="button"
                                    onClick={() => handleDeleteSong(song)}
                                >
                                    Eliminar
                                </button>
                            </div>

                        </div>
                        );
                    })}

                </div>
            )}

            {activeTab === "albums" && (
                <div className="content__table">

                    <div className="content__header content__header--albums">
                        <span>Imagen</span>
                        <span>Título</span>
                        <span>Acciones</span>
                    </div>

                    {albums.map(album => {
                        const albumImg = safeMediaUrl(album.img);
                        return (
                        <div key={album.id} className="content__row content__row--albums">
                            <div className="content__cell">
                                {albumImg ? (
                                    <img src={albumImg} alt="" />
                                ) : (
                                    <div className="content__placeholder"></div>
                                )}
                            </div>

                            <div className="content__cell">{album.title}</div>

                            <div className="content__cell content__cell--actions">
                                <button
                                    className="content__action"
                                    type="button"
                                    onClick={() => {
                                        setEditingAlbum(album);
                                        setAlbumModalOpen(true);
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    className="content__action content__action--danger"
                                    type="button"
                                    onClick={() => handleDeleteAlbum(album)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                        );
                    })}

                </div>
            )}

            <UploadMusicModal
                isOpen={songModalOpen}
                onClose={() => {
                    setSongModalOpen(false);
                    setEditingSong(null);
                }}
                song={editingSong}
                onSongSaved={(saved) => {
                    setSongs((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
                }}
            />

            <CreateAlbumModal
                isOpen={albumModalOpen}
                onClose={() => {
                    setAlbumModalOpen(false);
                    setEditingAlbum(null);
                }}
                album={editingAlbum}
                onAlbumSaved={(saved) => {
                    setAlbums((prev) => prev.map((a) => (a.id === saved.id ? { ...a, ...saved } : a)));
                }}
            />

        </div>
    );
};