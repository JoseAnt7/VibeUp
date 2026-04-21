import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar_Home } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { SectionGrid } from "../components/SectionGrid";
import Logo from '../assets/img/logo.png';
import '../assets/css/Home.css';
import { Player } from "../components/Player";
import { AlbumModal } from "../components/AlbumModal";
import { EventPublicModal } from "../components/EventPublicModal";
import { API_BASE } from "../utils/apiBase";

export const Home = () => {
    const navigate = useNavigate();
        const [songs, setSongs] = useState([]);
    const [artist, setArtist] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [currentsong, setCurrentsong] = useState(null);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
    const [playerQueue, setPlayerQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(0);
    const [playbackContext, setPlaybackContext] = useState(null);


    useEffect(() => {
        fetch(`${API_BASE}/api/public/songs`).then(r => r.json()).then(data => {
            if (data.songs) setSongs(data.songs);
        }).catch(() => { });

        fetch(`${API_BASE}/api/public/albums-with-songs`).then(r => r.json()).then(data => {
            if (data.albums) {
                setAlbums(
                    data.albums.map(a => ({
                        ...a,
                        title: a.title,
                        subtitle: a.artist_name || 'Álbum',
                        img: a.img || Logo
                    }))
                );
            }
        }).catch(() => { });

        fetch(`${API_BASE}/api/public/artists-with-songs`).then(r => r.json()).then(data => {
            if (data.artists) setArtist(data.artists);
        }).catch(() => { });

        fetch(`${API_BASE}/api/public/events`).then(r => r.json()).then(data => {
            if (data.events) setEvents(data.events);
        }).catch(() => { });

    }, [API_BASE]);

    const playSingleSong = (song) => {
        setPlayerQueue([song]);
        setQueueIndex(0);
        setPlaybackContext(null);
        setCurrentsong(song);
    };

    const openAlbumModal = (album) => {
        setSelectedAlbum(album);
        setIsAlbumModalOpen(true);
    };

    const openArtistProfile = (artistItem) => {
        const artistName = artistItem?.name;
        if (!artistName) return;
        navigate(`/artist/${encodeURIComponent(artistName)}`);
    };

    const closeAlbumModal = () => {
        setIsAlbumModalOpen(false);
        setSelectedAlbum(null);
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
        setCurrentsong(queue[startIndex]);
    };

    const handleSongEnded = () => {
        const nextIndex = queueIndex + 1;
        if (nextIndex >= playerQueue.length) return;
        setQueueIndex(nextIndex);
        setCurrentsong(playerQueue[nextIndex]);
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

    const handleLikeSong = async (song) => {
        try {
            const token = localStorage.getItem("access_token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`${API_BASE}/api/public/songs/${song.id}/like`, { method: "POST", headers });
            const data = await res.json();
            if (data.liked) {
                setSongs((prev) => prev.map((s) => s.id === song.id ? { ...s, likes: data.likes } : s));
            }
        } catch {
            // noop
        }
    };

    return(
        <div className="home home--with-player">
            <Navbar_Home />
            <main className="home__main">
                <Hero />

                <div className="home__sections">
                    <SectionGrid
                        title="Canciones en tendencia"
                        items={songs}
                        onPlay={playSingleSong}
                        onLike={handleLikeSong}
                        showLikeButton
                    />
                    <SectionGrid title="Artistas" items={artist} onItemClick={openArtistProfile} />
                    <SectionGrid title="Albumes" items={albums} onItemClick={openAlbumModal} />
                    <SectionGrid
                        type="events"
                        title="Eventos"
                        items={events}
                        onItemClick={openEventModal}
                    />
                </div>
            </main>
            <Footer />
            <AlbumModal
                album={selectedAlbum}
                isOpen={isAlbumModalOpen}
                onClose={closeAlbumModal}
                onPlaySong={(song, album) => startAlbumQueue(album, song.id)}
                onPlayAll={(album) => startAlbumQueue(album)}
            />
            <Player
                song={currentsong}
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
            <p>Prueba</p>
        </div>
    )
}
