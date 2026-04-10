import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar_Home } from "../components/Navbar";
import { AlbumModal } from "../components/AlbumModal";
import { EventPublicModal } from "../components/EventPublicModal";
import { Player } from "../components/Player";
import "../assets/css/SearchResults.css";
import Logo from "../assets/img/logo.png";
import { safeMediaUrl } from "../utils/safeMediaUrl";

const FILTER_KEYS = ["songs", "artists", "albums", "events"];

function formatEventSearchDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
}
const STEP = 5;

const normalizeFilters = (rawFilters) => {
    const active = rawFilters
        .split(",")
        .map((f) => f.trim())
        .filter((f) => FILTER_KEYS.includes(f));
    return active.length ? active : FILTER_KEYS;
};

const getWrappedSlice = (arr, start, count) => {
    if (!arr.length) return [];
    if (arr.length <= count) return arr;
    const result = [];
    for (let i = 0; i < count; i += 1) {
        result.push(arr[(start + i) % arr.length]);
    }
    return result;
};

export const SearchResults = () => {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const queryFromUrl = searchParams.get("q") || "";
    const filtersFromUrl = searchParams.get("filters") || FILTER_KEYS.join(",");

    const [query, setQuery] = useState(queryFromUrl);
    const [activeFilters, setActiveFilters] = useState(() => new Set(normalizeFilters(filtersFromUrl)));
    const [sources, setSources] = useState({ songs: [], artists: [], albums: [], events: [] });
    const [offsetByType, setOffsetByType] = useState({ songs: 0, artists: 0, albums: 0, events: 0 });
    const [currentSong, setCurrentSong] = useState(null);
    const [playerQueue, setPlayerQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(0);
    const [playbackContext, setPlaybackContext] = useState(null);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    useEffect(() => {
        setQuery(queryFromUrl);
        setActiveFilters(new Set(normalizeFilters(filtersFromUrl)));
    }, [queryFromUrl, filtersFromUrl]);

    useEffect(() => {
        fetch(`${API_BASE}/api/public/songs`).then(r => r.json()).then(data => {
            if (data.songs) setSources((prev) => ({ ...prev, songs: data.songs }));
        }).catch(() => { });

        fetch(`${API_BASE}/api/public/artists-with-songs`).then(r => r.json()).then(data => {
            if (data.artists) setSources((prev) => ({ ...prev, artists: data.artists }));
        }).catch(() => { });

        fetch(`${API_BASE}/api/public/albums-with-songs`).then(r => r.json()).then(data => {
            if (data.albums) setSources((prev) => ({ ...prev, albums: data.albums }));
        }).catch(() => { });

        fetch(`${API_BASE}/api/public/events`).then(r => r.json()).then(data => {
            if (data.events) setSources((prev) => ({ ...prev, events: data.events }));
        }).catch(() => { });
    }, [API_BASE]);

    const updateUrl = (nextQuery, nextFiltersSet) => {
        const filters = Array.from(nextFiltersSet);
        const safeFilters = filters.length ? filters : FILTER_KEYS;
        navigate(`/search?q=${encodeURIComponent(nextQuery)}&filters=${safeFilters.join(",")}`);
    };

    const results = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
            return { songs: [], artists: [], albums: [], events: [] };
        }

        return {
            songs: sources.songs.filter((song) => (song.title || "").toLowerCase().includes(normalized)),
            artists: sources.artists.filter((artist) => (artist.name || "").toLowerCase().includes(normalized)),
            albums: sources.albums.filter((album) => (album.title || "").toLowerCase().includes(normalized)),
            events: sources.events.filter((ev) => {
                const t = (ev.title || "").toLowerCase();
                const loc = (ev.location || "").toLowerCase();
                const art = (ev.artist_name || "").toLowerCase();
                const desc = (ev.description || "").toLowerCase();
                return t.includes(normalized) || loc.includes(normalized) || art.includes(normalized) || desc.includes(normalized);
            })
        };
    }, [query, sources]);

    const totalFound =
        results.songs.length + results.artists.length + results.albums.length + results.events.length;

    const handleFilterToggle = (filterKey) => {
        const next = new Set(activeFilters);
        if (next.has(filterKey)) {
            next.delete(filterKey);
        } else {
            next.add(filterKey);
        }
        setActiveFilters(next);
        updateUrl(query.trim(), next);
    };

    const handleOffsetChange = (type, direction) => {
        const list = results[type];
        if (!list.length) return;
        const len = list.length;
        const current = offsetByType[type] || 0;
        const next = direction === "next"
            ? (current + STEP) % len
            : (current - STEP + len) % len;
        setOffsetByType((prev) => ({ ...prev, [type]: next }));
    };

    const playSingleSong = (song) => {
        if (!song?.url) return;
        setPlayerQueue([song]);
        setQueueIndex(0);
        setPlaybackContext(null);
        setCurrentSong(song);
    };

    const startAlbumQueue = (album, startSongId = null) => {
        const queue = (album.songs || []).filter((song) => song.url);
        if (!queue.length) return;

        const startIndex = startSongId
            ? Math.max(queue.findIndex((song) => song.id === startSongId), 0)
            : 0;

        setPlayerQueue(queue);
        setQueueIndex(startIndex);
        setPlaybackContext({
            albumTitle: album.title,
            totalSongs: queue.length
        });
        setCurrentSong(queue[startIndex]);
    };

    const handleSongEnded = () => {
        const nextIndex = queueIndex + 1;
        if (nextIndex >= playerQueue.length) return;
        setQueueIndex(nextIndex);
        setCurrentSong(playerQueue[nextIndex]);
    };

    const handleCardClick = (type, item) => {
        if (type === "songs") {
            playSingleSong(item);
            return;
        }
        if (type === "albums") {
            setSelectedAlbum(item);
            setIsAlbumModalOpen(true);
            return;
        }
        if (type === "artists") {
            navigate(`/artist/${encodeURIComponent(item.name || "")}`);
            return;
        }
        if (type === "events") {
            if (!item?.id) return;
            setSelectedEventId(item.id);
            setIsEventModalOpen(true);
        }
    };

    const closeEventModal = () => {
        setIsEventModalOpen(false);
        setSelectedEventId(null);
    };

    const handleEventRsvp = (eventId, attendeeCount) => {
        setSources((prev) => ({
            ...prev,
            events: prev.events.map((ev) =>
                ev.id === eventId ? { ...ev, attendee_count: attendeeCount } : ev
            )
        }));
    };

    const handleLikeSong = async (song) => {
        try {
            const res = await fetch(`${API_BASE}/api/public/songs/${song.id}/like`, { method: "POST" });
            const data = await res.json();
            if (!data.liked) return;
            setSources((prev) => ({
                ...prev,
                songs: prev.songs.map((s) => s.id === song.id ? { ...s, likes: data.likes } : s)
            }));
        } catch {
            // noop
        }
    };

    const renderSection = (type, title) => {
        if (!activeFilters.has(type)) return null;
        const list = results[type];
        if (!list.length) return null;
        const items = getWrappedSlice(list, offsetByType[type] || 0, STEP);

        return (
            <section className="search-results__section" key={type}>
                <div className="search-results__section-head">
                    <h3>{title} ({list.length})</h3>
                    <div className="search-results__nav">
                        <button type="button" onClick={() => handleOffsetChange(type, "prev")}>{"<"}</button>
                        <button type="button" onClick={() => handleOffsetChange(type, "next")}>{">"}</button>
                    </div>
                </div>

                <div className="search-results__row">
                    {items.map((item) => (
                        <article
                            key={`${type}-${item.id}`}
                            className={`search-results__card ${type === "events" ? "search-results__card--event" : ""}`}
                            onClick={() => handleCardClick(type, item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCardClick(type, item);
                            }}
                        >
                            <img
                                src={safeMediaUrl(item.img, Logo)}
                                alt={item.title || item.name}
                                className={`search-results__card-image ${type === "events" ? "search-results__card-image--event" : ""}`}
                            />
                            <div className="search-results__card-body">
                                <h4>{item.title || item.name}</h4>
                                {type === "events" ? (
                                    <>
                                        <p>Evento · {item.artist_name || "—"}</p>
                                        <p>{formatEventSearchDate(item.starts_at)}</p>
                                        <p className="search-results__card-place">{item.location || "—"}</p>
                                        <p>{item.attendee_count ?? 0} asistentes</p>
                                    </>
                                ) : (
                                    <p>
                                        {type === "songs" ? "Cancion" : ""}
                                        {type === "artists" ? "Artista" : ""}
                                        {type === "albums" ? `Album - ${item.artist_name || "Sin artista"}` : ""}
                                    </p>
                                )}
                                {type === "songs" ? (
                                    <>
                                        <p>{(item.category || "Sin categoría")} · ❤️ {item.likes || 0} · ▶ {item.plays || 0}</p>
                                        <button
                                            type="button"
                                            className="search-results__like-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLikeSong(item);
                                            }}
                                        >
                                            Me gusta
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        );
    };

    return (
        <div className="search-results-page">
            <Navbar_Home />
            <main className="search-results-page__main">
                <aside className="search-results__sidebar">
                    <h2>Resultados</h2>
                    <input
                        type="text"
                        value={query}
                        placeholder="Buscar canciones, artistas, albumes o eventos"
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") updateUrl(e.currentTarget.value.trim(), activeFilters);
                        }}
                    />

                    <div className="search-results__filters">
                        <button
                            type="button"
                            className={`search-results__filter ${activeFilters.has("artists") ? "search-results__filter--active" : ""}`}
                            onClick={() => handleFilterToggle("artists")}
                        >
                            Artista
                        </button>
                        <button
                            type="button"
                            className={`search-results__filter ${activeFilters.has("songs") ? "search-results__filter--active" : ""}`}
                            onClick={() => handleFilterToggle("songs")}
                        >
                            Cancion
                        </button>
                        <button
                            type="button"
                            className={`search-results__filter ${activeFilters.has("albums") ? "search-results__filter--active" : ""}`}
                            onClick={() => handleFilterToggle("albums")}
                        >
                            Album
                        </button>
                        <button
                            type="button"
                            className={`search-results__filter ${activeFilters.has("events") ? "search-results__filter--active" : ""}`}
                            onClick={() => handleFilterToggle("events")}
                        >
                            Evento
                        </button>
                    </div>
                </aside>

                <section className="search-results__content">
                    <header className="search-results__header">
                        <h1>Resultados para "{query}"</h1>
                        <p>{totalFound} elementos encontrados</p>
                    </header>

                    {renderSection("songs", "Canciones")}
                    {renderSection("artists", "Artistas")}
                    {renderSection("albums", "Albumes")}
                    {renderSection("events", "Eventos")}

                    {!totalFound ? (
                        <div className="search-results__empty">No hay resultados para esta busqueda.</div>
                    ) : null}
                </section>
            </main>
            <AlbumModal
                album={selectedAlbum}
                isOpen={isAlbumModalOpen}
                onClose={() => {
                    setIsAlbumModalOpen(false);
                    setSelectedAlbum(null);
                }}
                onPlaySong={(song, album) => startAlbumQueue(album, song.id)}
                onPlayAll={(album) => startAlbumQueue(album)}
            />
            <Player
                song={currentSong}
                playbackContext={playbackContext}
                queueIndex={queueIndex}
                onSongEnd={handleSongEnded}
            />
            <EventPublicModal
                eventId={selectedEventId}
                isOpen={isEventModalOpen}
                onClose={closeEventModal}
                onRsvpChange={(id, count) => handleEventRsvp(id, count)}
            />
        </div>
    );
};
