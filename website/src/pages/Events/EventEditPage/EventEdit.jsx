import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EventForm from "../../../components/Events/EventForm/EventForm";
import { AuthContext } from "../../../contexts/AuthContext";
import styles from "./EventEdit.module.css";

const EventEdit = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [pageLoading, setPageLoading] = useState(true);
  const [accessError, setAccessError] = useState(null);

  useEffect(() => {
    console.log("EventEdit mounted/updated. eventId from URL:", eventId);
    console.log(
      "Auth state: isLoadingAuth:",
      auth.isLoadingAuth,
      "isAuthenticated:",
      auth.isAuthenticated
    );

    if (auth.isLoadingAuth) {
      setPageLoading(true);
      return;
    }

    if (!auth.isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (!eventId) {
      setAccessError("Brak ID wydarzenia do edycji.");
      setPageLoading(false);
      return;
    }

    setPageLoading(false);
    setAccessError(null);
  }, [eventId, auth.isAuthenticated, auth.isLoadingAuth, navigate]);

  const handleSuccess = (updatedEvent) => {
    if (updatedEvent && updatedEvent.id) {
      console.log(
        "Event updated successfully, navigating to:",
        `/events/${updatedEvent.id}`
      );
      navigate(`/events/${updatedEvent.id}`);
    } else {
      console.log(
        "Event update successful, but no ID in response, navigating to /"
      );
      navigate("/");
    }
  };

  if (pageLoading || auth.isLoadingAuth) {
    return <p className={styles.message}>Ładowanie...</p>;
  }

  if (accessError) {
    return <p className={styles.errorMessage}>Błąd: {accessError}</p>;
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Edytuj Wydarzenie</h1>
      {eventId ? (
        <EventForm eventToEditId={eventId} onSuccess={handleSuccess} />
      ) : (
        <p className={styles.errorMessage}>Błąd: Brak ID wydarzenia.</p>
      )}
    </div>
  );
};

export default EventEdit;
