import React from "react";
import ReactDOM from "react-dom";
import { useAlert } from "../../../contexts/AlertContext";
import styles from "./Alert.module.css";

const AlertItem = ({ alert, onRemove }) => {
  const { id, message, type } = alert;
  const alertTypeClass = styles[type] || styles.info;

  return (
    <div className={`${styles.alertItem} ${alertTypeClass}`} role="alert">
      <span className={styles.message}>{message}</span>
      <button
        onClick={() => onRemove(id)}
        className={styles.closeButton}
        aria-label="Zamknij alert"
        title="Zamknij"
      >
        ×
      </button>
    </div>
  );
};

const Alert = () => {
  const { alerts, removeAlert } = useAlert();

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const alertRoot =
    document.getElementById("alert-root") ||
    document.getElementById("modal-root");
  if (!alertRoot) {
    return (
      <div className={styles.alertContainerFallback}>
        {" "}
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} onRemove={removeAlert} />
        ))}
      </div>
    );
  }

  return ReactDOM.createPortal(
    <div
      className={styles.alertContainer}
      aria-live="assertive"
      aria-relevant="additions text"
    >
      {alerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} onRemove={removeAlert} />
      ))}
    </div>,
    alertRoot
  );
};

export default Alert;
