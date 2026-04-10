import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export const Panel_Usuario = () => {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    });

    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);

    const [songTitle, setSongTitle] = useState('');
    const [songDuration, setSongDuration] = useState('');
    const [albumTitle, setAlbumTitle] = useState('');

    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [image, setImage] = useState(null);

    const [isArtist, setIsArtist] = useState(false);

    const token = localStorage.getItem('access_token');

    // 🔥 Obtener canciones y álbumes (solo si es artista)
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

    // 🔥 Saber si es artista
    useEffect(() => {
        if (!token) return;

        fetch(`${API_BASE}/api/me/artist`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                setIsArtist(data.is_artist);
            });
    }, [token]);

    // =====================
    // 📦 SUBIDA ARCHIVOS
    // =====================

    async function uploadImage(image) {
        const cleanName = image.name
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9.\-_]/g, "");

        const fileName = `${Date.now()}_${cleanName}`;

        const { error } = await supabase
            .storage
            .from('Images')
            .upload(fileName, image);

        if (error) return null;

        const { data } = supabase
            .storage
            .from('Images')
            .getPublicUrl(fileName);

        return data.publicUrl;
    }

    async function uploadFile(file) {
        const cleanName = file.name
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9.\-_]/g, "");

        const fileName = `${Date.now()}_${cleanName}`;

        const { error } = await supabase
            .storage
            .from('Songs')
            .upload(fileName, file);

        if (error) return null;

        const { data } = supabase
            .storage
            .from('Songs')
            .getPublicUrl(fileName);

        return data.publicUrl;
    }

    // =====================
    // 🎵 CREAR CANCIÓN
    // =====================

    async function handleAddSong(e) {
        e.preventDefault();

        if (!songTitle) return setMessage('El título es obligatorio');

        const url_media = await uploadFile(file);
        const url_image = image ? await uploadImage(image) : null;

        try {
            const res = await fetch(`${API_BASE}/api/songs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: songTitle,
                    url: url_media,
                    img: url_image,
                    duration: songDuration ? parseInt(songDuration, 10) : null
                })
            });

            const data = await res.json();

            if (res.status === 403) {
                return setMessage("Debes ser artista para subir canciones");
            }

            if (!res.ok) return setMessage(data.msg || 'Error creando canción');

            setSongs(prev => [...prev, data.song]);
            setSongTitle('');
            setSongDuration('');
            setFile(null);
            setImage(null);

            setMessage('Canción creada 🎵');

        } catch {
            setMessage('Error de conexión');
        }
    }

    // =====================
    // 💿 CREAR ÁLBUM
    // =====================

    async function handleAddAlbum(e) {
        e.preventDefault();

        if (!albumTitle) return setMessage('El título del álbum es obligatorio');

        try {
            const res = await fetch(`${API_BASE}/api/albums`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: albumTitle
                })
            });

            const data = await res.json();

            if (res.status === 403) {
                return setMessage("Debes ser artista para crear álbumes");
            }

            if (!res.ok) return setMessage(data.msg || 'Error creando álbum');

            setAlbums(prev => [...prev, data.album]);
            setAlbumTitle('');

            setMessage('Álbum creado 💿');

        } catch {
            setMessage('Error de conexión');
        }
    }

    // =====================
    // 🎤 CREAR ARTISTA
    // =====================

    async function createArtist() {
        const res = await fetch(`${API_BASE}/api/artists`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name: user.username,
                img: null
            })
        });

        if (res.ok) {
            setIsArtist(true);
            setMessage("Ahora eres artista 🎤");
        }
    }

    return (
        <div style={{ maxWidth: 800, margin: '20px auto' }}>
            <h1>Panel de Usuario</h1>

            {user ? (
                <p>Bienvenido, <strong>{user.username}</strong></p>
            ) : (
                <p>No hay usuario logeado.</p>
            )}

            {/* 🎤 CREAR ARTISTA */}
            {!isArtist && (
                <div>
                    <p>No eres artista.</p>
                    <button onClick={createArtist}>Convertirme en artista</button>
                </div>
            )}

            {/* 🎵 CREAR CANCIÓN */}
            {isArtist && (
                <section>
                    <h2>Añadir Canción</h2>
                    <form onSubmit={handleAddSong} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
                        <input
                            placeholder="Título"
                            value={songTitle}
                            onChange={e => setSongTitle(e.target.value)}
                            required
                        />

                        <input
                            placeholder="Duración (seg)"
                            value={songDuration}
                            onChange={e => setSongDuration(e.target.value)}
                        />

                        <input type="file" accept="audio/*" required onChange={(e) => setFile(e.target.files[0])} />
                        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

                        <button type="submit">Añadir Canción</button>
                    </form>
                </section>
            )}

            {/* 💿 CREAR ÁLBUM */}
            {isArtist && (
                <section style={{ marginTop: 20 }}>
                    <h2>Añadir Álbum</h2>
                    <form onSubmit={handleAddAlbum} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
                        <input
                            placeholder="Título del álbum"
                            value={albumTitle}
                            onChange={e => setAlbumTitle(e.target.value)}
                            required
                        />
                        <button type="submit">Crear Álbum</button>
                    </form>
                </section>
            )}

            {message && <p style={{ marginTop: 12 }}>{message}</p>}

            {/* LISTAS */}
            <section style={{ marginTop: 20 }}>
                <h3>Tus canciones</h3>
                {songs.length === 0 ? <p>No tienes canciones.</p> : (
                    <ul>
                        {songs.map(s => (
                            <li key={s.id}>
                                {s.title} {s.duration ? `- ${s.duration}s` : ''}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section style={{ marginTop: 20 }}>
                <h3>Tus álbumes</h3>
                {albums.length === 0 ? <p>No tienes álbumes.</p> : (
                    <ul>
                        {albums.map(a => (
                            <li key={a.id}>{a.title}</li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};