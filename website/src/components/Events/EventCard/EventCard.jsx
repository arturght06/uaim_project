import React, { useContext } from "react";
import { Link } from "react-router-dom";
import styles from "./EventCard.module.css";
import {
  formatDate,
  formatLocation,
  formatUser,
} from "../../../services/format";
import { AuthContext } from "../../../contexts/AuthContext";

const EventCard = ({ event, disableLink }) => {
  const auth = useContext(AuthContext);
  const {
    id,
    title,
    description,
    event_date,
    organizer_id,
    created_at,
    location_data,
    organizer_data,
    reservation,
    reservation_count,
  } = event || {};

  const isOrganizer =
    auth.isAuthenticated && auth.currentUser.id === organizer_id;

  const date = formatDate(event_date);

  const children = (
    <div
      className={`${styles.eventCard} ${isOrganizer && styles.eventCardOwner}`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.metaInfo}>
          <strong>{formatUser(organizer_data)}</strong>
          <div className={styles.eventDate}>{formatDate(created_at)}</div>
        </div>
        {Date.now() > new Date(event_date) && (
          <strong className={styles.expired}>Minęło</strong>
        )}
      </div>

      <div className={styles.cardBody}>
        <h2 className={styles.activityTitle}>{title}</h2>
        <div className={styles.eventDetails}>
          <div className={styles.eventItem}>
            <span class="material-symbols-outlined">pin_drop</span>{" "}
            <span>{formatLocation(location_data)}</span>
          </div>
          <div className={styles.eventItem}>
            <span class="material-symbols-outlined">calendar_month</span>{" "}
            <span>{date}</span>
          </div>
          <div className={styles.eventItem}>
            <p className={styles.descriptionText}>{description}</p>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.actions}>
          <div className={styles.action}>
            <span class="material-symbols-outlined">groups</span>
            {reservation_count}
          </div>
          {/*<div className={styles.action}>
            <span class="material-symbols-outlined">thumb_up</span>
            50
          </div>
          <div className={styles.action}>
            <span class="material-symbols-outlined">comment</span>
            10
          </div>
          */}
        </div>
        {isOrganizer && (
          <div className={styles.footerOwner}>Twoje wydarzenie</div>
        )}
        {reservation && (
          <div className={styles.footerAttend}>Weźmiesz udział</div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {!disableLink ? (
        <Link
          to={`/events/${id}`}
          className={`${styles.cardLink} ${isOrganizer && styles.owner} ${
            reservation && styles.attend
          }`}
        >
          {children}
        </Link>
      ) : (
        <span className={`${styles.cardLink} ${isOrganizer && styles.owner}`}>
          {children}
        </span>
      )}
    </>
  );
};

export default EventCard;
