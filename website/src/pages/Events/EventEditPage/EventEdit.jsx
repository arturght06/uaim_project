import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EventForm from "../../../components/Events/EventForm/EventForm";
import { getEventById } from "../../../services/events";
import { AuthContext } from "../../../contexts/AuthContext";
import styles from "./EventEdit.module.css";

const EventEdit = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [eventToEdit, setEventToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError("Brak ID wydarzenia.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await getEventById(eventId);
        if (auth.currentUser && data.organizer_id === auth.currentUser.id) {
          setEventToEdit(data);
        } else {
          setError(
            "Nie masz uprawnień do edycji tego wydarzenia lub wydarzenie nie istnieje."
          );
        }
      } catch (err) {
        console.error("Error fetching event for edit:", err);
        setError(err.message || "Nie udało się załadować danych wydarzenia.");
      } finally {
        setIsLoading(false);
      }
    };

    if (auth.isAuthenticated) {
      fetchEvent();
    } else if (!auth.isLoadingAuth) {
      navigate("/login");
    }
  }, [
    eventId,
    auth.isAuthenticated,
    auth.currentUser,
    navigate,
    auth.isLoadingAuth,
  ]);

  const handleSuccess = (updatedEvent) => {
    if (updatedEvent && updatedEvent.id) {
      navigate(`/events/${updatedEvent.id}`);
    } else {
      navigate("/events");
    }
  };

  if (isLoading || auth.isLoadingAuth)
    return <p className={styles.message}>Ładowanie...</p>;
  if (error) return <p className={styles.errorMessage}>Błąd: {error}</p>;
  if (!eventToEdit)
    return (
      <p className={styles.message}>
        Nie znaleziono wydarzenia do edycji lub brak uprawnień.
      </p>
    );

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Edytuj Wydarzenie</h1>
      <EventForm eventToEdit={eventToEdit} onSuccess={handleSuccess} />
    </div>
  );
};

export default EventEdit;
