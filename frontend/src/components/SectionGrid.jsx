import React from 'react';
import '../assets/css/Home.css';
import { PlaylistCard } from './PlaylistCard';
import { ArtistCard } from './ArtistCard';
import { EventCard } from './EventCard';

export const SectionGrid = ({ title, items = [], onPlay, type, onItemClick, onLike, showLikeButton = false }) => {
    const isArtists = type === 'artists' || title === 'Artistas';
    const isEvents = type === 'events' || title === 'Eventos';

    const gridClass = isArtists
        ? 'section-grid__grid section-grid__grid--artists'
        : isEvents
            ? 'section-grid__grid section-grid__grid--events'
            : 'section-grid__grid';

    return (
        <section className="section-grid">
            <h3 className="section-grid__title">{title}</h3>
            <div className={gridClass}>
                {items.map((it, idx) => (
                    isArtists ? (
                        <ArtistCard
                            key={it.id ?? idx}
                            item={it}
                            onItemClick={onItemClick}
                        />
                    ) : isEvents ? (
                        <EventCard
                            key={it.id ?? idx}
                            event={it}
                            onClick={onItemClick}
                        />
                    ) : (
                        <PlaylistCard
                            key={it.id ?? idx}
                            item={it}
                            onPlay={onPlay}
                            onItemClick={onItemClick}
                            onLike={onLike}
                            showLikeButton={showLikeButton}
                        />
                    )
                ))}
            </div>
        </section>
    )
}
