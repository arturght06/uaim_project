import React from "react";
import { Link } from "react-router-dom";
import styles from "./EventCard.module.css";

// Helper function to format date
const formatDate = (isoString) => {
  if (!isoString) return "Data nieznana";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", isoString, error);
    return "Niepoprawna data";
  }
};

const EventCard = ({ event }) => {
  if (!event) {
    return null;
  }

  const { id, title, description, event_date, location_id } = event;

  // Truncate description if it's too long for the card
  const shortDescription =
    description && description.length > 100
      ? `${description.substring(0, 100)}...`
      : description;

  return (
    <Link to={`/events/${id}`} className={styles.cardLink}>
      <div className={styles.eventCard}>
        <h3 className={styles.title}>{title || "Brak tytułu"}</h3>
        {event_date && (
          <p className={styles.date}>Data: {formatDate(event_date)}</p>
        )}
        {/* TODO: Display location name instead of ID.. */}
        {location_id && (
          <p className={styles.info}>Lokalizacja ID: {location_id}</p>
        )}
        <p className={styles.description}>
          {shortDescription || "Brak opisu."}
        </p>
        <div className={styles.detailsButton}>Zobacz szczegóły</div>
      </div>
    </Link>
  );
};

export default EventCard;
