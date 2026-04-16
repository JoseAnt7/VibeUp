import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { supabase } from "../../supabaseClient";
import { safeMediaUrl } from "../../utils/safeMediaUrl";
import { API_BASE } from "../../utils/apiBase";

function toLocalInput(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Permite eventos el mismo dÃ­a con hora de fin posterior (ej. 21:00 â†’ 23:30).
 * Si en el selector la fecha es la misma pero la hora de fin es Â«antesÂ» que la de inicio
 * (tÃ­pico: fin a medianoche 00:00 el mismo dÃ­a del calendario), se interpreta como fin al dÃ­a siguiente.
 */
function normalizeEndAfterStart(start, end) {
    if (end > start) return end;
    const sameCalendarDay =
        start.getFullYear() === end.getFullYear() &&
        start.getMonth() === end.getMonth() &&
        start.getDate() === end.getDate();
    if (sameCalendarDay && end < start) {
        const adjusted = new Date(end);
        adjusted.setDate(adjusted.getDate() + 1);
        return adjusted;
    }
    return end;
}

export const EventFormModal = ({ isOpen, onClose, event, onSaved }) => {
        const token = localStorage.getItem("access_token");
    const isEdit = Boolean(event?.id);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setMessage("");
        if (isEdit && event) {
            setTitle(event.title || "");
            setDescription(event.description || "");
            setLocation(event.location || "");
            setStartsAt(toLocalInput(event.starts_at));
            setEndsAt(toLocalInput(event.ends_at));
            setPreview(event.img || null);
            setImage(null);
        } else {
            setTitle("");
            setDescription("");
            setLocation("");
            setStartsAt("");
            setEndsAt("");
            setPreview(null);
            setImage(null);
        }
    }, [isOpen, isEdit, event]);

    if (!isOpen) return null;

    async function uploadImage(file) {
        const fileName = `${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from("Images").upload(fileName, file);
        if (error) return null;
        return supabase.storage.from("Images").getPublicUrl(fileName).data.publicUrl;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim() || !location.trim() || !startsAt || !endsAt) {
            setMessage("Completa tÃ­tulo, ubicaciÃ³n e inicio/fin.");
            return;
        }
        const start = new Date(startsAt);
        let end = normalizeEndAfterStart(start, new Date(endsAt));
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            setMessage("Fechas no vÃ¡lidas.");
            return;
        }
        if (end <= start) {
            setMessage(
                "La hora de fin debe ser posterior a la de inicio. " +
                    "Mismo dÃ­a es vÃ¡lido si la hora de cierre es mÃ¡s tarde (ej. 21:00 â†’ 23:30)."
            );
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            let imgUrl = preview;
            if (image) {
                const up = await uploadImage(image);
                if (!up) {
                    setMessage("Error al subir la imagen.");
                    setLoading(false);
                    return;
                }
                imgUrl = up;
            }

            const body = {
                title: title.trim(),
                description: description.trim(),
                location: location.trim(),
                starts_at: start.toISOString(),
                ends_at: end.toISOString(),
                img: imgUrl || null
            };

            const endpoint = isEdit
                ? `${API_BASE}/api/me/events/${event.id}`
                : `${API_BASE}/api/me/events`;
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage(data.msg || "Error al guardar");
                setLoading(false);
                return;
            }
            setMessage(isEdit ? "Cambios guardados" : "Evento creado");
            onSaved?.(data.event);
            window.dispatchEvent(new CustomEvent("studio-events-refresh"));
            setTimeout(() => {
                setMessage("");
                onClose();
            }, 600);
        } catch {
            setMessage("Error de red");
        }
        setLoading(false);
    }

    function handleImageChange(ev) {
        const file = ev.target.files?.[0];
        setImage(file || null);
        if (file) setPreview(URL.createObjectURL(file));
    }

    const previewSrc = preview ? safeMediaUrl(preview) : null;

    return ReactDOM.createPortal(
        <div className="upload-modal">
            <div className="upload-modal__overlay" onClick={onClose} />
            <div className="upload-modal__container">
                <div className="upload-modal__header">
                    <h2>{isEdit ? "Editar evento" : "AÃ±adir evento"}</h2>
                    <button type="button" onClick={onClose}>
                        âœ•
                    </button>
                </div>
                <div className="upload-modal__body">
                    <form className="upload-modal__form" onSubmit={handleSubmit}>
                        <div className="upload-modal__field">
                            <label>Nombre del evento</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(ev) => setTitle(ev.target.value)}
                                maxLength={300}
                                required
                            />
                        </div>
                        <div className="upload-modal__field">
                            <label>DescripciÃ³n</label>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(ev) => setDescription(ev.target.value)}
                                placeholder="Detalles del eventoâ€¦"
                            />
                        </div>
                        <div className="upload-modal__field">
                            <label>UbicaciÃ³n</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(ev) => setLocation(ev.target.value)}
                                required
                            />
                        </div>
                        <div className="upload-modal__field">
                            <label>Inicio</label>
                            <input
                                type="datetime-local"
                                value={startsAt}
                                onChange={(ev) => setStartsAt(ev.target.value)}
                                required
                            />
                        </div>
                        <div className="upload-modal__field">
                            <label>Fin</label>
                            <input
                                type="datetime-local"
                                value={endsAt}
                                onChange={(ev) => setEndsAt(ev.target.value)}
                                required
                            />
                            <small style={{ color: "var(--text-tertiary)", fontSize: 12, lineHeight: 1.4 }}>
                                Puedes usar el mismo dÃ­a con otra hora (ej. inicio 21:00, fin 23:30 o 00:00). Si
                                eliges la misma fecha y una hora de fin menor que la de inicio (p. ej. medianoche
                                00:00), se interpreta como el dÃ­a siguiente a esa hora.
                            </small>
                        </div>
                        <div className="upload-modal__field">
                            <label>Imagen del evento</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            {isEdit ? (
                                <small style={{ color: "var(--text-tertiary)" }}>
                                    Si no eliges archivo, se mantiene la imagen actual.
                                </small>
                            ) : null}
                        </div>
                        {previewSrc ? (
                            <div className="upload-modal__preview">
                                <img src={previewSrc} alt="" style={{ maxWidth: "100%", borderRadius: 8 }} />
                            </div>
                        ) : null}
                        {message ? <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>{message}</p> : null}
                        <button type="submit" className="upload-modal__button upload-modal__button--primary" disabled={loading}>
                            {loading ? "Guardandoâ€¦" : isEdit ? "Guardar cambios" : "Publicar evento"}
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

