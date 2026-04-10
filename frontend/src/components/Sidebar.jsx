import React, { useEffect } from "react";
import '../assets/css/Studio.css';
import Photo from '../assets/img/9b14f22434de498b8f023bc40a747c2f.jpg';
import { safeMediaUrl } from '../utils/safeMediaUrl';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHouse,
    faVideo,
    faChartLine,
    faUsers,
    faCalendarDays,
    faDollarSign,
    faGear,
    faCommentDots
} from '@fortawesome/free-solid-svg-icons';

export const Sidebar = ({ user, active, onChangeView, img }) => {

    const menu = [
        { icon: faHouse, text: "Panel", key: "dashboard" },
        { icon: faVideo, text: "Contenido", key: "content" },
        { icon: faChartLine, text: "Estadísticas", key: "stats" },
        { icon: faCalendarDays, text: "Eventos", key: "events" },
    ];

    const footer = [
        { icon: faGear, text: "Configuración" },
        { icon: faCommentDots, text: "Enviar sugerencias" }
    ];

    return (
        <aside className="sidebar">

            {/* HEADER */}
            <div className="sidebar__header">
                <img className="sidebar__avatar" src={safeMediaUrl(img, Photo)} alt="avatar" />
                {user ? (
                    <p className="sidebar__title">{user}</p>
                ) : (
                    <p className="sidebar__title">Artista</p>
                )}

            </div>

            {/* MENU */}
            <nav className="sidebar__menu">
                <ul className="sidebar__list">
                    {menu.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => item.key && onChangeView(item.key)} // 🔥 CLICK
                            className={`sidebar__item ${active === item.key ? 'sidebar__item--active' : ''}`}
                        >
                            <FontAwesomeIcon icon={item.icon} className="sidebar__icon" />
                            <span className="sidebar__text">{item.text}</span>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* FOOTER */}
            <div className="sidebar__footer">
                {footer.map((item, index) => (
                    <div key={index} className="sidebar__item">
                        <FontAwesomeIcon icon={item.icon} className="sidebar__icon" />
                        <span className="sidebar__text">{item.text}</span>
                    </div>
                ))}
            </div>

        </aside>
    );
};