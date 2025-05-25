import React, { useState, useEffect } from "react";
import EventCard from "../EventCard/EventCard";
import styles from "./EventList.module.css";
import {
  getAllEvents,
  getCategoryEvents,
  getUserEvents,
} from "../../../services/events";

const EventList = ({
  categoryId,
  userId,
  customLoadingMessage,
  customNoEventsMessage,
}) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let data;
        if (userId) {
          data = await getUserEvents(userId);
        } else if (categoryId) {
          data = await getCategoryEvents(categoryId);
        } else {
          data = await getAllEvents();
        }
        setEvents(data || []);
      } catch (err) {
        setError(err.message || "Nie udało się załadować wydarzeń.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [userId, categoryId]);

  // ----- RENDER -----

  if (isLoading) {
    return (
      <p className={styles.statusMessage}>
        {customLoadingMessage || "Ładowanie wydarzeń..."}
      </p>
    );
  }

  if (error) {
    return (
      <p className={`${styles.statusMessage} ${styles.errorMessage}`}>
        Błąd: {error}
      </p>
    );
  }

  if (!events || events.length === 0) {
    return (
      <p className={styles.statusMessage}>
        {customNoEventsMessage || "Obecnie brak dostępnych wydarzeń."}
      </p>
    );
  }

  return (
    <div className={styles.eventsGrid}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventList;
