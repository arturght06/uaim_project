import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EventCreate.module.css";
import Input from "../../../components/UI/Input/Input";
import Button from "../../../components/UI/Button/Button";
import Textarea from "../../../components/UI/Textarea/Textarea";
import Select from "../../../components/UI/Select/Select";
import Modal from "../../../components/UI/Modal/Modal";
import CreateLocationForm from "../../../components/Location/CreateLocation/CreateLocation";
import { AuthContext } from "../../../contexts/AuthContext";
import { createNewEvent } from "../../../services/events";
import { getUserLocations } from "../../../services/location";
import EventCard from "../../../components/Events/EventCard/EventCard";

const EventCreate = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [formData, setFormData] = useState({
    organizer_id: auth.currentUser.id,
    title: "",
    description: "",
    event_date: "",
    location_id: "",
    max_participants: "",
  });
  const [locations, setLocations] = useState([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getUserLocations(auth.currentUser.id);
        setLocations(data || []);
      } catch (error) {
        console.error("Failed to fetch locations for event form:", error);
      }
    };
    fetchLocations();
  }, []);

  if (auth.isLoadingAuth) return <p className={styles.message}>Ładowanie...</p>;
  if (!auth.isAuthenticated || !auth.currentUser) {
    navigate("/login", { replace: true });
    return null;
  }

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
    setLocations((prevLocations) => {
      // Check if location already exists to prevent duplicates if form is somehow submitted twice
      const existingLocation = prevLocations.find(
        (loc) => loc.id === newLocation.id
      );
      return existingLocation ? prevLocations : [...prevLocations, newLocation];
    });
    setFormData((prevData) => ({ ...prevData, location_id: newLocation.id }));
    setIsLocationModalOpen(false); // Close the modal
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});
    if (!validateClientSide()) return;

    setIsLoading(true);
    const eventDataToSubmit = {
      ...formData,
      organizer_id: auth.currentUser.id,
      max_participants:
        formData.max_participants === ""
          ? null
          : parseInt(formData.max_participants, 10),
    };

    try {
      const responseData = await createNewEvent(eventDataToSubmit);
      alert("Wydarzenie zostało pomyślnie utworzone!");
      navigate(`/events/${responseData.id}`);
    } catch (error) {
      console.error("Błąd tworzenia wydarzenia:", error);
      if (error.isValidationError && error.serverErrors) {
        setErrors(error.serverErrors);
        setServerError("Popraw błędy w formularzu.");
      } else if (error.data && error.data.error) {
        setServerError(error.data.error);
      } else {
        setServerError(error.message || "Wystąpił błąd.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const locationOptions = locations.map((loc) => ({
    value: loc.id,
    label: `${loc.country}, ${loc.city}, ${loc.address}`,
  }));

  return (
    <div className={styles.parent}>
      <div className={styles.createEventContainer}>
        <h1>Utwórz Nowe Wydarzenie</h1>
        {serverError && <p className={styles.serverError}>{serverError}</p>}
        <form onSubmit={handleSubmitEvent} className={styles.form}>
          {" "}
          <Input
            label="Tytuł wydarzenia"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
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
            className={styles.addLocationButton}
          >
            Dodaj nową lokalizację
          </Button>
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
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? "Tworzenie Wydarzenia..." : "Utwórz Wydarzenie"}
          </Button>
        </form>

        {/* Modal for creating a new location */}
        <Modal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          title="Dodaj Nową Lokalizację"
        >
          <CreateLocationForm
            onSuccess={handleLocationCreated}
            onCancel={() => setIsLocationModalOpen(false)}
          />
        </Modal>
      </div>
      <div className={styles.createEventContainer}>
        <h1>Karta wydarzenia</h1>
        <EventCard event={formData} disableLink={true}></EventCard>
      </div>
    </div>
  );
};

export default EventCreate;
