import React from "react";
import "../assets/css/Events.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";
import Logo from "../assets/img/logo.png";
import { safeMediaUrl } from "../utils/safeMediaUrl";

function formatStartLabel(startsAt) {
    if (!startsAt) return "";
    const d = new Date(startsAt);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
}

/**
 * @param {{ event: Record<string, unknown>, onClick?: (e: Record<string, unknown>) => void }} props
 */
export const EventCard = ({ event, onClick }) => {
    const img = safeMediaUrl(event.img, Logo);
    const title = event.title || "";
    const location = event.location || "";
    const artistName = event.artist_name || "";
    const count = typeof event.attendee_count === "number" ? event.attendee_count : 0;

    return (
        <button
            type="button"
            className="event-card"
            onClick={() => onClick && onClick(event)}
        >
            <div className="event-card__image-wrap">
                <img className="event-card__image" src={img} alt="" />
            </div>
            <div className="event-card__body">
                <h4 className="event-card__title">{title}</h4>
                <p className="event-card__datetime">{formatStartLabel(event.starts_at)}</p>
                <p className="event-card__location">{location}</p>
                {artistName ? <p className="event-card__organizer">{artistName}</p> : null}
                <div className="event-card__footer">
                    <FontAwesomeIcon icon={faUserFriends} className="event-card__footer-icon" aria-hidden />
                    <span className="event-card__footer-text">
                        {count} {count === 1 ? "asistente" : "asistentes"}
                    </span>
                </div>
            </div>
        </button>
    );
};
