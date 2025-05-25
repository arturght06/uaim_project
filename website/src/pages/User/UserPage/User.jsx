import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./User.module.css";
import { AuthContext } from "../../../contexts/AuthContext";
import Button from "../../../components/UI/Button/Button";
import EventList from "../../../components/Events/EventList/EventList";

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

  const { username, name, surname } = auth.currentUser;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.headerName}>
          <div className={styles.mainName}>{`${name} ${surname}`}</div>
          <div>{`${username}`}</div>
        </div>
        <div className={styles.headerButtons}>
          <Button
            onClick={() => navigate("/profile/edit")}
            variant="outline"
            style={{ marginRight: "10px" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "1.2em", marginRight: "5px" }}
            >
              edit
            </span>
            Edytuj Profil
          </Button>
          <Button onClick={() => navigate("/events/create")} variant="primary">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "1.2em", marginRight: "5px" }}
            >
              add
            </span>
            Nowe wydarzenie
          </Button>
        </div>
      </div>

      <div className={styles.userEventsSection}>
        <h2>Twoje Wydarzenia</h2>
      </div>
      <EventList userId={auth.currentUser.id}></EventList>
    </div>
  );
};

export default User;
