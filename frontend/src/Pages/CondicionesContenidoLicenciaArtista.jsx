import React from "react";
import { Link } from "react-router-dom";
import { Navbar_Home } from "../components/Navbar";
import { Footer } from "../components/Footer";
import "../assets/css/LegalPage.css";

export const CondicionesContenidoLicenciaArtista = () => (
    <div className="legal-page">
        <Navbar_Home />
        <main className="legal-page__main" id="main-content">
            <div className="legal-page__container">
                <nav className="legal-page__breadcrumb" aria-label="Migas de pan">
                    <Link className="legal-page__breadcrumb-link" to="/">
                        Inicio
                    </Link>
                    <span className="legal-page__breadcrumb-sep" aria-hidden>
                        /
                    </span>
                    <span className="legal-page__breadcrumb-current">
                        Condiciones de Contenido y Licencia de Artista
                    </span>
                </nav>

                <article className="legal-page__article">
                    <header className="legal-page__header">
                        <h1 className="legal-page__title">Condiciones de Contenido y Licencia de Artista</h1>
                        <p className="legal-page__lead">
                            Reglas que aplican al contenido que los artistas publican en VibeUp y la licencia que
                            otorgan a la plataforma para prestar el servicio de streaming y promoción.
                        </p>
                    </header>

                    <h2 className="legal-page__h2">Contenido y licencias</h2>

                    <section className="legal-page__section" aria-labelledby="artist-content-section-1">
                        <h3 className="legal-page__h3" id="artist-content-section-1">
                            1. Propiedad de la obra
                        </h3>
                        <p className="legal-page__p">
                            Usted (el &quot;Artista&quot;) conserva la plena propiedad y todos los derechos de
                            propiedad intelectual sobre la música, letras, carátulas y nombres que suba a VibeUp.
                            Nosotros no somos dueños de su arte.
                        </p>
                    </section>

                    <section className="legal-page__section" aria-labelledby="artist-content-section-2">
                        <h3 className="legal-page__h3" id="artist-content-section-2">
                            2. Licencia de uso (lo que nos permite hacer)
                        </h3>
                        <p className="legal-page__p">
                            Para que podamos prestar el servicio, al subir contenido usted otorga a VibeUp una
                            licencia:
                        </p>
                        <ul className="legal-page__list">
                            <li>
                                <strong className="legal-page__strong">Mundial, no exclusiva y gratuita:</strong>{" "}
                                para que la música pueda escucharse en cualquier lugar.
                            </li>
                            <li>
                                <strong className="legal-page__strong">
                                    De comunicación pública y reproducción técnica:
                                </strong>{" "}
                                para que podamos procesar el archivo en nuestros servidores y enviarlo (streaming)
                                a los dispositivos de los oyentes.
                            </li>
                            <li>
                                <strong className="legal-page__strong">Derechos de imagen:</strong> nos autoriza a
                                usar su nombre de artista y carátulas para promocionar su perfil dentro de la
                                aplicación o en nuestras redes sociales.
                            </li>
                        </ul>
                    </section>

                    <section className="legal-page__section" aria-labelledby="artist-content-section-3">
                        <h3 className="legal-page__h3" id="artist-content-section-3">
                            3. Garantías del Artista (tu seguridad legal)
                        </h3>
                        <p className="legal-page__p">Al pulsar &quot;Publicar&quot;, usted declara y garantiza que:</p>
                        <ul className="legal-page__list">
                            <li>
                                Es el autor original de la obra o posee todas las licencias necesarias (beats
                                comprados con licencia comercial, muestras autorizadas, etc.).
                            </li>
                            <li>
                                Su contenido no infringe derechos de terceros (copyright de discográficas,
                                editoriales o derechos de imagen).
                            </li>
                            <li>
                                El contenido no es ilegal, no promueve el odio ni infringe nuestras normas
                                comunitarias.
                            </li>
                        </ul>
                    </section>

                    <section className="legal-page__section" aria-labelledby="artist-content-section-4">
                        <h3 className="legal-page__h3" id="artist-content-section-4">
                            4. Monetización y publicidad
                        </h3>
                        <h4 className="legal-page__h4">Modelo gratuito</h4>
                        <p className="legal-page__p">
                            El Artista acepta que se inserten anuncios antes, durante o después de la reproducción
                            de su contenido.
                        </p>
                        <h4 className="legal-page__h4">Modelo premium</h4>
                        <p className="legal-page__p">
                            El Artista acepta que su música esté disponible para los usuarios de pago (0,99€) sin
                            anuncios.
                        </p>
                    </section>

                    <section className="legal-page__section" aria-labelledby="artist-content-section-5">
                        <h3 className="legal-page__h3" id="artist-content-section-5">
                            5. Sistema de aviso y retirada (copyright)
                        </h3>
                        <p className="legal-page__p">
                            Si recibimos una notificación válida de que su contenido infringe derechos de autor,
                            VibeUp se reserva el derecho de retirar el contenido de inmediato sin previo aviso. La
                            acumulación de tres (3) infracciones resultará en el cierre permanente de la cuenta de
                            Artista.
                        </p>
                    </section>
                </article>
            </div>
        </main>
        <Footer />
    </div>
);
