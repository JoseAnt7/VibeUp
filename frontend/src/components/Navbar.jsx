import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/css/Navbar.css';
import Logo from '../assets/img/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faSun } from '@fortawesome/free-solid-svg-icons';
import { faMoon } from '@fortawesome/free-solid-svg-icons';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { UploadMusicModal } from "./studio/UploadMusicModal";
import { CreateAlbumModal } from "./studio/CreateAlbumModal";
import { EventFormModal } from "./studio/EventFormModal";
import {
    AUTH_SESSION_CLEARED,
    clearAuthSession,
    isAccessTokenExpired,
} from "../utils/authSession";
import { safeMediaUrl } from "../utils/safeMediaUrl";
import { API_BASE } from "../utils/apiBase";

export const Navbar_Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
        const [template, setTemplate] = useState('light');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [searchSource, setSearchSource] = useState({
        songs: [],
        artists: [],
        albums: [],
        events: []
    });
    const isSearchPage = location.pathname === "/search";
    
    const handleTemplateClick = () => {
        const newTheme = template === 'light' ? 'dark' : 'light';
        setTemplate(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    }
    
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    });

    const handleLogout = () => {
        clearAuthSession();
        setUser(null);
        setDropdownOpen(false);
        navigate('/');
    };

    const syncUserFromStorage = () => {
        const token = localStorage.getItem("access_token");
        if (!token || isAccessTokenExpired(token)) {
            if (token) clearAuthSession();
            setUser(null);
            return;
        }
        const raw = localStorage.getItem("user");
        setUser(raw ? JSON.parse(raw) : null);
    };

    useEffect(() => {
        syncUserFromStorage();
        const onCleared = () => syncUserFromStorage();
        window.addEventListener(AUTH_SESSION_CLEARED, onCleared);
        return () => window.removeEventListener(AUTH_SESSION_CLEARED, onCleared);
    }, []);

    const handleStudioClick = () => {
        navigate('/studio');
        setDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    useEffect(() => {
        fetch(`${API_BASE}/api/public/songs`).then(r => r.json()).then(data => {
            if (data.songs) {
                setSearchSource(prev => ({ ...prev, songs: data.songs }));
            }
        }).catch(() => { });

        fetch(`${API_BASE}/api/public/artists-with-songs`).then(r => r.json()).then(data => {
            if (data.artists) {
                setSearchSource(prev => ({ ...prev, artists: data.artists }));
            }
        }).catch(() => { });

        fetch(`${API_BASE}/api/public/albums-with-songs`).then(r => r.json()).then(data => {
            if (data.albums) {
                setSearchSource(prev => ({ ...prev, albums: data.albums }));
            }
        }).catch(() => { });

        fetch(`${API_BASE}/api/public/events`).then(r => r.json()).then(data => {
            if (data.events) {
                setSearchSource(prev => ({ ...prev, events: data.events }));
            }
        }).catch(() => { });
    }, [API_BASE]);

    const searchResults = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
            return { visibleResults: [], total: 0 };
        }

        const songs = searchSource.songs
            .filter((song) => (song.title || "").toLowerCase().includes(normalized))
            .map((song) => ({
                id: `song-${song.id}`,
                type: "Cancion",
                title: song.title,
                subtitle: "Cancion",
                img: song.img
            }));

        const artists = searchSource.artists
            .filter((artist) => (artist.name || "").toLowerCase().includes(normalized))
            .map((artist) => ({
                id: `artist-${artist.id}`,
                type: "Artista",
                title: artist.name,
                subtitle: "Artista",
                img: artist.img
            }));

        const albums = searchSource.albums
            .filter((album) => (album.title || "").toLowerCase().includes(normalized))
            .map((album) => ({
                id: `album-${album.id}`,
                type: "Album",
                title: album.title,
                subtitle: album.artist_name || "Album",
                img: album.img
            }));

        const events = searchSource.events
            .filter((ev) => {
                const t = (ev.title || "").toLowerCase();
                const loc = (ev.location || "").toLowerCase();
                const art = (ev.artist_name || "").toLowerCase();
                const desc = (ev.description || "").toLowerCase();
                return t.includes(normalized) || loc.includes(normalized) || art.includes(normalized) || desc.includes(normalized);
            })
            .map((ev) => ({
                id: `event-${ev.id}`,
                type: "Evento",
                title: ev.title,
                subtitle: ev.artist_name || "Evento",
                img: ev.img
            }));

        const merged = [...songs, ...artists, ...albums, ...events];
        return {
            visibleResults: merged.slice(0, 6),
            total: merged.length
        };
    }, [query, searchSource]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlQuery = params.get("q") || "";
        if (isSearchPage) setQuery(urlQuery);
    }, [location.search, isSearchPage]);

    const goToSearchResults = () => {
        const normalized = query.trim();
        if (!normalized) return;
        navigate(`/search?q=${encodeURIComponent(normalized)}&filters=songs,artists,albums,events`);
    };

    return (
        <div className="Contendor_Principal_Navbar">
            <img src={Logo} alt="Logo" width="72px" />
            <div className="Navegacion">
                <FontAwesomeIcon icon={faHouse} onClick={() => navigate('/')} style={{ cursor: "pointer" }} />
                <div className="Navegacion__search">
                    <input
                        type="text"
                        aria-label="Buscar canciones, artistas, álbumes y eventos"
                        placeholder="¿Que quieres reproducir?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                goToSearchResults();
                            }
                        }}
                    />

                    {query.trim() && !isSearchPage ? (
                        <div className="Navegacion__results">
                            {searchResults.visibleResults.length ? (
                                <>
                                    {searchResults.visibleResults.map((result) => (
                                        <button
                                            key={result.id}
                                            className="Navegacion__result-item"
                                            type="button"
                                            onClick={goToSearchResults}
                                        >
                                            <img src={safeMediaUrl(result.img, Logo)} alt={result.title} className="Navegacion__result-image" />
                                            <div className="Navegacion__result-info">
                                                <span className="Navegacion__result-title">{result.title}</span>
                                                <span className="Navegacion__result-subtitle">
                                                    {result.type} - {result.subtitle}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        className="Navegacion__result-more"
                                        onClick={goToSearchResults}
                                    >
                                        Ver mas ({searchResults.total})
                                    </button>
                                </>
                            ) : (
                                <div className="Navegacion__result-empty">Sin resultados</div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
            <div className="Botones_Sesion">
                {template === 'light' ? (
                    <FontAwesomeIcon icon={faSun} onClick={handleTemplateClick} />
                ) : (
                    <FontAwesomeIcon icon={faMoon} onClick={handleTemplateClick} />
                )}
                {user ? (
                    <div className={`user-menu ${dropdownOpen ? 'user-menu--open' : ''}`}>
                        <button 
                            className="user-menu__trigger"
                            onClick={toggleDropdown}
                        >
                            <span className="user-menu__username">Bienvenido {user.username}</span>
                            <FontAwesomeIcon icon={faChevronDown} className="user-menu__icon" />
                        </button>
                        
                        {dropdownOpen && (
                            <div className="user-menu__dropdown">
                                <button 
                                    className="user-menu__item"
                                    onClick={handleStudioClick}
                                >
                                    Studio
                                </button>
                                <button 
                                    className="user-menu__item"
                                    onClick={() => {
                                        navigate('/account-settings');
                                        setDropdownOpen(false);
                                    }}
                                >
                                    Configuración de Cuenta
                                </button>
                                <button 
                                    className="user-menu__item user-menu__item--logout"
                                    onClick={handleLogout}
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>

                ) : (
                    <>
                        <button onClick={() => {
                            navigate('/session')
                        }}>Iniciar Sesión</button>
                    </>
                )}

            </div>
        </div>
    )
}

export const Navbar_Artist = () => {
    const navigate = useNavigate();

    const [openModal, setOpenModal] = useState(false);
    const [openAlbumModal, setOpenAlbumModal] = useState(false);
    const [openEventModal, setOpenEventModal] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleUploadSong = () => {
        setOpenModal(true);
        setDropdownOpen(false);
    };

    const handleCreateAlbum = () => {
        setOpenAlbumModal(true);
        setDropdownOpen(false);
    };

    const handleAddEvent = () => {
        setOpenEventModal(true);
        setDropdownOpen(false);
    };

    return (
        <div className="Contendor_Principal_Navbar">
            <img src={Logo} alt="Logo" width="72px" onClick={() => navigate('/')} style={{ cursor: "pointer" }}/>
            <div className="Navegacion">
                <FontAwesomeIcon icon={faHouse} onClick={() => navigate('/')} style={{ cursor: "pointer" }} />
                <input type="text" aria-label="Buscar contenido subido" placeholder="Busca tu contenido subido" />
            </div>
            <div className="Botones_Sesion">
                <div className={`user-menu ${dropdownOpen ? 'user-menu--open' : ''}`}>
                    <button 
                        className="user-menu__trigger"
                        onClick={toggleDropdown}
                    >
                        <span className="user-menu__username">+ Crear</span>
                        <FontAwesomeIcon icon={faChevronDown} className="user-menu__icon" />
                    </button>
                    
                    {dropdownOpen && (
                        <div className="user-menu__dropdown">
                            <button 
                                className="user-menu__item"
                                onClick={handleCreateAlbum}
                            >
                                Crear Album
                            </button>
                            <button 
                                className="user-menu__item"
                                onClick={handleUploadSong}
                            >
                                Subir Canción
                            </button>
                            <button 
                                className="user-menu__item"
                                onClick={handleAddEvent}
                            >
                                Añadir Evento
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <UploadMusicModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
            />
            <CreateAlbumModal
                isOpen={openAlbumModal}
                onClose={() => setOpenAlbumModal(false)}
            />
            <EventFormModal
                isOpen={openEventModal}
                onClose={() => setOpenEventModal(false)}
            />
        </div>
    )
}
