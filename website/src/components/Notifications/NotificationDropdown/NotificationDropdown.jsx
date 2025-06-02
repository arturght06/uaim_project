import React from "react";
import styles from "./NotificationDropdown.module.css";
import NotificationItem from "../NotificationItem/NotificationItem";
import { Link } from "react-router-dom";

const NotificationDropdown = ({
  notifications,
  isLoading,
  onMarkAsSeen,
  fetchNotifications,
  // onClose,
}) => {
  if (isLoading) {
    return (
      <div className={styles.dropdownContainer}>
        <p className={styles.message}>Ładowanie powiadomień...</p>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className={styles.dropdownContainer}>
        <p className={styles.message}>Brak nowych powiadomień.</p>
      </div>
    );
  }

  return (
    <div className={styles.dropdownContainer}>
      <div className={styles.header}>
        <h4>Powiadomienia</h4>
      </div>
      <div className={styles.list}>
        {notifications.map((notif) => (
          <NotificationItem
            key={notif.id}
            notification={notif}
            onMarkAsSeen={() => onMarkAsSeen(notif.id)}
            fetchNotifications={fetchNotifications}
          />
        ))}
      </div>
      {/* <div className={styles.footer}>
        <Link
          to="/notifications"
          onClick={onClose}
          className={styles.viewAllLink}
        >
          Zobacz wszystkie
        </Link>
      </div> */}
    </div>
  );
};

export default NotificationDropdown;
