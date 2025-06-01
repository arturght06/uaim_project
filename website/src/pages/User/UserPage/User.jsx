import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./User.module.css";
import { AuthContext } from "../../../contexts/AuthContext";
import Button from "../../../components/UI/Button/Button";
import EventList from "../../../components/Events/EventList/EventList";
import DeleteGrid from "../../../components/UI/DeleteGrid/DeleteGrid";
import Modal from "../../../components/UI/Modal/Modal";
import CreateLocation from "../../../components/Location/CreateLocation/CreateLocation";
import CreateCategory from "../../../components/Category/CreateCategory/CreateCategory";

import { getUserLocations, removeLocation } from "../../../services/location";
import { getAllCategories, deleteCategory } from "../../../services/category";
import { formatLocation } from "../../../services/format";
import { useAlert } from "../../../contexts/AlertContext";

const User = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [userLocations, setUserLocations] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [errorLocations, setErrorLocations] = useState(null);
  const [errorCategories, setErrorCategories] = useState(null);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const { showAlert } = useAlert();

  // Fetch user's locations and categories
  const fetchUserSpecificData = async () => {
    if (!auth.currentUser) return;

    setIsLoadingLocations(true);
    setErrorLocations(null);
    try {
      const locData = await getUserLocations(auth.currentUser.id);
      setUserLocations(locData || []);
    } catch (err) {
      setErrorLocations(err.message || "Nie udało się załadować lokalizacji.");
    } finally {
      setIsLoadingLocations(false);
    }

    setIsLoadingCategories(true);
    setErrorCategories(null);
    try {
      const catData = await getAllCategories();
      setUserCategories(catData || []); // Displaying all for now
    } catch (err) {
      setErrorCategories(err.message || "Nie udało się załadować kategorii.");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated && auth.currentUser) {
      fetchUserSpecificData();
    }
  }, [auth.isAuthenticated, auth.currentUser]);

  if (auth.isLoadingAuth) {
    return (
      <p className={styles.loadingMessage}>Ładowanie danych użytkownika...</p>
    );
  }
  if (!auth.isAuthenticated || !auth.currentUser) {
    navigate("/login", { replace: true });
    return null;
  }

  const { id: userId, username, name, surname } = auth.currentUser;

  const handleLocationCreated = (newLocation) => {
    setUserLocations((prev) => [
      ...prev.filter((loc) => loc.id !== newLocation.id),
      newLocation,
    ]);
    setIsLocationModalOpen(false);
  };
  const handleCategoryCreated = (newCategory) => {
    setUserCategories((prev) =>
      [...prev.filter((cat) => cat.id !== newCategory.id), newCategory].sort(
        (a, b) => a.name.localeCompare(b.name)
      )
    );
    setIsCategoryModalOpen(false);
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      await removeLocation(locationId); // From locationService
      setUserLocations((prev) => prev.filter((loc) => loc.id !== locationId));
      showAlert("Lokalizacja usunięta pomyślnie.", "success");
    } catch (err) {
      showAlert(
        `Błąd usuwania lokalizacji. Może być wykorzystywana przez isntniejące wydarzenie.`,
        "error"
      );
      throw err;
    }
  };
  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId); // From categoryService
      setUserCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      showAlert("Kategoria usunięta pomyślnie.", "success");
    } catch (err) {
      showAlert(
        `Błąd usuwania kategorii. Może być wykorzystywana przez isntniejące wydarzenie.`,
        "error"
      );
      throw err;
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.headerName}>
          <div className={styles.mainName}>{`${name || ""} ${
            surname || ""
          }`}</div>
          <div>{`${username}`}</div>
        </div>
        <div className={styles.headerButtons}>
          <Button
            onClick={() => navigate("/profile/edit")}
            variant="outline"
            className={styles.headerButton}
          >
            <span className="material-symbols-outlined">edit</span> Edytuj
            Profil
          </Button>
          <Button
            onClick={() => navigate("/events/create")}
            variant="primary"
            className={styles.headerButton}
          >
            <span className="material-symbols-outlined">add</span> Nowe
            wydarzenie
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Twoje Wydarzenia</h2>
        <EventList filterType="user_events" userId={userId} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Twoje Lokalizacje</h2>
          <Button
            onClick={() => setIsLocationModalOpen(true)}
            variant="outline"
            size="small"
          >
            <span className="material-symbols-outlined">add_location_alt</span>{" "}
            Dodaj Lokalizację
          </Button>
        </div>
        <DeleteGrid
          items={userLocations}
          onDeleteItem={handleDeleteLocation}
          displayFormatter={formatLocation}
          itemNameSingular="lokalizację"
          itemNamePlural="lokalizacje"
          isLoading={isLoadingLocations}
          error={errorLocations}
          noItemsMessage="Nie dodałeś jeszcze żadnych lokalizacji."
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Twoje Kategorie</h2>
          <Button
            onClick={() => setIsCategoryModalOpen(true)}
            variant="outline"
            size="small"
          >
            <span className="material-symbols-outlined">category</span> Dodaj
            Kategorię
          </Button>
        </div>
        <DeleteGrid
          items={userCategories}
          onDeleteItem={handleDeleteCategory}
          displayFormatter={(item) => item.name}
          itemNameSingular="kategorię"
          itemNamePlural="kategorie"
          isLoading={isLoadingCategories}
          error={errorCategories}
          noItemsMessage="Nie dodałeś jeszcze żadnych kategorii."
        />
      </div>

      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Dodaj Nową Lokalizację"
      >
        <CreateLocation
          onSuccess={handleLocationCreated}
          onCancel={() => setIsLocationModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Dodaj Nową Kategorię"
      >
        <CreateCategory
          onSuccess={handleCategoryCreated}
          onCancel={() => setIsCategoryModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default User;
