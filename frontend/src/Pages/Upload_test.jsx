import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export const Upload_test = () => {

    const [file, setFile] = useState(null);


    async function uploadFile(file) {
        const cleanName = file.name
            .replace(/\s+/g, "_")                // espacios → _
            .replace(/[^a-zA-Z0-9.\-_]/g, "");   // eliminar caracteres raros

        const fileName = `${Date.now()}_${cleanName}`;
        const { data, error } = await supabase
            .storage
            .from('Songs')
            .upload(fileName, file);

        if (error) {
            console.error("Error subiendo:", error);
            return null;
        }

        const { data: publicUrlData } = supabase
            .storage
            .from('Songs')
            .getPublicUrl(fileName);

        console.log("Archivo subido:", data);
        console.log("URL pública:", publicUrlData.publicUrl);
        return publicUrlData.publicUrl;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert("Selecciona un archivo primero");
            return;
        }

        const url = await uploadFile(file);

        if (url) {
            console.log("Archivo subido:", url);
            alert("Subido correctamente");
        }
    };

    return (
        <div style={{ maxWidth: 420, margin: '40px auto' }}>
            <h2>Subir audio</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 8 }}>
                    <label>Selecciona un archivo de audio</label>
                    <input
                        type="file"
                        accept="audio/*"
                        required
                        style={{ width: '100%' }}
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>
                <button type="submit">Subir</button>
            </form>
        </div>
    );
}