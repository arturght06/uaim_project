import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "./EventDetail.module.css";
import { getEventById, removeEvent } from "../../../services/events";
import {
  createReservation,
  deleteReservationById,
  getAllMyReservations,
} from "../../../services/reservation";
import {
  getCommentsByEventId,
  createComment,
  updateComment,
  deleteComment,
} from "../../../services/comment";
import { AuthContext } from "../../../contexts/AuthContext";
import Button from "../../../components/UI/Button/Button";
import {
  formatDate,
  formatLocation,
  formatUser,
} from "../../../services/format";
import { useAlert } from "../../../contexts/AlertContext";
import Textarea from "../../../components/UI/Textarea/Textarea";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [error, setError] = useState(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  const [userReservation, setUserReservation] = useState(null);
  const [isReservationProcessing, setIsReservationProcessing] = useState(false);
  const [isCheckingReservation, setIsCheckingReservation] = useState(true);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const { showAlert } = useAlert();

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
    const fetchDetailsAndData = async () => {
      await fetchEventDetails();

      try {
        const commentData = await getCommentsByEventId(eventId);
        setComments(commentData || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }

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
    fetchDetailsAndData();
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
      showAlert("Wydarzenie zostało pomyślnie usunięte.", "success");
      navigate("/");
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
      auth.fetchNotifications();
      setUserReservation({
        id: newReservation.id,
        user_id: auth.currentUser.id,
        event_id: event.id,
        status: "confirmed",
        reserved_at: new Date().toISOString(),
      });
      await fetchEventDetails();
      showAlert("Stworzono rezerwację.", "success");
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
    if (!userReservation || !userReservation.id) return;
    setIsReservationProcessing(true);
    setError(null);
    try {
      await deleteReservationById(userReservation.id);
      setUserReservation(null);
      await fetchEventDetails();
      showAlert("Usunięto rezerwację.", "success");
    } catch (err) {
      console.error("Error deleting reservation:", err);
      setError(
        err.data?.error || err.message || "Nie udało się anulować rezerwacji."
      );
    } finally {
      setIsReservationProcessing(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !auth.currentUser) return;
    setIsCommentSubmitting(true);
    try {
      const commentData = {
        event_id: eventId,
        user_id: auth.currentUser.id,
        content: newComment.trim(),
      };
      await createComment(commentData);
      const updated = await getCommentsByEventId(eventId);
      showAlert("Dodano komentarz.", "success");
      setComments(updated || []);
      setNewComment("");
    } catch (err) {
      console.error("Error creating comment:", err);
      showAlert("Nie udało się dodać komentarza.", "error");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten komentarz?")) return;
    try {
      await deleteComment(commentId);
      const updated = await getCommentsByEventId(eventId);
      showAlert("Usunięto komentarz.", "success");
      setComments(updated || []);
    } catch (err) {
      console.error("Error deleting comment:", err);
      showAlert("Nie udało się usunąć komentarza.", "error");
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      await updateComment(commentId, { content: editingText });
      const updated = await getCommentsByEventId(eventId);
      setComments(updated || []);
      showAlert("Edytowano komentarz.", "success");
      setEditingCommentId(null);
      setEditingText("");
    } catch (err) {
      console.error("Error updating comment:", err);
      showAlert("Nie udało się edytować komentarza.", "error");
    }
  };

  if (isLoadingEvent) {
    return (
      <p className={styles.loadingMessage}>
        Ładowanie szczegółów wydarzenia...
      </p>
    );
  }
  if (error && !event) {
    return <p className={styles.errorMessage}>Błąd: {error}</p>;
  }
  if (!event) {
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
              <span className="material-symbols-outlined">edit</span>
              Edytuj
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteEvent}
              disabled={isDeletingEvent}
              className={styles.actionButtonSmall}
            >
              <span className="material-symbols-outlined">delete</span>
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
                  {!isCheckingReservation &&
                    spotsLeft < Infinity &&
                    ` (Pozostało: ${spotsLeft})`}
                </p>
              </div>
            </div>

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
                    <span className="material-symbols-outlined">
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
                    <span className="material-symbols-outlined">
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

      {/* Comments Section */}
      <div className={styles.commentsSection}>
        <h2 className={styles.sectionTitle}>Komentarze</h2>

        {auth.isAuthenticated ? (
          <div className={styles.commentForm}>
            <Textarea
              placeholder="Dodaj komentarz..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleCommentSubmit}
              disabled={isCommentSubmitting}
              variant="success"
            >
              {isCommentSubmitting ? "Dodawanie..." : "Dodaj Komentarz"}
            </Button>
          </div>
        ) : (
          <p>
            <Link to="/login">Zaloguj się</Link>, aby dodać komentarz.
          </p>
        )}

        <ul className={styles.commentList}>
          {comments.map((comment) => (
            <li key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <strong>{formatUser(comment.user_data)}</strong>{" "}
                <span>{formatDate(comment.created_at)}</span>
              </div>
              {editingCommentId === comment.id ? (
                <Textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={2}
                />
              ) : (
                <p className={styles.commentContent}>{comment.content}</p>
              )}
              {auth.currentUser?.id === comment.user_id && (
                <div className={styles.commentActions}>
                  {editingCommentId === comment.id ? (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => handleEditComment(comment.id)}
                      >
                        Zapisz
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setEditingCommentId(null)}
                      >
                        Anuluj
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingText(comment.content);
                        }}
                      >
                        Edytuj
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Usuń
                      </Button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EventDetail;
