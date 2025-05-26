import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "./EventDetail.module.css";
import { getEventById, removeEvent } from "../../../services/events";
import {
  createReservation,
  deleteReservationById,
  getAllMyReservations,
} from "../../../services/reservation";
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
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [error, setError] = useState(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // State for reservation
  const [userReservation, setUserReservation] = useState(null);
  const [isReservationProcessing, setIsReservationProcessing] = useState(false);
  const [isCheckingReservation, setIsCheckingReservation] = useState(true);

  const fetchEventDetails = async () => {
    if (!eventId) return;

    setIsLoadingEvent(true);
    setError(null);

    try {
      const eventData = await getEventById(eventId);
      setEvent(eventData);
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError(
        err.message ||
          `Nie udało się załadować szczegółów wydarzenia (ID: ${eventId}).`
      );
    } finally {
      setIsLoadingEvent(false);
    }
  };

  useEffect(() => {
    const fetchDetailsAndReservation = async () => {
      await fetchEventDetails();

      if (auth.isAuthenticated && auth.currentUser) {
        try {
          const allMyReservations = await getAllMyReservations();
          const foundReservation = allMyReservations.find(
            (res) =>
              res.event_id === eventId && res.user_id === auth.currentUser.id
          );
          setUserReservation(foundReservation || null);
        } catch (reservationError) {
          console.error("Error fetching reservations:", reservationError);
          setUserReservation(null);
        }
      }

      setIsCheckingReservation(false);
    };

    setIsCheckingReservation(true);
    fetchDetailsAndReservation();
  }, [eventId, auth.isAuthenticated, auth.currentUser]);

  const handleDeleteEvent = async () => {
    if (
      !event ||
      !window.confirm(`Czy na pewno chcesz usunąć wydarzenie "${event.title}"?`)
    ) {
      return;
    }
    setIsDeletingEvent(true);
    try {
      await removeEvent(event.id);
      alert("Wydarzenie zostało pomyślnie usunięte.");
      navigate("/events");
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.message || "Nie udało się usunąć wydarzenia.");
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleCreateReservation = async () => {
    if (!event || !auth.currentUser) return;
    setIsReservationProcessing(true);
    setError(null);
    try {
      const reservationData = {
        user_id: auth.currentUser.id,
        event_id: event.id,
        status: "confirmed",
      };
      const newReservation = await createReservation(reservationData);
      setUserReservation({
        id: newReservation.id,
        user_id: auth.currentUser.id,
        event_id: event.id,
        status: "confirmed",
        reserved_at: new Date().toISOString(),
      });

      await fetchEventDetails(); // Refresh event info
    } catch (err) {
      console.error("Error creating reservation:", err);
      setError(
        err.data?.error || err.message || "Nie udało się utworzyć rezerwacji."
      );
    } finally {
      setIsReservationProcessing(false);
    }
  };

  const handleDeleteReservation = async () => {
    if (!userReservation || !userReservation.id) {
      return;
    }
    setIsReservationProcessing(true);
    setError(null);
    try {
      await deleteReservationById(userReservation.id);
      setUserReservation(null);
      await fetchEventDetails(); // Refresh event info
    } catch (err) {
      console.error("Error deleting reservation:", err);
      setError(
        err.data?.error || err.message || "Nie udało się anulować rezerwacji."
      );
    } finally {
      setIsReservationProcessing(false);
    }
  };

  if (isLoadingEvent) {
    // Main loading state for event data
    return (
      <p className={styles.loadingMessage}>
        Ładowanie szczegółów wydarzenia...
      </p>
    );
  }
  if (error && !event) {
    // If there's a critical error and no event data
    return <p className={styles.errorMessage}>Błąd: {error}</p>;
  }
  if (!event) {
    // Fallback if event is still null after loading and no specific error
    return <p className={styles.errorMessage}>Nie znaleziono wydarzenia.</p>;
  }

  const {
    title,
    description,
    event_date,
    organizer_id,
    created_at,
    location_data,
    organizer_data,
    max_participants,
    reservation_count,
  } = event;

  const isOwner = auth.isAuthenticated && auth.currentUser?.id === organizer_id;
  const spotsLeft =
    max_participants !== null && max_participants !== undefined
      ? max_participants - reservation_count
      : Infinity;
  const canReserve = spotsLeft > 0;

  return (
    <div className={styles.eventDetailContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {isOwner && (
          <div className={styles.ownerActions}>
            <Button
              variant="outline"
              onClick={() => navigate(`/events/edit/${event.id}`)}
              className={styles.actionButtonSmall}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1.2em", marginRight: "5px" }}
              >
                edit
              </span>
              Edytuj
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteEvent}
              disabled={isDeletingEvent}
              className={styles.actionButtonSmall}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1.2em", marginRight: "5px" }}
              >
                delete
              </span>
              {isDeletingEvent ? "Usuwanie..." : "Usuń"}
            </Button>
          </div>
        )}
      </div>

      <div className={styles.metaInfoBar}>
        <div className={styles.metaItem}>
          <span className="material-symbols-outlined">person</span>
          <span>
            Organizator:{" "}
            <strong>{formatUser(organizer_data) || "Nieznany"}</strong>
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

      {error && event && <p className={styles.errorMessage}>Błąd: {error}</p>}

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
              </div>
            </div>
            <div className={styles.detailItem}>
              <span className="material-symbols-outlined">groups</span>
              <div className={styles.detailText}>
                <strong>Liczba rezerwacji:</strong>
                <p>
                  {reservation_count}
                  {max_participants !== null &&
                    max_participants !== undefined &&
                    `/${max_participants}`}
                  {/* Only show spots left if it's not infinity and not initial check */}
                  {!isCheckingReservation &&
                    spotsLeft < Infinity &&
                    ` (Pozostało: ${spotsLeft})`}
                </p>
              </div>
            </div>

            {/* --- Reservation Actions --- */}
            {auth.isAuthenticated && !isOwner && (
              <>
                {isCheckingReservation ? (
                  <p className={styles.reservationStatus}>
                    Sprawdzanie statusu rezerwacji...
                  </p>
                ) : userReservation ? (
                  <Button
                    variant="warning"
                    className={styles.primaryActionButton}
                    onClick={handleDeleteReservation}
                    disabled={isReservationProcessing}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ marginRight: "8px" }}
                    >
                      event_busy
                    </span>
                    {isReservationProcessing
                      ? "Anulowanie..."
                      : "Anuluj Rezerwację"}
                  </Button>
                ) : canReserve ? (
                  <Button
                    variant="success"
                    className={styles.primaryActionButton}
                    onClick={handleCreateReservation}
                    disabled={isReservationProcessing}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ marginRight: "8px" }}
                    >
                      how_to_reg
                    </span>
                    {isReservationProcessing
                      ? "Rezerwowanie..."
                      : "Zarezerwuj Miejsce"}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className={styles.primaryActionButton}
                    disabled
                  >
                    Brak wolnych miejsc
                  </Button>
                )}
              </>
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
