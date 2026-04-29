import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar_Home } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { SectionGrid } from "../components/SectionGrid";
import Logo from '../assets/img/logo.png';
import '../assets/css/Home.css';
import { Player } from "../components/Player";
import { API_BASE } from "../utils/apiBase";
import { toSlug } from "../utils/slug";

export const Home = () => {
    const navigate = useNavigate();
        const [songs, setSongs] = useState([]);
    const [artist, setArtist] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [events, setEvents] = useState([]);
    const [currentsong, setCurrentsong] = useState(null);
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

    const openAlbumPage = (album) => {
        const slug = toSlug(album?.title);
        if (!slug) return;
        navigate(`/album/${slug}`);
    };

    const openArtistProfile = (artistItem) => {
        const artistName = artistItem?.name;
        if (!artistName) return;
        navigate(`/artist/${encodeURIComponent(artistName)}`);
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

    const openEventPage = (ev) => {
        if (!ev?.id) return;
        navigate(`/event/${ev.id}`);
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
                        viewAllHref="/search?q=&filters=songs"
                    />
                    <SectionGrid
                        title="Artistas"
                        items={artist}
                        onItemClick={openArtistProfile}
                        viewAllHref="/search?q=&filters=artists"
                    />
                    <SectionGrid
                        title="Albumes"
                        items={albums}
                        onItemClick={openAlbumPage}
                        viewAllHref="/search?q=&filters=albums"
                    />
                    <SectionGrid
                        type="events"
                        title="Eventos"
                        items={events}
                        onItemClick={openEventPage}
                        viewAllHref="/search?q=&filters=events"
                    />
                </div>
            </main>
            <Footer />
            <Player
                song={currentsong}
                playbackContext={playbackContext}
                queueIndex={queueIndex}
                onSongEnd={handleSongEnded}
            />
        </div>
    )
}
