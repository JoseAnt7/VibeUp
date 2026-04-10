import React from 'react';
import '../assets/css/Home.css';
import Logo from '../assets/img/logo.png';

export const Hero = () => {
    return (
        <section className="hero">
            <div className="hero__content">
                <h2 className="hero__title">Escucha lo que te mueve</h2>
                <p className="hero__desc">Playlists y recomendaciones creadas para ti.</p>
                <div className="hero__actions">
                    <button className="btn btn--primary">Reproducir</button>
                    <button className="btn btn--outline">Explorar</button>
                </div>
            </div>
            <img className="hero__img" src={Logo} alt="hero" />
        </section>
    )
}
