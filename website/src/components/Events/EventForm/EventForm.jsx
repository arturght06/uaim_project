import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EventForm.module.css";
import Input from "../../UI/Input/Input";
import Button from "../../UI/Button/Button";
import Textarea from "../../UI/Textarea/Textarea";
import Select from "../../UI/Select/Select";
import Modal from "../../UI/Modal/Modal";
import CreateLocation from "../../Location/CreateLocation/CreateLocation";
import CreateCategory from "../../Category/CreateCategory/CreateCategory";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  createNewEvent,
  updateEvent,
  getEventById,
} from "../../../services/events";
import { getAllLocations } from "../../../services/location";
import { getAllCategories } from "../../../services/category";
import {
  linkEventToCategory,
  unlinkEventFromCategory,
  getAllEventCategoryRelations,
} from "../../../services/eventCategory";
import { formatLocation } from "../../../services/format";
import { useAlert } from "../../../contexts/AlertContext";

const EventForm = ({ eventToEditId, onSuccess }) => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const isEditMode = !!eventToEditId;

  const [eventDataForEdit, setEventDataForEdit] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location_id: "",
    max_participants: "",
    selectedCategoryIds: [], // Array of selected category IDs
  });

  const [allCategories, setAllCategories] = useState([]);
  const [existingEventCategoryRelations, setExistingEventCategoryRelations] =
    useState([]);

  const [locations, setLocations] = useState([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(isEditMode); // Loading initial event/category data
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission process
  const [serverError, setServerError] = useState("");

  const { showAlert } = useAlert();

  const resetFormState = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      event_date: "",
      location_id: "",
      max_participants: "",
      selectedCategoryIds: [],
    });
    setErrors({});
    setServerError("");
  }, []);

  // Fetch initial data
  useEffect(() => {
    console.log(
      "EventForm useEffect triggered. isEditMode:",
      isEditMode,
      "eventToEditId:",
      eventToEditId
    );
    const fetchInitialData = async () => {
      setIsLoadingData(true);
      try {
        const [locationsData, categoriesData] = await Promise.all([
          getAllLocations(),
          getAllCategories(),
        ]);
        setLocations(locationsData || []);
        setAllCategories(categoriesData || []);

        if (isEditMode && eventToEditId) {
          const fetchedEvent = await getEventById(eventToEditId);
          setEventDataForEdit(fetchedEvent);

          setFormData({
            title: fetchedEvent.title || "",
            description: fetchedEvent.description || "",
            event_date: fetchedEvent.event_date
              ? new Date(
                  new Date(fetchedEvent.event_date).getTime() -
                    new Date().getTimezoneOffset() * 60000
                )
                  .toISOString()
                  .slice(0, 16)
              : "",
            location_id: fetchedEvent.location_id || "",
            max_participants:
              fetchedEvent.max_participants !== null &&
              fetchedEvent.max_participants !== undefined
                ? fetchedEvent.max_participants.toString()
                : "",
            selectedCategoryIds: [],
          });

          const allRelations = await getAllEventCategoryRelations();
          const eventRelations = allRelations.filter(
            (rel) => rel.event_id === eventToEditId
          );
          setExistingEventCategoryRelations(eventRelations);

          setFormData((prevFormData) => ({
            ...prevFormData,
            selectedCategoryIds: eventRelations.map((rel) => rel.category_id),
          }));
        } else {
          resetFormState();
        }
      } catch (error) {
        console.error("Error fetching initial data for event form:", error);
        setServerError(
          "Nie udało się załadować danych formularza. Spróbuj odświeżyć stronę."
        );
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchInitialData();
  }, [eventToEditId, isEditMode, resetFormState]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === "number" ? (value === "" ? "" : parseInt(value, 10)) : value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
    setServerError("");
  };

  const validateClientSide = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Tytuł jest wymagany.";
    if (!formData.description.trim())
      newErrors.description = "Opis jest wymagany.";
    if (!formData.event_date)
      newErrors.event_date = "Data wydarzenia jest wymagana.";
    else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(formData.event_date))
      newErrors.event_date = "Niepoprawny format daty (YYYY-MM-DDTHH:MM).";
    if (!formData.location_id)
      newErrors.location_id = "Lokalizacja jest wymagana.";
    if (formData.selectedCategoryIds.length === 0)
      newErrors.categories = "Wybierz przynajmniej jedną kategorię."; // Example category validation

    if (
      formData.max_participants !== "" &&
      isNaN(parseInt(formData.max_participants, 10))
    )
      newErrors.max_participants = "Maks. liczba uczestników musi być liczbą.";
    else if (
      formData.max_participants !== "" &&
      parseInt(formData.max_participants, 10) < 0
    )
      newErrors.max_participants =
        "Maks. liczba uczestników nie może być ujemna.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationCreated = (newLocation) => {
    setLocations((prev) =>
      [...prev.filter((loc) => loc.id !== newLocation.id), newLocation].sort(
        (a, b) => a.name.localeCompare(b.name)
      )
    );
    setFormData((prev) => ({ ...prev, location_id: newLocation.id }));
    setIsLocationModalOpen(false);
  };

  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => {
      const newSelected = prev.selectedCategoryIds.includes(categoryId)
        ? prev.selectedCategoryIds.filter((id) => id !== categoryId)
        : [...prev.selectedCategoryIds, categoryId];
      // Clear category-specific error if user interacts
      if (errors.categories) setErrors((e) => ({ ...e, categories: null }));
      return { ...prev, selectedCategoryIds: newSelected };
    });
  };

  const handleCategoryCreated = (newCategory) => {
    setAllCategories((prev) =>
      [...prev.filter((cat) => cat.id !== newCategory.id), newCategory].sort(
        (a, b) => a.name.localeCompare(b.name)
      )
    );
    setFormData((prev) => ({
      ...prev,
      selectedCategoryIds: [...prev.selectedCategoryIds, newCategory.id],
    }));
    setIsCategoryModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateClientSide()) return;

    setIsSubmitting(true);
    setServerError("");
    setErrors({});

    const payload = {
      id: eventDataForEdit && eventDataForEdit.id,
      title: formData.title,
      description: formData.description,
      event_date: new Date(formData.event_date).toISOString().slice(0, 16),
      location_id: formData.location_id,
      max_participants:
      formData.max_participants === ""
        ? null
        : parseInt(formData.max_participants, 10),
      ...(!isEditMode && { organizer_id: auth.currentUser.id }),
    };

    try {
      let savedEvent;
      if (isEditMode && eventDataForEdit) {
        savedEvent = await updateEvent(payload);
        showAlert("Wydarzenie zaktualizowane pomyślnie!", "success");
      } else {
        savedEvent = await createNewEvent(payload);
        showAlert("Wydarzenie utworzone pomyślnie!", "success");
      }

      // Manage category relations
      const newCategoryIds = formData.selectedCategoryIds;
      const oldRelations = isEditMode ? existingEventCategoryRelations : [];
      const oldCategoryIds = oldRelations.map((rel) => rel.category_id);

      const categoriesToAdd = newCategoryIds.filter(
        (id) => !oldCategoryIds.includes(id)
      );
      const relationsToRemove = oldRelations.filter(
        (rel) => !newCategoryIds.includes(rel.category_id)
      );

      // Perform linking and unlinking operations
      // These can be parallelized for better performance
      const linkingPromises = categoriesToAdd.map((categoryId) =>
        linkEventToCategory({
          event_id: eventDataForEdit.id,
          category_id: categoryId,
        })
      );
      const unlinkingPromises = relationsToRemove.map(
        (relation) => unlinkEventFromCategory(relation.id) // Assumes relation object has its own ID
      );

      await Promise.all([...linkingPromises, ...unlinkingPromises]);
      console.log("Category relations updated.");

      if (onSuccess) {
        onSuccess(savedEvent);
      } else {
        navigate(
          isEditMode
            ? `/events/${eventDataForEdit.id}`
            : savedEvent.id
            ? `/events/${savedEvent.id}`
            : "/events"
        );
      }
    } catch (error) {
      console.error(
        `Błąd ${
          isEditMode ? "aktualizacji" : "tworzenia"
        } wydarzenia lub kategorii:`,
        error
      );
      if (error.isValidationError && error.serverErrors) {
        setErrors(error.serverErrors);
        setServerError("Popraw błędy w formularzu.");
      } else if (error.data && error.data.error) {
        setServerError(error.data.error);
      } else {
        setServerError(error.message || "Wystąpił nieoczekiwany błąd.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationOptions = locations.map((loc) => ({
    value: loc.id,
    label: formatLocation(loc),
  }));

  if (isLoadingData)
    return <p className={styles.message}>Ładowanie danych formularza...</p>;
  if (auth.isLoadingAuth)
    return <p className={styles.message}>Ładowanie statusu użytkownika...</p>;
  if (!auth.isAuthenticated || !auth.currentUser) {
    navigate("/login", { replace: true });
    return null;
  }
  if (isEditMode && !eventDataForEdit && !isLoadingData)
    return (
      <p className={styles.serverError}>
        {serverError || "Nie udało się załadować wydarzenia do edycji."}
      </p>
    );

  return (
    <div className={styles.eventFormContainer}>
      {serverError && <p className={styles.serverError}>{serverError}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Tytuł wydarzenia"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
        />
        <Textarea
          label="Opis wydarzenia"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          rows={6}
        />
        <Input
          label="Data i godzina wydarzenia"
          type="datetime-local"
          name="event_date"
          value={formData.event_date}
          onChange={handleChange}
          error={errors.event_date}
        />

        {!isLocationModalOpen ? (
          <div className={styles.locationSection}>
            <Select
              label="Lokalizacja"
              name="location_id"
              value={formData.location_id}
              onChange={handleChange}
              error={errors.location_id}
              options={locationOptions}
              defaultOptionText="Wybierz istniejącą lokalizację..."
            />
            <Button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              variant="outline"
              className={styles.addInlineButton}
            >
              Dodaj nową lokalizację
            </Button>
          </div>
        ) : (
          <div className={styles.createFormWrapper}>
            <CreateLocation
              onSuccess={handleLocationCreated}
              onCancel={() => setIsLocationModalOpen(false)}
            />
          </div>
        )}

        <div className={styles.categorySection}>
          <label className={styles.label}>Kategorie:</label>
          {errors.categories && (
            <p className={styles.fieldError}>{errors.categories}</p>
          )}
          {allCategories.length === 0 && !isLoadingData && (
            <p>Brak dostępnych kategorii. Kliknij poniżej, aby dodać.</p>
          )}
          <div className={styles.categoryCheckboxGroup}>
            {allCategories.map((category) => (
              <div key={category.id} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  value={category.id}
                  checked={formData.selectedCategoryIds.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                />
                <label htmlFor={`category-${category.id}`}>
                  {category.name}
                </label>
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            variant="outline"
            className={styles.addInlineButton}
          >
            Dodaj nową kategorię
          </Button>
        </div>

        <Input
          label="Maks. liczba uczestników (opcjonalne)"
          type="number"
          name="max_participants"
          value={formData.max_participants}
          onChange={handleChange}
          min="0"
          error={errors.max_participants}
        />

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || isLocationModalOpen || isCategoryModalOpen}
          className={styles.submitButton}
        >
          {isSubmitting
            ? isEditMode
              ? "Aktualizowanie..."
              : "Tworzenie..."
            : isEditMode
            ? "Zapisz Zmiany"
            : "Utwórz Wydarzenie"}
        </Button>
      </form>

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

export default EventForm;
