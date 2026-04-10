import React from 'react';
import '../assets/css/Home.css';
import Logo from '../assets/img/logo.png';
import { safeMediaUrl } from '../utils/safeMediaUrl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

export const PlaylistCard = ({ item, onPlay, onItemClick, onLike, showLikeButton = false }) => {
    const handleClick = () => {
        if (onItemClick) {
            onItemClick(item);
            return;
        }
        if (onPlay) onPlay(item);
    };

    return (
        <div className="song-card" onClick={handleClick}>
            <div className="song-card__image-wrapper">
                <img src={safeMediaUrl(item.img, Logo)} alt={item.title} className="song-card__image" />
                <div className="song-card__overlay">
                    <button className="song-card__play-btn" title="Reproducir">
                        <FontAwesomeIcon icon={faPlay} />
                    </button>
                </div>
            </div>
            <div className="song-card__info">
                <h4 className="song-card__title">{item.title}</h4>
                <p className="song-card__subtitle">{item.subtitle || 'Canción'}</p>
                {item.url ? (
                    <p className="song-card__subtitle">
                        {(item.category || 'Sin categoría')} · ❤️ {item.likes || 0} · ▶ {item.plays || 0}
                    </p>
                ) : null}
                {showLikeButton && item.url ? (
                    <button
                        type="button"
                        className="song-card__like-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onLike) onLike(item);
                        }}
                    >
                        Me gusta
                    </button>
                ) : null}
            </div>
        </div>
    )
}
