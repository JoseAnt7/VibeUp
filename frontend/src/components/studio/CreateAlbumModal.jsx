import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { supabase } from "../../supabaseClient";
import { safeMediaUrl } from "../../utils/safeMediaUrl";

export const CreateAlbumModal = ({ isOpen, onClose, onAlbumCreated, album, onAlbumSaved }) => {

    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
    const token = localStorage.getItem('access_token');

    const isEdit = Boolean(album?.id);
    const [title, setTitle] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // 🎵 Estados para manejo de canciones
    const [songs, setSongs] = useState([]);
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [loadingSongs, setLoadingSongs] = useState(false);

    // ===== CARGAR CANCIONES DEL ARTISTA =====
    useEffect(() => {
        if (!isOpen || !token) return;

        setLoadingSongs(true);
        fetch(`${API_BASE}/api/songs`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.songs) setSongs(data.songs);
            })
            .catch(() => setSongs([]))
            .finally(() => setLoadingSongs(false));
    }, [isOpen, token, API_BASE]);

    useEffect(() => {
        if (!isOpen) return;
        if (!isEdit) return;
        setTitle(album.title || '');
        setPreview(album.img || null);
        const existing = (album.songs || []).map((s) => s.id);
        setSelectedSongs(existing);
        setImage(null);
        setMessage('');
    }, [isOpen, isEdit, album]);

    if (!isOpen) return null;

    // ===== PREVIEW IMAGEN =====
    function handleImageChange(e) {
        const img = e.target.files[0];
        setImage(img);

        if (img) {
            const url = URL.createObjectURL(img);
            setPreview(url);
        }
    }

    // ===== TOGGLE CANCIÓN =====
    const toggleSong = (songId) => {
        setSelectedSongs(prev => 
            prev.includes(songId) 
                ? prev.filter(id => id !== songId)
                : [...prev, songId]
        );
    };

    // ===== UPLOADS =====
    async function uploadImage(image) {
        const fileName = `${Date.now()}_${image.name}`;
        const { error } = await supabase.storage.from('Images').upload(fileName, image);
        if (error) return null;
        return supabase.storage.from('Images').getPublicUrl(fileName).data.publicUrl;
    }

    // ===== CREAR/EDITAR ÁLBUM =====
    async function handleSubmit(e) {
        e.preventDefault();

        if (!title) {
            return setMessage("Título obligatorio");
        }

        setLoading(true);
        setMessage('');

        try {
            const url_image = image ? await uploadImage(image) : (album?.img || null);

            const endpoint = isEdit ? `${API_BASE}/api/albums/${album.id}` : `${API_BASE}/api/albums`;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    img: url_image,
                    song_ids: selectedSongs
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.msg || (isEdit ? "Error al guardar el álbum" : "Error al crear el álbum"));
            } else {
                setMessage(isEdit ? "Cambios guardados ✅" : "Álbum creado 🎵");
                setTimeout(() => {
                    if (isEdit) {
                        if (onAlbumSaved) onAlbumSaved(data.album);
                    } else {
                        if (onAlbumCreated) onAlbumCreated(data.album);
                        setTitle('');
                        setImage(null);
                        setPreview(null);
                        setSelectedSongs([]);
                    }
                    setMessage('');
                    onClose();
                }, 700);
            }
        } catch (error) {
            setMessage("Error en la solicitud");
        }

        setLoading(false);
    }

    const previewSrc = preview ? safeMediaUrl(preview) : null;

    return ReactDOM.createPortal(
        <div className="upload-modal">
            <div className="upload-modal__overlay" onClick={onClose}></div>

            <div className="upload-modal__container">

                {/* HEADER */}
                <div className="upload-modal__header">
                    <h2>{isEdit ? "Editar Álbum" : "Crear Álbum"}</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                {/* BODY */}
                <div className="upload-modal__body">

                    {/* LEFT */}
                    <form className="upload-modal__form" onSubmit={handleSubmit}>

                        {/* TÍTULO */}
                        <div className="upload-modal__field">
                            <label>Título del Álbum</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                maxLength={100}
                                placeholder="Ej: Mi primer álbum"
                            />
                        </div>

                        {/* IMAGEN */}
                        <div className="upload-modal__field">
                            <label>Portada</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                            />
                            {isEdit ? <small style={{ color: 'var(--text-tertiary)' }}>Si no la cambias, se mantiene la actual.</small> : null}
                        </div>

                        {/* CANCIONES */}
                        <div className="upload-modal__field">
                            <label>Canciones ({selectedSongs.length} seleccionadas)</label>
                            {loadingSongs ? (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                    Cargando canciones...
                                </p>
                            ) : songs.length === 0 ? (
                                <p style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                                    No tienes canciones. Sube una primero.
                                </p>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    padding: '8px'
                                }}>
                                    {songs.map(song => (
                                        <label key={song.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 12px',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                            border: selectedSongs.includes(song.id) 
                                                ? '1px solid var(--accent-color)' 
                                                : '1px solid transparent'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedSongs.includes(song.id)}
                                                onChange={() => toggleSong(song.id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span style={{
                                                flex: 1,
                                                fontSize: '13px',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {song.title}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                background: loading ? 'var(--text-secondary)' : 'var(--accent-color)',
                                color: loading ? 'var(--text-tertiary)' : '#000',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                transition: 'all var(--transition-fast)',
                                marginTop: '16px'
                            }}
                        >
                            {loading ? (isEdit ? "Guardando..." : "Creando...") : (isEdit ? "Guardar cambios" : "Crear Álbum")}
                        </button>

                        {message && <p style={{
                            marginTop: '12px',
                            color: message.includes('Error') ? '#ef4444' : 'var(--accent-color)',
                            fontSize: '13px'
                        }}>{message}</p>}
                    </form>

                    {/* RIGHT (PREVIEW) */}
                    <div className="upload-modal__preview">

                        <div className="upload-modal__image">
                            {previewSrc ? (
                                <img src={previewSrc} alt="preview" />
                            ) : (
                                <div className="upload-modal__placeholder">
                                    Vista previa
                                </div>
                            )}
                        </div>

                        <div className="upload-modal__info">
                            <p className="upload-modal__preview-title">
                                {title || "Título del álbum"}
                            </p>
                            <p className="upload-modal__preview-sub">
                                {selectedSongs.length > 0 
                                    ? `${selectedSongs.length} canción${selectedSongs.length !== 1 ? 'es' : ''} incluida${selectedSongs.length !== 1 ? 's' : ''}`
                                    : "Sin canciones seleccionadas"
                                }
                            </p>
                        </div>

                    </div>

                </div>
            </div>
        </div>,
        document.body
    );
};
