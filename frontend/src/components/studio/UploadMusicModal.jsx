import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { supabase } from "../../supabaseClient";
import { safeMediaUrl } from "../../utils/safeMediaUrl";

export const UploadMusicModal = ({ isOpen, onClose, song, onSongSaved }) => {

    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
    const token = localStorage.getItem('access_token');

    const isEdit = Boolean(song?.id);

    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [category, setCategory] = useState('pop');
    const [file, setFile] = useState(null);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        if (!isEdit) return;

        setTitle(song.title || '');
        setDuration(song.duration ? String(song.duration) : '');
        setCategory(song.category || 'pop');
        setPreview(song.img || null);
        setFile(null);
        setImage(null);
        setMessage('');
    }, [isOpen, isEdit, song]);

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

    // ===== UPLOADS =====
    async function uploadFile(file) {
        const cleanName = file.name
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9.\-_]/g, "");
        const fileName = `${Date.now()}_${cleanName}`;
        const { error } = await supabase.storage.from('Songs').upload(fileName, file);
        if (error) return null;
        return supabase.storage.from('Songs').getPublicUrl(fileName).data.publicUrl;
    }

    async function uploadImage(image) {
        const fileName = `${Date.now()}_${image.name}`;
        const { error } = await supabase.storage.from('Images').upload(fileName, image);
        if (error) return null;
        return supabase.storage.from('Images').getPublicUrl(fileName).data.publicUrl;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!title) return setMessage("Título obligatorio");
        if (!isEdit && !file) return setMessage("Archivo obligatorio");

        setLoading(true);

        const url_media = file ? await uploadFile(file) : (song?.url || null);
        const url_image = image ? await uploadImage(image) : (song?.img || null);

        const endpoint = isEdit ? `${API_BASE}/api/songs/${song.id}` : `${API_BASE}/api/songs`;
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                url: url_media,
                img: url_image,
                duration: duration ? parseInt(duration) : null,
                category
            })
        });

        const data = await res.json();

        if (!res.ok) {
            setMessage(data.msg || "Error");
        } else {
            setMessage(isEdit ? "Cambios guardados ✅" : "Canción subida 🎵");
            if (onSongSaved) onSongSaved(data.song);
            if (!isEdit) {
                setTitle('');
                setDuration('');
                setCategory('pop');
                setFile(null);
                setImage(null);
                setPreview(null);
            }
            setTimeout(() => {
                setMessage('');
                onClose();
            }, 600);
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
                    <h2>{isEdit ? "Editar canción" : "Subir música"}</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                {/* BODY */}
                <div className="upload-modal__body">

                    {/* LEFT */}
                    <form className="upload-modal__form" onSubmit={handleSubmit}>

                        <div className="upload-modal__field">
                            <label>Título</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                maxLength={100}
                            />
                        </div>

                        <div className="upload-modal__field">
                            <label>Duración (segundos)</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                            />
                        </div>

                        <div className="upload-modal__field">
                            <label>Categoría</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="pop">Pop</option>
                                <option value="rock">Rock</option>
                                <option value="reggaeton">Reggaeton</option>
                                <option value="rap">Rap</option>
                                <option value="electronic">Electrónica</option>
                                <option value="indie">Indie</option>
                                <option value="other">Otra</option>
                            </select>
                        </div>

                        <div className="upload-modal__field">
                            <label>Archivo de audio</label>
                            <input type="file" accept="audio/*" onChange={e => setFile(e.target.files[0])} />
                            {isEdit ? <small style={{ color: 'var(--text-tertiary)' }}>Si no lo cambias, se mantiene el actual.</small> : null}
                        </div>

                        <div className="upload-modal__field">
                            <label>Imagen</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            {isEdit ? <small style={{ color: 'var(--text-tertiary)' }}>Si no la cambias, se mantiene la actual.</small> : null}
                        </div>

                        <button disabled={loading}>
                            {loading ? (isEdit ? "Guardando..." : "Subiendo...") : (isEdit ? "Guardar cambios" : "Publicar")}
                        </button>

                        {message && <p>{message}</p>}
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
                                {title || "Título de la canción"}
                            </p>
                            <p className="upload-modal__preview-sub">
                                {file ? file.name : "Archivo no seleccionado"}
                            </p>
                        </div>

                    </div>

                </div>
            </div>
        </div>,
        document.body
    );
};