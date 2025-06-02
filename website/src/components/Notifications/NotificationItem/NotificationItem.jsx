import React from "react";
import styles from "./NotificationItem.module.css";
import { formatDate } from "../../../services/format";
import Button from "../../UI/Button/Button";
import { deleteNotification } from "../../../services/notification";

const NotificationItem = ({
  notification,
  onMarkAsSeen,
  fetchNotifications,
}) => {
  const {
    id,
    content,
    title,
    created_at,
    status,
    type = "info",
  } = notification;
  console.log(notification);

  const seen = status === "seen";

  const handleItemClick = () => {
    if (!seen && onMarkAsSeen) {
      onMarkAsSeen(id);
    }
  };

  const handleItemDelete = async () => {
    await deleteNotification(id);
    fetchNotifications();
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
        <p className={styles.title}>{title}</p>
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
      <span className="material-symbols-outlined" onClick={handleItemDelete}>
        delete
      </span>
    </div>
  );
};

export default NotificationItem;
