import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./EventCard.module.css";
import {
  formatDate,
  formatLocation,
  formatUser,
} from "../../../services/format";
import { getLocationById } from "../../../services/location";
import { AuthContext } from "../../../contexts/AuthContext";
import { getUserName } from "../../../services/user";

const EventCard = ({ event, disableLink }) => {
  const auth = useContext(AuthContext);
  const [locationName, setLocationName] = useState("Ładowanie lokalizacji...");
  const [organizer, setOrganizer] = useState("Nieznany organizator");
  const { id, title, description, event_date, location_id, organizer_id } =
    event || {};

  useEffect(() => {
    // Fetch location details if location_id is present
    if (location_id) {
      const fetchLocation = async () => {
        try {
          const locationData = await getLocationById(location_id);
          setLocationName(formatLocation(locationData));
        } catch (error) {
          console.error(
            `Error fetching location ${location_id} for event ${id}:`,
            error
          );
          setLocationName("Błąd ładowania lokalizacji");
        }
      };
      fetchLocation();
    } else {
      setLocationName("Lokalizacja nieokreślona");
    }
  }, [location_id, id]);

  const isOrganizer =
    auth.isAuthenticated && auth.currentUser.id === organizer_id;
  useEffect(() => {
    if (isOrganizer) {
      setOrganizer("Twoje wydarzenie");
    } else if (organizer_id) {
      const fetchOrganizer = async () => {
        try {
          const organizerData = await getUserName(organizer_id);
          setOrganizer(formatUser(organizerData));
        } catch (error) {
          console.error(
            `Error fetching organizer ${organizer_id} for event ${id}:`,
            error
          );
          setOrganizer("Błąd ładowania lokalizacji");
        }
      };
      fetchOrganizer();
    } else {
      setLocationName("Nieznany organizator");
    }
  }, [organizer_id, id, isOrganizer]);

  // Truncate title and description if it's too long for the card
  const shortTitle =
    title && title.length > 8 ? `${title.substring(0, 6)}...` : title;
  const shortDescription =
    description && description.length > 90
      ? `${description.substring(0, 87)}...`
      : description;

  const date = formatDate(event_date);

  const children = (
    <div
      className={`${styles.eventCard} ${disableLink && styles.disabledLink}`}
    >
      <div className={`${styles.cardTop} ${isOrganizer && styles.owner}`}>
        <div className={styles.eventCircle}>
          <div className={styles.mainTitle}>{shortTitle}</div>
          <div className={styles.subtitle}>{organizer}</div>
        </div>
      </div>
      <div className={styles.cardBottom}>
        <div>
          <div className={styles.title}>{date}</div>
          <p className={styles.subtitle}>{locationName}</p>
        </div>
        <p className={styles.descriptionText}>{shortDescription}</p>
      </div>
    </div>
  );

  return (
    <>
      {!disableLink ? (
        <Link to={`/events/${id}`} className={styles.cardLink}>
          {children}
        </Link>
      ) : (
        <span className={styles.cardLink}>{children}</span>
      )}
    </>
  );
};

export default EventCard;
