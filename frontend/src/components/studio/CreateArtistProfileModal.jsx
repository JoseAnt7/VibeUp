import React, { useState } from "react";
import ReactDOM from "react-dom";
import { supabase } from "../../supabaseClient";

export const CreateArtistProfileModal = ({ isOpen, onCreated, username }) => {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
    const token = localStorage.getItem("access_token");

    const [name, setName] = useState(username || "");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    if (!isOpen) return null;

    function handleImageChange(e) {
        const img = e.target.files[0];
        setImage(img);
        if (!img) {
            setPreview(null);
            return;
        }
        setPreview(URL.createObjectURL(img));
    }

    async function uploadImage(file) {
        const safeName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9.\-_]/g, "");
        const fileName = `${Date.now()}_${safeName}`;
        const { error } = await supabase.storage.from("Images").upload(fileName, file);
        if (error) return null;
        return supabase.storage.from("Images").getPublicUrl(fileName).data.publicUrl;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) {
            setMessage("El nombre de artista es obligatorio");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const imgUrl = image ? await uploadImage(image) : null;

            const res = await fetch(`${API_BASE}/api/artists`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: name.trim(),
                    img: imgUrl
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setMessage(data.msg || "No se pudo crear el perfil");
                return;
            }

            if (onCreated) onCreated(data.artist);
        } catch {
            setMessage("Error de conexión");
        } finally {
            setLoading(false);
        }
    }

    return ReactDOM.createPortal(
        <div className="artist-onboarding">
            <div className="artist-onboarding__overlay"></div>
            <div className="artist-onboarding__modal">
                <h2 className="artist-onboarding__title">Crea tu perfil de artista</h2>
                <p className="artist-onboarding__desc">
                    Antes de usar Studio necesitamos configurar tu perfil. Este paso es obligatorio.
                </p>

                <form className="artist-onboarding__form" onSubmit={handleSubmit}>
                    <div className="artist-onboarding__field">
                        <label>Nombre de artista</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={120}
                            placeholder="Ej: DJ Aurora"
                        />
                    </div>

                    <div className="artist-onboarding__field">
                        <label>Imagen de perfil</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>

                    <div className="artist-onboarding__preview">
                        {preview ? <img src={preview} alt="preview artista" /> : <span>Vista previa</span>}
                    </div>

                    <button className="artist-onboarding__submit" type="submit" disabled={loading}>
                        {loading ? "Creando perfil..." : "Finalizar creación"}
                    </button>

                    {message ? <p className="artist-onboarding__message">{message}</p> : null}
                </form>
            </div>
        </div>,
        document.body
    );
};
