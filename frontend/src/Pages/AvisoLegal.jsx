import React from "react";
import { Link } from "react-router-dom";
import { Navbar_Home } from "../components/Navbar";
import { Footer } from "../components/Footer";
import "../assets/css/LegalPage.css";

export const AvisoLegal = () => (
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
                    <span className="legal-page__breadcrumb-current">Aviso Legal</span>
                </nav>

                <article className="legal-page__article">
                    <header className="legal-page__header">
                        <h1 className="legal-page__title">Aviso Legal</h1>
                        <p className="legal-page__lead">
                            Este documento identifica quién está detrás de la pantalla y establece las
                            reglas de convivencia.
                        </p>
                    </header>

                    <h2 className="legal-page__h2">Aviso legal</h2>

                    <section className="legal-page__section" aria-labelledby="legal-section-1">
                        <h3 className="legal-page__h3" id="legal-section-1">
                            1. Información identificativa
                        </h3>
                        <p className="legal-page__p">
                            En cumplimiento con el deber de información recogido en el artículo 10 de la Ley
                            34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del
                            Comercio Electrónico, a continuación se reflejan los siguientes datos:
                        </p>
                        <dl className="legal-page__dl">
                            <div className="legal-page__dl-row">
                                <dt className="legal-page__dt">Titular</dt>
                                <dd className="legal-page__dd">José Antonio Llorens Padilla</dd>
                            </div>
                            <div className="legal-page__dl-row">
                                <dt className="legal-page__dt">NIF/CIF</dt>
                                <dd className="legal-page__dd">74013038G</dd>
                            </div>
                            <div className="legal-page__dl-row">
                                <dt className="legal-page__dt">Domicilio</dt>
                                <dd className="legal-page__dd">Calle Sentenero, 23, Novelda, Alicante</dd>
                            </div>
                            <div className="legal-page__dl-row">
                                <dt className="legal-page__dt">Correo electrónico de contacto</dt>
                                <dd className="legal-page__dd">
                                    <a
                                        className="legal-page__a"
                                        href="mailto:jllorenspadilla@gmail.com"
                                    >
                                        jllorenspadilla@gmail.com
                                    </a>
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="legal-page__section" aria-labelledby="legal-section-2">
                        <h3 className="legal-page__h3" id="legal-section-2">
                            2. Usuarios
                        </h3>
                        <p className="legal-page__p">
                            El acceso y/o uso de este portal le atribuye la condición de{" "}
                            <strong className="legal-page__strong">USUARIO</strong>, que acepta, desde dicho
                            acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas.
                        </p>
                    </section>

                    <section className="legal-page__section" aria-labelledby="legal-section-3">
                        <h3 className="legal-page__h3" id="legal-section-3">
                            3. Uso del portal
                        </h3>
                        <p className="legal-page__p">
                            VibeUp proporciona el acceso a multitud de informaciones, servicios, programas o
                            datos (en adelante, &quot;los contenidos&quot;) en Internet pertenecientes a
                            José Antonio o a sus licenciantes a los que el{" "}
                            <strong className="legal-page__strong">USUARIO</strong> pueda tener acceso. El{" "}
                            <strong className="legal-page__strong">USUARIO</strong> asume la responsabilidad
                            del uso del portal.
                        </p>
                    </section>

                    <section className="legal-page__section" aria-labelledby="legal-section-4">
                        <h3 className="legal-page__h3" id="legal-section-4">
                            4. Propiedad intelectual e industrial
                        </h3>
                        <h4 className="legal-page__h4">Plataforma</h4>
                        <p className="legal-page__p">
                            José Antonio Llorens Padilla es titular de todos los derechos de propiedad
                            intelectual e industrial de su página web, así como de los elementos contenidos
                            en la misma (software, marcas, logotipos, combinaciones de colores, estructura y
                            diseño).
                        </p>
                        <h4 className="legal-page__h4">Contenido de usuarios</h4>
                        <p className="legal-page__p">
                            Los artistas que suben música conservan la titularidad de sus obras, otorgando a
                            la plataforma una licencia de comunicación pública necesaria para la prestación
                            del servicio de streaming. Queda expresamente prohibida la reproducción,
                            distribución y comunicación pública con fines comerciales del contenido de
                            terceros sin autorización.
                        </p>
                    </section>

                    <section className="legal-page__section" aria-labelledby="legal-section-5">
                        <h3 className="legal-page__h3" id="legal-section-5">
                            5. Exclusión de garantías y responsabilidad
                        </h3>
                        <p className="legal-page__p">
                            VibeUp no se hace responsable, en ningún caso, de los daños y perjuicios de
                            cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u
                            omisiones en los contenidos, falta de disponibilidad del portal o la transmisión
                            de virus o programas maliciosos, a pesar de haber adoptado todas las medidas
                            tecnológicas necesarias para evitarlo.
                        </p>
                    </section>
                </article>
            </div>
        </main>
        <Footer />
    </div>
);
