import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./Modal.module.css";
import Button from "../Button/Button";

const Modal = ({ isOpen, onClose, title, children, footerContent }) => {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset"; // Make sure to unset on unmount
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Use React Portal to render the modal at the end of the body
  // This helps with z-index and stacking context issues.
  return ReactDOM.createPortal(
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {" "}
        {/* Prevent closing on content click */}
        <div className={styles.modalHeader}>
          {title && (
            <h2 id="modal-title" className={styles.modalTitle}>
              {title}
            </h2>
          )}
          <Button
            onClick={onClose}
            className={styles.closeButton}
            variant="icon"
            aria-label="Zamknij modal"
          >
            × {/* HTML entity for 'X' character */}
          </Button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footerContent && (
          <div className={styles.modalFooter}>{footerContent}</div>
        )}
      </div>
    </div>,
    document.getElementById("modal-root") // <div id="modal-root"></div> in public/index.html
  );
};

export default Modal;
