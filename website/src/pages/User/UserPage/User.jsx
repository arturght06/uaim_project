import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./User.module.css";
import { AuthContext } from "../../../contexts/AuthContext";
import Button from "../../../components/UI/Button/Button";

const User = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (auth.isLoadingAuth) {
    return (
      <p className={styles.loadingMessage}>Ładowanie danych użytkownika...</p>
    );
  }

  if (!auth.isAuthenticated || !auth.currentUser) {
    navigate("/login"); // Redirect to login if not authenticated
    return null;
  }

  const { username, email, name, surname, birthday } = auth.currentUser;

  // Helper to format date
  const formatDate = (isoString) => {
    if (!isoString) return "Nie podano";
    try {
      return new Date(isoString).toLocaleDateString("pl-PL");
    } catch {
      return "Niepoprawna data";
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>Twój Profil</h1>
        <Button onClick={() => navigate("/events/create")} variant="primary">
          Dodaj nowe wydarzenie
        </Button>
      </div>

      <div className={styles.profileDetails}>
        <h2>Dane osobowe</h2>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Nazwa użytkownika:</span>
          <span className={styles.detailValue}>{username || "Nie podano"}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Email:</span>
          <span className={styles.detailValue}>{email || "Nie podano"}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Imię:</span>
          <span className={styles.detailValue}>{name || "Nie podano"}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Nazwisko:</span>
          <span className={styles.detailValue}>{surname || "Nie podano"}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Data urodzenia:</span>
          <span className={styles.detailValue}>{formatDate(birthday)}</span>
        </div>
      </div>

      {/* Placeholder for user's events list */}
      <div className={styles.userEventsSection}>
        <h2>Twoje Wydarzenia</h2>
        <p>Lista Twoich wydarzeń pojawi się tutaj wkrótce.</p>
      </div>
    </div>
  );
};

export default User;
