import React, { useCallback, useEffect, useRef, useState } from "react";
import '../assets/css/Player.css';
import Logo from '../assets/img/logo.png';
import { safeMediaUrl } from '../utils/safeMediaUrl';
import { API_BASE } from "../utils/apiBase";

export const Player = ({ song, playbackContext, queueIndex, onSongEnd }) => {
        const audioRef = useRef(null);
    const currentSongIdRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationFrameRef = useRef(null);
    const freqBufferRef = useRef(null);
    const visualizerActiveRef = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [volume, setVolume] = useState(0.85);
    const [visualizerBars, setVisualizerBars] = useState(() => Array(30).fill(12));
    const visualPhaseRef = useRef(0);

    const formatTime = (seconds) => {
        const s = Math.max(0, Math.floor(Number(seconds || 0)));
        const minutes = Math.floor(s / 60);
        const secs = s % 60;
        return `${minutes}:${String(secs).padStart(2, "0")}`;
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const update = () => {
            if (!audio.duration) return;
            setProgress((audio.currentTime / audio.duration) * 100);
            setCurrentTime(audio.currentTime || 0);
            setDuration(audio.duration || 0);
        };

        const loadedMetadata = () => {
            setDuration(audio.duration || 0);
        };

        audio.addEventListener("timeupdate", update);
        audio.addEventListener("loadedmetadata", loadedMetadata);

        return () => {
            audio.removeEventListener("timeupdate", update);
            audio.removeEventListener("loadedmetadata", loadedMetadata);
        };
    }, [song]); //  importante

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = volume;
    }, [volume]);

    const ensureVisualizerGraph = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio) return false;

        if (!audioContextRef.current) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return false;
            audioContextRef.current = new Ctx();
        }

        const ctx = audioContextRef.current;
        if (ctx.state === "suspended") {
            try {
                await ctx.resume();
            } catch {
                return false;
            }
        }

        if (!analyserRef.current) {
            analyserRef.current = ctx.createAnalyser();
            analyserRef.current.fftSize = 256;
            analyserRef.current.smoothingTimeConstant = 0.84;
        }

        // Crear una única vez. Si falla (restricción navegador), no rompemos el audio.
        // Usamos captureStream para NO tocar la ruta de salida de audio del elemento.
        // Así evitamos el bug donde al expandir se silencia pero el tiempo sigue corriendo.
        if (!sourceRef.current) {
            try {
                const stream =
                    typeof audio.captureStream === "function"
                        ? audio.captureStream()
                        : (typeof audio.mozCaptureStream === "function" ? audio.mozCaptureStream() : null);
                if (!stream) return false;
                sourceRef.current = ctx.createMediaStreamSource(stream);
                sourceRef.current.connect(analyserRef.current);
            } catch {
                return false;
            }
        }

        return true;
    }, []);

    useEffect(() => {
        const reportListenTime = async () => {
            const audio = audioRef.current;
            const songId = currentSongIdRef.current;
            if (!audio || !songId || !audio.currentTime) return;
            const token = localStorage.getItem("access_token");
            try {
                await fetch(`${API_BASE}/api/public/songs/${songId}/listen`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ listened_seconds: audio.currentTime })
                });
            } catch {
                // noop
            }
        };

        reportListenTime();
        if (song && audioRef.current) {
            const u = safeMediaUrl(song.url, '');
            if (!u) {
                currentSongIdRef.current = null;
                return;
            }
            currentSongIdRef.current = song.id;
            if (sourceRef.current) {
                try {
                    sourceRef.current.disconnect();
                } catch {
                    // noop
                }
                sourceRef.current = null;
            }
            freqBufferRef.current = null;
            audioRef.current.src = u;
            audioRef.current.play();
            setIsPlaying(true);
            setProgress(0);
            setCurrentTime(0);
            setDuration(0);
            const token = localStorage.getItem("access_token");
            fetch(`${API_BASE}/api/public/songs/${song.id}/play`, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            }).catch(() => { });
        }
    }, [song, API_BASE]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            const songId = currentSongIdRef.current;
            if (songId) {
                const token = localStorage.getItem("access_token");
                fetch(`${API_BASE}/api/public/songs/${songId}/listen`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ listened_seconds: audio.currentTime || 0 })
                }).catch(() => { });
            }
            if (onSongEnd) onSongEnd();
        };

        audio.addEventListener("ended", handleEnded);
        return () => {
            audio.removeEventListener("ended", handleEnded);
        };
    }, [onSongEnd, API_BASE]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const syncPlayingFromElement = () => {
            setIsPlaying(!audio.paused);
        };

        audio.addEventListener("play", syncPlayingFromElement);
        audio.addEventListener("playing", syncPlayingFromElement);
        audio.addEventListener("pause", syncPlayingFromElement);
        syncPlayingFromElement();

        return () => {
            audio.removeEventListener("play", syncPlayingFromElement);
            audio.removeEventListener("playing", syncPlayingFromElement);
            audio.removeEventListener("pause", syncPlayingFromElement);
        };
    }, [song]);

    useEffect(() => {
        const resumeAudioGraph = () => {
            if (document.visibilityState !== "visible") return;
            audioContextRef.current?.resume?.().catch(() => { });
            ensureVisualizerGraph();
        };

        window.addEventListener("visibilitychange", resumeAudioGraph);
        window.addEventListener("resize", resumeAudioGraph);

        return () => {
            window.removeEventListener("visibilitychange", resumeAudioGraph);
            window.removeEventListener("resize", resumeAudioGraph);
        };
    }, [ensureVisualizerGraph]);

    useEffect(() => {
        const stopLoop = () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };

        if (!expanded) {
            visualizerActiveRef.current = false;
            stopLoop();
            setVisualizerBars((prev) => prev.map((v) => Math.max(8, v * 0.92)));
            return undefined;
        }

        visualizerActiveRef.current = true;
        const barsCount = 30;

        const tick = () => {
            if (!visualizerActiveRef.current) return;

            try {
                const audio = audioRef.current;
                const actuallyPlaying = Boolean(audio && !audio.paused);

                const analyser = analyserRef.current;
                let freqData = null;
                if (analyser) {
                    if (!freqBufferRef.current || freqBufferRef.current.length !== analyser.frequencyBinCount) {
                        freqBufferRef.current = new Uint8Array(analyser.frequencyBinCount);
                    }
                    freqData = freqBufferRef.current;
                    analyser.getByteFrequencyData(freqData);
                }

                const hasAnalyzer = Boolean(analyser && freqData);
                let bucketSize = 1;
                if (hasAnalyzer) {
                    bucketSize = Math.max(1, Math.floor(freqData.length / barsCount));
                }

                if (!actuallyPlaying) {
                    setVisualizerBars((prev) => prev.map((v) => Math.max(8, v * 0.92)));
                } else {
                    setVisualizerBars((prev) => {
                        let energy = 0;
                        const next = new Array(barsCount).fill(12).map((_, i) => {
                            if (hasAnalyzer) {
                                const start = i * bucketSize;
                                const end = Math.min(freqData.length, start + bucketSize);
                                let sum = 0;
                                let count = 0;
                                for (let j = start; j < end; j += 1) {
                                    sum += freqData[j];
                                    count += 1;
                                }
                                const avg = count ? sum / count : 0;
                                energy += avg;
                                const normalized = (avg / 255) * 100;
                                const target = Math.max(8, normalized);
                                const previous = prev[i] ?? 12;
                                return previous + (target - previous) * 0.35;
                            }
                            const phase = visualPhaseRef.current * 0.09 + i * 0.6;
                            const target = 18 + (Math.sin(phase) + 1) * 24 + ((i % 3) * 3);
                            const previous = prev[i] ?? 12;
                            return previous + (target - previous) * 0.2;
                        });

                        if (hasAnalyzer) {
                            const avgEnergy = energy / barsCount;
                            if (avgEnergy < 3) {
                                return next.map((val, i) => {
                                    const phase = visualPhaseRef.current * 0.1 + i * 0.55;
                                    const target = 14 + (Math.sin(phase) + 1) * 22;
                                    return val + (target - val) * 0.18;
                                });
                            }
                        }

                        return next;
                    });
                }

                visualPhaseRef.current += 1;
            } catch {
                // Si falla un frame (p. ej. AudioContext), seguimos el bucle en finally.
            } finally {
                if (visualizerActiveRef.current) {
                    animationFrameRef.current = requestAnimationFrame(tick);
                }
            }
        };

        animationFrameRef.current = requestAnimationFrame(tick);

        return () => {
            visualizerActiveRef.current = false;
            stopLoop();
        };
    }, [expanded, song?.id]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            ensureVisualizerGraph();
            audioRef.current.play();
        }

        setIsPlaying(!isPlaying);
    };

    const seekTo = (nextProgress) => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;
        audio.currentTime = (nextProgress / 100) * audio.duration;
        setProgress(nextProgress);
    };

    if (!song) return null;

    const subtitle = playbackContext?.albumTitle
        ? `${playbackContext.albumTitle} - ${(queueIndex || 0) + 1} de ${playbackContext.totalSongs}`
        : "Reproduciendo ahora";

    return (
        <>
            <div className="player">
                {/* LEFT */}
                <div className="player__left">
                    <button
                        type="button"
                        className="player__expand-btn"
                        aria-label="Expandir reproductor"
                        onClick={() => {
                            ensureVisualizerGraph();
                            setExpanded(true);
                        }}
                    >
                        ^
                    </button>
                    <img src={safeMediaUrl(song.img, Logo)} alt={song.title} />
                    <div className="player__info">
                        <div className="player__title">{song.title}</div>
                        <div className="player__subtitle">{subtitle}</div>
                    </div>
                </div>

                {/* CENTER */}
                <div className="player__center">
                    <div className="player__controls">
                        <button type="button" onClick={togglePlay}>
                            {isPlaying ? "⏸" : "▶"}
                        </button>
                    </div>

                    <input
                        className="player__progress"
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => seekTo(Number(e.target.value))}
                    />
                </div>

                {/* RIGHT */}
                <div className="player__right">
                    <span className="player__time">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    <input
                        className="player__volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className={`player-expanded ${expanded ? "player-expanded--open" : ""}`} aria-hidden={!expanded}>
                <div className="player-expanded__backdrop" onClick={() => setExpanded(false)} />
                <section className="player-expanded__panel" role="dialog" aria-label="Reproductor ampliado">
                    <div className="player-expanded__visualizer" aria-hidden>
                        {visualizerBars.map((h, idx) => (
                            <span key={idx} className="player-expanded__bar" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                    <button
                        type="button"
                        className="player-expanded__collapse-btn"
                        aria-label="Contraer reproductor"
                        onClick={() => setExpanded(false)}
                    >
                        v
                    </button>

                    <p className="player-expanded__context">{subtitle}</p>
                    <img className="player-expanded__cover" src={safeMediaUrl(song.img, Logo)} alt={song.title} />
                    <h3 className="player-expanded__title">{song.title}</h3>
                    <p className="player-expanded__subtitle">
                        {song.artist_name || playbackContext?.albumTitle || "VibeUp"}
                    </p>

                    <div className="player-expanded__progress-wrap">
                        <input
                            className="player-expanded__progress"
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={(e) => seekTo(Number(e.target.value))}
                        />
                        <div className="player-expanded__times">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="player-expanded__controls">
                        <button type="button" className="player-expanded__play-btn" onClick={togglePlay}>
                            {isPlaying ? "⏸" : "▶"}
                        </button>
                    </div>

                    <div className="player-expanded__volume-wrap">
                        <span>Volumen</span>
                        <input
                            className="player-expanded__volume"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                        />
                    </div>
                </section>
            </div>

            <audio ref={audioRef} />
        </>
    );
};
