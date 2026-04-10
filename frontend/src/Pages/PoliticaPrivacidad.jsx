import React from "react";
import { Link } from "react-router-dom";
import { Navbar_Home } from "../components/Navbar";
import { Footer } from "../components/Footer";
import "../assets/css/LegalPage.css";

export const PoliticaPrivacidad = () => (
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
                    <span className="legal-page__breadcrumb-current">Política de Privacidad</span>
                </nav>

                <article className="legal-page__article">
                    <header className="legal-page__header">
                        <h1 className="legal-page__title">Política de Privacidad</h1>
                        <p className="legal-page__lead">
                            Información sobre el tratamiento de sus datos personales en VibeUp de acuerdo con la
                            normativa aplicable en materia de protección de datos.
                        </p>
                    </header>

                    <h2 className="legal-page__h2">Protección de datos</h2>

                    <section className="legal-page__section" aria-labelledby="privacy-section-1">
                        <h3 className="legal-page__h3" id="privacy-section-1">
                            1. ¿Quién es el responsable del tratamiento de sus datos?
                        </h3>
                        <dl className="legal-page__dl">
                            <div className="legal-page__dl-row">
                                <dt className="legal-page__dt">Identidad</dt>
                                <dd className="legal-page__dd">José Antonio Llorens Padilla</dd>
                            </div>
                            <div className="legal-page__dl-row">
                                <dt className="legal-page__dt">NIF</dt>
                                <dd className="legal-page__dd">74013038G</dd>
                            </div>
                            <div className="legal-page__dl-row">
                                <dt className="legal-page__dt">Dirección</dt>
                                <dd className="legal-page__dd">Calle Sentenero, 23, Novelda, Alicante</dd>
                            </div>
                            <div className="legal-page__dl-row">
                                <dt className="legal-page__dt">Email</dt>
                                <dd className="legal-page__dd">
                                    <a className="legal-page__a" href="mailto:jllorenspadilla@gmail.com">
                                        jllorenspadilla@gmail.com
                                    </a>
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="legal-page__section" aria-labelledby="privacy-section-2">
                        <h3 className="legal-page__h3" id="privacy-section-2">
                            2. ¿Con qué finalidad tratamos sus datos personales?
                        </h3>
                        <p className="legal-page__p">
                            En VibeUp tratamos la información que nos facilitan los usuarios con el fin de:
                        </p>
                        <ul className="legal-page__list">
                            <li>
                                <strong className="legal-page__strong">Gestión de cuentas:</strong> crear y
                                gestionar su perfil de usuario o artista.
                            </li>
                            <li>
                                <strong className="legal-page__strong">Prestación del servicio:</strong>{" "}
                                permitir la subida de música, reproducción vía streaming y el uso de funciones
                                sociales (likes, suscripciones a perfiles).
                            </li>
                            <li>
                                <strong className="legal-page__strong">Servicio premium:</strong> gestionar el
                                cobro de la suscripción de 0,99€ y la eliminación de publicidad.
                            </li>
                            <li>
                                <strong className="legal-page__strong">Estadísticas y mejora:</strong> analizar
                                métricas de reproducción y visualizaciones para informar a los artistas sobre el
                                rendimiento de sus obras y mejorar nuestros algoritmos de recomendación.
                            </li>
                            <li>
                                <strong className="legal-page__strong">Publicidad:</strong> mostrar anuncios en la
                                versión gratuita (pueden ser personalizados si el usuario da su consentimiento).
                            </li>
                        </ul>
                    </section>

                    <section className="legal-page__section" aria-labelledby="privacy-section-3">
                        <h3 className="legal-page__h3" id="privacy-section-3">
                            3. ¿Cuál es la legitimación para el tratamiento de sus datos?
                        </h3>
                        <ul className="legal-page__list">
                            <li>
                                <strong className="legal-page__strong">Ejecución de un contrato:</strong> es la
                                base para gestionar su registro y la suscripción de pago.
                            </li>
                            <li>
                                <strong className="legal-page__strong">Consentimiento del interesado:</strong>{" "}
                                para el uso de cookies publicitarias y la creación del perfil de artista.
                            </li>
                            <li>
                                <strong className="legal-page__strong">Interés legítimo:</strong> para realizar
                                analíticas agregadas y garantizar la seguridad de la plataforma.
                            </li>
                        </ul>
                    </section>

                    <section className="legal-page__section" aria-labelledby="privacy-section-4">
                        <h3 className="legal-page__h3" id="privacy-section-4">
                            4. ¿A qué destinatarios se comunicarán sus datos?
                        </h3>
                        <p className="legal-page__p">
                            Sus datos no se cederán a terceros, salvo obligación legal o necesidad técnica para el
                            servicio:
                        </p>
                        <ul className="legal-page__list">
                            <li>
                                <strong className="legal-page__strong">Pasarelas de pago</strong> (p. ej. Stripe
                                / PayPal) para procesar los 0,99€. Nosotros no almacenamos los datos de su
                                tarjeta.
                            </li>
                            <li>
                                <strong className="legal-page__strong">Proveedores de cloud</strong> (p. ej. AWS
                                / Google Cloud) donde se aloja la infraestructura de la app.
                            </li>
                            <li>
                                <strong className="legal-page__strong">Redes de publicidad</strong> en la versión
                                gratuita, para la gestión de banners y anuncios de audio.
                            </li>
                        </ul>
                    </section>

                    <section className="legal-page__section" aria-labelledby="privacy-section-5">
                        <h3 className="legal-page__h3" id="privacy-section-5">
                            5. ¿Por cuánto tiempo conservaremos sus datos?
                        </h3>
                        <p className="legal-page__p">
                            Los datos se conservarán mientras se mantenga la relación contractual o el usuario no
                            solicite su supresión, y durante los plazos legales para atender posibles
                            responsabilidades (6 años para datos contables y facturación en España).
                        </p>
                    </section>

                    <section className="legal-page__section" aria-labelledby="privacy-section-6">
                        <h3 className="legal-page__h3" id="privacy-section-6">
                            6. ¿Cuáles son sus derechos?
                        </h3>
                        <p className="legal-page__p">
                            Cualquier persona tiene derecho a obtener confirmación sobre si estamos tratando sus
                            datos. Usted tiene derecho a:
                        </p>
                        <ul className="legal-page__list">
                            <li>Acceder a sus datos personales.</li>
                            <li>Solicitar la rectificación de datos inexactos.</li>
                            <li>
                                Solicitar su supresión (derecho al olvido) cuando los datos ya no sean
                                necesarios.
                            </li>
                            <li>Solicitar la limitación u oposición de su tratamiento.</li>
                            <li>Portabilidad de los datos a otra plataforma.</li>
                        </ul>
                        <p className="legal-page__p">
                            Para ejercer estos derechos, puede enviar un email a{" "}
                            <a className="legal-page__a" href="mailto:jllorenspadilla@gmail.com">
                                jllorenspadilla@gmail.com
                            </a>{" "}
                            adjuntando copia de su DNI o documento identificativo.
                        </p>
                    </section>
                </article>
            </div>
        </main>
        <Footer />
    </div>
);
