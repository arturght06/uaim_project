import React from "react";
import styles from "./NotificationItem.module.css";
import { formatDate } from "../../../services/format";

const NotificationItem = ({ notification, onMarkAsSeen }) => {
  const { id, content, created_at, seen, type = "info" } = notification;

  const handleItemClick = () => {
    if (!seen && onMarkAsSeen) {
      onMarkAsSeen(id);
    }
  };

  return (
    <div
      className={`${styles.notificationItem} ${
        seen ? styles.seen : styles.unseen
      } ${styles[type]}`}
      onClick={handleItemClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && handleItemClick()
      }
    >
      <div className={styles.content}>
        <p className={styles.message}>
          {content || "Brak treści powiadomienia."}
        </p>
        {created_at && (
          <small className={styles.timestamp}>{formatDate(created_at)}</small>
        )}
      </div>
      {!seen && (
        <span className={styles.unreadDot} title="Nieprzeczytane"></span>
      )}
    </div>
  );
};

export default NotificationItem;
