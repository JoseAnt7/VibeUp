import React from "react";
import "../assets/css/Home.css";
import Logo from "../assets/img/logo.png";
import { safeMediaUrl } from "../utils/safeMediaUrl";

export const AlbumModal = ({ album, isOpen, onClose, onPlaySong, onPlayAll }) => {
    if (!isOpen || !album) return null;

    return (
        <div className="album-modal" onClick={onClose}>
            <div className="album-modal__content" onClick={(e) => e.stopPropagation()}>
                <button className="album-modal__close" onClick={onClose}>x</button>

                <div className="album-modal__header">
                    <img className="album-modal__cover" src={safeMediaUrl(album.img, Logo)} alt={album.title} />
                    <div className="album-modal__meta">
                        <h3 className="album-modal__title">{album.title}</h3>
                        <p className="album-modal__artist">{album.artist_name}</p>
                        <button className="album-modal__play-all" onClick={() => onPlayAll(album)}>
                            Reproducir album
                        </button>
                    </div>
                </div>

                <div className="album-modal__songs">
                    {album.songs?.length ? (
                        album.songs.map((song) => (
                            <button
                                key={song.id}
                                className="album-modal__song"
                                onClick={() => onPlaySong(song, album)}
                            >
                                <img
                                    className="album-modal__song-image"
                                    src={safeMediaUrl(song.img || album.img, Logo)}
                                    alt={song.title}
                                />
                                <span className="album-modal__song-title">{song.title}</span>
                            </button>
                        ))
                    ) : (
                        <p className="album-modal__empty">Este album no tiene canciones aun.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
