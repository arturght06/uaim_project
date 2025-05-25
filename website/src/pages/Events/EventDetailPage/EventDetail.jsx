import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "./EventDetail.module.css";
import { getEventById, removeEvent } from "../../../services/events";
import { AuthContext } from "../../../contexts/AuthContext";
import Button from "../../../components/UI/Button/Button";
import {
  formatDate,
  formatLocation,
  formatUser,
} from "../../../services/format";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      setIsLoading(true);
      setError(null);
      try {
        let data = await getEventById(eventId);
        setEvent(data);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError(
          err.message ||
            `Nie udało się załadować szczegółów wydarzenia (ID: ${eventId}).`
        );
        if (err.status === 404) {
          setError(`Wydarzenie o ID ${eventId} nie zostało znalezione.`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventDetails();
  }, [eventId, auth.isAuthenticated, auth.currentUser]);

  const handleDeleteEvent = async () => {
    if (
      !event ||
      !window.confirm(`Czy na pewno chcesz usunąć wydarzenie "${event.title}"?`)
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      await removeEvent(event.id);
      alert("Wydarzenie zostało pomyślnie usunięte.");
      navigate("/events");
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.message || "Nie udało się usunąć wydarzenia.");
      setIsDeleting(false);
    }
  };

  if (isLoading)
    return (
      <p className={styles.loadingMessage}>
        Ładowanie szczegółów wydarzenia...
      </p>
    );
  if (error) return <p className={styles.errorMessage}>Błąd: {error}</p>;
  if (!event)
    return <p className={styles.errorMessage}>Nie znaleziono wydarzenia.</p>;

  const {
    title,
    description,
    event_date,
    organizer_id,
    created_at,
    location_data,
    organizer_data,
    max_participants,
  } = event;

  const isOwner = auth.isAuthenticated && auth.currentUser?.id === organizer_id;

  return (
    <div className={styles.eventDetailContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {isOwner && (
          <div className={styles.ownerActions}>
            <Button
              variant="danger"
              onClick={handleDeleteEvent}
              disabled={isDeleting}
              className={styles.actionButtonSmall}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1.2em", marginRight: "5px" }}
              >
                delete
              </span>
              {isDeleting ? "Usuwanie..." : "Usuń"}
            </Button>
            {/* TODO: Edit Button
            <Button 
              variant="outline" 
              onClick={() => navigate(`/events/${eventId}/edit`)}
              className={styles.actionButtonSmall}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.2em', marginRight: '5px' }}>edit</span>
              Edytuj
            </Button>
            */}
          </div>
        )}
      </div>

      <div className={styles.metaInfoBar}>
        <div className={styles.metaItem}>
          <span className="material-symbols-outlined">person</span>
          <span>
            Organizator: <strong>{formatUser(organizer_data)}</strong>
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className="material-symbols-outlined">schedule</span>
          <span>
            Opublikowano:{" "}
            {formatDate(created_at, { hour: undefined, minute: undefined }) ||
              "Nieznana"}
          </span>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainContent}>
          <h2 className={styles.sectionTitle}>Opis Wydarzenia</h2>
          <p className={styles.description}>{description || "Brak opisu."}</p>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>Szczegóły</h3>
            <div className={styles.detailItem}>
              <span className="material-symbols-outlined">calendar_month</span>
              <div className={styles.detailText}>
                <strong>Data i Godzina:</strong>
                <p>{formatDate(event_date) || "Nie określono"}</p>
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className="material-symbols-outlined">pin_drop</span>
              <div className={styles.detailText}>
                <strong>Lokalizacja:</strong>
                <p>{formatLocation(location_data) || "Nie określono"}</p>
                {location_data?.address && (
                  <p className={styles.subDetail}>{location_data.address}</p>
                )}
                {location_data?.city && (
                  <p className={styles.subDetail}>{location_data.city}</p>
                )}
              </div>
            </div>
            {max_participants !== null && max_participants !== undefined && (
              <div className={styles.detailItem}>
                <span className="material-symbols-outlined">groups</span>
                <div className={styles.detailText}>
                  <strong>Maks. uczestników:</strong>
                  <p>{max_participants}</p>
                </div>
              </div>
            )}

            {!isOwner && auth.isAuthenticated && (
              <Button variant="success" className={styles.primaryActionButton}>
                <span
                  className="material-symbols-outlined"
                  style={{ marginRight: "8px" }}
                >
                  how_to_reg
                </span>
                Zarezerwuj Miejsce (TODO)
              </Button>
            )}
            {!auth.isAuthenticated && (
              <p className={styles.loginPrompt}>
                <Link to="/login">Zaloguj się</Link>, aby zarezerwować miejsce.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EventDetail;
