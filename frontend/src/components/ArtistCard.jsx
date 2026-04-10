import React from 'react';
import '../assets/css/Home.css';
import Logo from '../assets/img/logo.png';
import { safeMediaUrl } from '../utils/safeMediaUrl';

export const ArtistCard = ({ item, onItemClick }) => {
    return (
        <div className="artist-card" onClick={() => onItemClick && onItemClick(item)}>
            {/* IMAGEN CIRCULAR */}
            <div className="artist-card__image-wrapper">
                <img 
                    src={safeMediaUrl(item.img, Logo)} 
                    alt={item.name || item.title} 
                    className="artist-card__image"
                />
                {/* OVERLAY HOVER CON ICONO PLAY */}
                <div className="artist-card__overlay">
                    <button className="artist-card__play-btn" title="Reproducir">
                        ▶
                    </button>
                </div>
            </div>

            {/* INFORMACIÓN DEL ARTISTA */}
            <div className="artist-card__info">
                <h4 className="artist-card__name">{item.name || item.title}</h4>
                <p className="artist-card__role">Artista</p>
            </div>
        </div>
    );
};
