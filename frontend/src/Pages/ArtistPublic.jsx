import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar_Home } from "../components/Navbar";
import { SectionGrid } from "../components/SectionGrid";
import { AlbumModal } from "../components/AlbumModal";
import { EventPublicModal } from "../components/EventPublicModal";
import { Player } from "../components/Player";
import "../assets/css/ArtistPublic.css";
import Logo from "../assets/img/logo.png";
import { safeMediaUrl } from "../utils/safeMediaUrl";
import { API_BASE } from "../utils/apiBase";

export const ArtistPublic = () => {
        const { artistName } = useParams();

    const [artist, setArtist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [subscribed, setSubscribed] = useState(false);
    const [subLoading, setSubLoading] = useState(false);

    const [currentSong, setCurrentSong] = useState(null);
    const [playerQueue, setPlayerQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(0);
    const [playbackContext, setPlaybackContext] = useState(null);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);

    const token = localStorage.getItem("access_token");
    const currentUser = (() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    useEffect(() => {
        if (!artistName) return;
        fetch(`${API_BASE}/api/public/artist/${encodeURIComponent(artistName)}`)
            .then(r => r.json())
            .then((data) => {
                if (data.artist) setArtist(data.artist);
                if (typeof data.subscriber_count === "number") {
                    setSubscriberCount(data.subscriber_count);
                }
                if (data.songs) setSongs(data.songs);
                if (data.albums) {
                    setAlbums(
                        data.albums.map((album) => ({
                            ...album,
                            subtitle: data.artist?.name || "Album",
                            img: album.img || Logo
                        }))
                    );
                }
                if (data.events) setEvents(data.events);
            })
            .catch(() => { });
    }, [API_BASE, artistName]);

    useEffect(() => {
        if (!artist?.id || !token) return;

        const isOwnChannel = currentUser && Number(currentUser.id) === Number(artist.user_id);
        if (isOwnChannel) return;

        fetch(`${API_BASE}/api/artists/${artist.id}/subscribe/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then((data) => {
                if (typeof data.subscribed === "boolean") setSubscribed(data.subscribed);
                if (typeof data.subscriber_count === "number") setSubscriberCount(data.subscriber_count);
            })
            .catch(() => { });
    }, [API_BASE, artist?.id, artist?.user_id, token, currentUser?.id]);

    const showSubscribeControl = Boolean(
        token && currentUser && artist && Number(currentUser.id) !== Number(artist.user_id)
    );

    const toggleSubscription = async () => {
        if (!artist?.id || !token || subLoading) return;

        setSubLoading(true);
        try {
            if (subscribed) {
                const res = await fetch(`${API_BASE}/api/artists/${artist.id}/subscribe`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    if (typeof data.subscribed === "boolean") setSubscribed(data.subscribed);
                    if (typeof data.subscriber_count === "number") setSubscriberCount(data.subscriber_count);
                }
            } else {
                const res = await fetch(`${API_BASE}/api/artists/${artist.id}/subscribe`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setSubscribed(!!data.subscribed);
                    if (typeof data.subscriber_count === "number") setSubscriberCount(data.subscriber_count);
                }
            }
        } catch {
            // noop
        } finally {
            setSubLoading(false);
        }
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

    const openEventModal = (ev) => {
        if (!ev?.id) return;
        setSelectedEventId(ev.id);
        setIsEventModalOpen(true);
    };

    const closeEventModal = () => {
        setIsEventModalOpen(false);
        setSelectedEventId(null);
    };

    const handleEventRsvp = (eventId, attendeeCount) => {
        setEvents((prev) =>
            prev.map((e) => (e.id === eventId ? { ...e, attendee_count: attendeeCount } : e))
        );
    };

    const handleSongEnded = () => {
        const nextIndex = queueIndex + 1;
        if (nextIndex >= playerQueue.length) return;
        setQueueIndex(nextIndex);
        setCurrentSong(playerQueue[nextIndex]);
    };

    return (
        <div className="artist-public">
            <Navbar_Home />

            <header className="artist-public__hero">
                <img
                    className="artist-public__avatar"
                    src={safeMediaUrl(artist?.img, Logo)}
                    alt={artist?.name || "Artista"}
                />
                <div className="artist-public__hero-content">
                    <p className="artist-public__label">Canal de artista</p>
                    <h1 className="artist-public__title">{artist?.name || "Artista"}</h1>
                    <p className="artist-public__meta">
                        {subscriberCount} {subscriberCount === 1 ? "suscriptor" : "suscriptores"} · {songs.length} canciones · {albums.length} albumes
                    </p>
                    {showSubscribeControl ? (
                        <div className="artist-public__actions">
                            <button
                                type="button"
                                className={`artist-public__subscribe ${subscribed ? "artist-public__subscribe--active" : ""}`}
                                onClick={toggleSubscription}
                                disabled={subLoading}
                            >
                                {subscribed ? "Anular suscripción" : "Suscribirse"}
                            </button>
                        </div>
                    ) : null}
                </div>
            </header>

            <main className="artist-public__main">
                <SectionGrid title="Canciones" items={songs} onPlay={playSingleSong} />
                <SectionGrid title="Albumes" items={albums} onItemClick={(album) => {
                        setSelectedAlbum(album);
                        setIsAlbumModalOpen(true);
                    }} />
                <SectionGrid
                    type="events"
                    title="Eventos"
                    items={events}
                    onItemClick={openEventModal}
                />
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

