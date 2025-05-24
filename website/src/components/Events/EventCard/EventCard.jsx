import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./EventCard.module.css";
import { getLocationById } from "../../../services/location";
import { formatDate, formatLocation } from "../../../services/format";

const EventCard = ({ event }) => {
  const [locationName, setLocationName] = useState("Ładowanie lokalizacji...");
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const { id, title, description, event_date, location_id } = event;

  useEffect(() => {
    // Fetch location details if location_id is present
    if (location_id) {
      setIsLocationLoading(true);
      const fetchLocation = async () => {
        try {
          const locationData = await getLocationById(location_id);
          if (locationData) {
            setLocationName(formatLocation(locationData));
          } else {
            setLocationName("Lokalizacja nieznana");
          }
        } catch (error) {
          console.error(
            `Error fetching location ${location_id} for event ${id}:`,
            error
          );
          setLocationName("Błąd ładowania lokalizacji");
        } finally {
          setIsLocationLoading(false);
        }
      };
      fetchLocation();
    } else {
      setLocationName("Lokalizacja nieokreślona"); // No location_id provided
    }
  }, [location_id, id]); // Re-fetch if location_id or event id changes

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
        <p className={styles.info}>
          Lokalizacja: {isLocationLoading ? "Ładowanie..." : locationName}
        </p>
        <p className={styles.description}>
          {shortDescription || "Brak opisu."}
        </p>
        <div className={styles.detailsButton}>Zobacz szczegóły</div>
      </div>
    </Link>
  );
};

export default EventCard;
