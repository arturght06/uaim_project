import React, { useState, useEffect } from "react";
import EventCard from "../EventCard/EventCard";
import styles from "./EventList.module.css";
import { getAllEvents } from "../../../services/events";

const EventList = ({
  filterType = "all", // Default to fetching all events
  // categoryId,      // Examples for future filtering
  // userId,
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
        if (filterType === "all") {
          data = await getAllEvents();
        } else {
          // Default or handle other filter types
          data = await getAllEvents(); // Fallback to all for now
        }
        setEvents(data || []);
      } catch (err) {
        console.error(`Error fetching events (filter: ${filterType}):`, err);
        setError(err.message || "Nie udało się załadować wydarzeń.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [filterType]);

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
