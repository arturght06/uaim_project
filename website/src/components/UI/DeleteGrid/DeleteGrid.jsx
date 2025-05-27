import React, { useState } from "react";
import styles from "./DeleteGrid.module.css";
import Button from "../Button/Button";

const DeleteGrid = ({
  items,
  onDeleteItem,
  displayFormatter = (item) => item.name || item.title || item.id,
  itemNameSingular = "element",
  itemNamePlural = "elementy",
  isLoading = false,
  error = null,
  noItemsMessage,
}) => {
  const [deletingItemId, setDeletingItemId] = useState(null);

  const handleDelete = async (itemId, itemName) => {
    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć ${itemNameSingular} "${itemName}"?`
      )
    ) {
      return;
    }
    setDeletingItemId(itemId);
    try {
      await onDeleteItem(itemId);
    } catch (err) {
      console.error(`Error deleting item ${itemId}:`, err);
    } finally {
      setDeletingItemId(null);
    }
  };

  if (isLoading) {
    return (
      <p className={styles.message}>
        Ładowanie {itemNamePlural.toLowerCase()}...
      </p>
    );
  }

  if (error) {
    return (
      <p className={`${styles.message} ${styles.errorMessage}`}>
        Błąd ładowania {itemNamePlural.toLowerCase()}: {error}
      </p>
    );
  }

  if (!items || items.length === 0) {
    return (
      <p className={styles.message}>
        {noItemsMessage ||
          `Brak ${itemNamePlural.toLowerCase()} do wyświetlenia.`}
      </p>
    );
  }

  return (
    <div className={styles.deleteGridContainer}>
      <div className={styles.gridHeader}>
        <span>Nazwa</span>
        <span>Akcje</span>
      </div>
      <div className={styles.gridBody}>
        {items.map((item) => {
          const displayName = displayFormatter(item);
          return (
            <div key={item.id} className={styles.gridRow}>
              <span>{displayName}</span>
              <div className={styles.actions}>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDelete(item.id, displayName)}
                  disabled={deletingItemId === item.id}
                  className={styles.deleteButton}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1em" }}
                  >
                    delete
                  </span>
                  {deletingItemId === item.id ? "Usuwanie..." : "Usuń"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeleteGrid;
