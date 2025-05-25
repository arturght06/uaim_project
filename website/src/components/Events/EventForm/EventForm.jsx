// src/components/Events/EventForm/EventForm.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EventForm.module.css"; // Upewnij się, że ten plik CSS istnieje i jest dostosowany
import Input from "../../UI/Input/Input";
import Button from "../../UI/Button/Button";
import Textarea from "../../UI/Textarea/Textarea";
import Select from "../../UI/Select/Select";
import Modal from "../../UI/Modal/Modal";
import { AuthContext } from "../../../contexts/AuthContext";
import { createNewEvent, updateEvent } from "../../../services/events";
import { getAllLocations } from "../../../services/location";
import CreateLocation from "../../Location/CreateLocation/CreateLocation";
import { formatLocation } from "../../../services/format";

const EventForm = ({ eventToEdit, onSuccess }) => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const isEditMode = !!eventToEdit;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "", // YYYY-MM-DDTHH:MM
    location_id: "",
    max_participants: "",
  });

  const [locations, setLocations] = useState([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocationsData = async () => {
      try {
        const data = await getAllLocations();
        setLocations(data || []);
      } catch (error) {
        console.error("Failed to fetch locations for event form:", error);
        setServerError("Nie udało się załadować listy lokalizacji.");
      }
    };
    fetchLocationsData();
  }, []);

  // Populate form if in edit mode
  useEffect(() => {
    if (isEditMode && eventToEdit) {
      setFormData({
        title: eventToEdit.title || "",
        description: eventToEdit.description || "",
        event_date: eventToEdit.event_date
          ? new Date(
              new Date(eventToEdit.event_date).getTime() -
                new Date().getTimezoneOffset() * 60000
            )
              .toISOString()
              .slice(0, 16)
          : "",
        location_id: eventToEdit.location_id || "",
        max_participants:
          eventToEdit.max_participants !== null &&
          eventToEdit.max_participants !== undefined
            ? eventToEdit.max_participants.toString()
            : "",
      });
    }
    // Reset form for create mode if eventToEdit becomes null (e.g. navigating from edit to create)
    // This might not be strictly necessary if the component is always remounted.
    if (!isEditMode) {
      setFormData({
        title: "",
        description: "",
        event_date: "",
        location_id: "",
        max_participants: "",
      });
    }
  }, [eventToEdit, isEditMode]);

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
    else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(formData.event_date)) {
      newErrors.event_date =
        "Niepoprawny format daty i czasu (YYYY-MM-DDTHH:MM).";
    }
    if (!formData.location_id)
      newErrors.location_id = "Lokalizacja jest wymagana.";

    if (
      formData.max_participants !== "" &&
      isNaN(parseInt(formData.max_participants, 10))
    ) {
      newErrors.max_participants =
        "Maksymalna liczba uczestników musi być liczbą.";
    } else if (
      formData.max_participants !== "" &&
      parseInt(formData.max_participants, 10) < 0
    ) {
      newErrors.max_participants =
        "Maksymalna liczba uczestników nie może być ujemna.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationCreated = (newLocation) => {
    setLocations((prevLocations) => {
      const existing = prevLocations.find((loc) => loc.id === newLocation.id);
      return existing ? prevLocations : [...prevLocations, newLocation];
    });
    setFormData((prevData) => ({ ...prevData, location_id: newLocation.id }));
    setIsLocationModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});
    if (!validateClientSide()) return;

    setIsLoading(true);

    const dataPayload = {
      title: formData.title,
      description: formData.description,
      event_date: new Date(formData.event_date).toISOString().slice(0, 16),
      location_id: formData.location_id,
      max_participants:
        formData.max_participants === ""
          ? null
          : parseInt(formData.max_participants, 10),
      ...(!isEditMode && { organizer_id: auth.currentUser.id }), // Add organizer_id only for new events
    };

    try {
      let responseData;
      if (isEditMode && eventToEdit) {
        responseData = await updateEvent(eventToEdit.id, dataPayload);
        alert("Wydarzenie zostało pomyślnie zaktualizowane!");
      } else {
        responseData = await createNewEvent(dataPayload);
        alert("Wydarzenie zostało pomyślnie utworzone!");
      }

      console.log(
        isEditMode ? "Wydarzenie zaktualizowane:" : "Wydarzenie utworzone:",
        responseData
      );
      if (onSuccess) {
        onSuccess(responseData);
      } else {
        // Default navigation if no onSuccess callback is provided
        navigate(
          isEditMode
            ? `/events/${eventToEdit.id}`
            : responseData.id
            ? `/events/${responseData.id}`
            : "/events"
        );
      }
    } catch (error) {
      console.error(
        `Błąd ${isEditMode ? "aktualizacji" : "tworzenia"} wydarzenia:`,
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
      setIsLoading(false);
    }
  };

  const locationOptions = locations.map((loc) => ({
    value: loc.id,
    label: formatLocation(loc),
  }));

  if (auth.isLoadingAuth) return <p className={styles.message}>Ładowanie...</p>;
  if (!auth.isAuthenticated || !auth.currentUser) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className={styles.eventFormContainer}>
      {serverError && <p className={styles.serverError}>{serverError}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Tytuł wydarzenia"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Podaj tytuł wydarzenia"
          error={errors.title}
          required
        />
        <Textarea
          label="Opis wydarzenia"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Opisz szczegółowo swoje wydarzenie"
          error={errors.description}
          rows={6}
          required
        />
        <Input
          label="Data i godzina wydarzenia"
          type="datetime-local"
          name="event_date"
          value={formData.event_date}
          onChange={handleChange}
          error={errors.event_date}
          required
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
              required
            />
            <Button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              variant="outline"
              className={styles.addLocationButton}
            >
              Dodaj nową lokalizację
            </Button>
          </div>
        ) : (
          <div className={styles.createLocationFormWrapper}>
            <CreateLocation
              onSuccess={handleLocationCreated}
              onCancel={() => setIsLocationModalOpen(false)}
            />
          </div>
        )}

        <Input
          label="Maksymalna liczba uczestników (opcjonalne)"
          type="number"
          name="max_participants"
          value={formData.max_participants}
          onChange={handleChange}
          placeholder="Np. 50"
          min="0"
          error={errors.max_participants}
        />

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || isLocationModalOpen}
          className={styles.submitButton}
        >
          {isLoading
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
    </div>
  );
};

export default EventForm;
