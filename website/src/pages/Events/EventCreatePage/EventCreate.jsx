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
      navigate("/"); // Fallback
    }
  };

  return (
    <div className={styles.pageContainer}>
      {" "}
      <h1 className={styles.pageTitle}>Utwórz Nowe Wydarzenie</h1>
      <EventForm onSuccess={handleSuccess} />{" "}
    </div>
  );
};

export default EventCreate;
