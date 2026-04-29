import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Home.css';
import { PlaylistCard } from './PlaylistCard';
import { ArtistCard } from './ArtistCard';
import { EventCard } from './EventCard';

export const SectionGrid = ({
    title,
    items = [],
    onPlay,
    type,
    onItemClick,
    onLike,
    showLikeButton = false,
    viewAllHref = null
}) => {
    const isArtists = type === 'artists' || title === 'Artistas';
    const isEvents = type === 'events' || title === 'Eventos';

    const gridClass = isArtists
        ? 'section-grid__grid section-grid__grid--artists'
        : isEvents
            ? 'section-grid__grid section-grid__grid--events'
            : 'section-grid__grid';

    return (
        <section className="section-grid">
            <div className="section-grid__header">
                <h3 className="section-grid__title">{title}</h3>
                {viewAllHref ? (
                    <Link className="section-grid__more" to={viewAllHref}>
                        Ver más
                    </Link>
                ) : null}
            </div>
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
