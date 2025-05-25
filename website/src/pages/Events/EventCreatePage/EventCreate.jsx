import React from "react";
import { useNavigate } from "react-router-dom";
import EventForm from "../../../components/Events/EventForm/EventForm";
import styles from "./EventCreate.module.css";

const EventCreate = () => {
  const navigate = useNavigate();

  const handleSuccess = (createdEvent) => {
    if (createdEvent && createdEvent.id) {
      navigate(`/events/${createdEvent.id}`);
    } else {
      navigate("/events"); // Fallback
    }
  };

  return (
    <div className={styles.pageContainer}>
      {" "}
      {/* Użyj własnej klasy dla kontenera strony */}
      <h1 className={styles.pageTitle}>Utwórz Nowe Wydarzenie</h1>
      <EventForm onSuccess={handleSuccess} />{" "}
      {/* eventToEdit nie jest przekazywane -> tryb tworzenia */}
    </div>
  );
};

export default EventCreate;
