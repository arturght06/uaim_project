import React, { useState } from "react";
import styles from "./CreateLocation.module.css";
import Input from "../../UI/Input/Input";
import Button from "../../UI/Button/Button";
import Textarea from "../../UI/Textarea/Textarea";
import { createNewLocation } from "../../../services/location";

const CreateLocation = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    setServerError("");
  };

  const validateClientSide = () => {
    const newErrors = {};
    if (!formData.address.trim()) newErrors.address = "Adres jest wymagany.";
    if (!formData.city.trim()) newErrors.city = "Miasto jest wymagane.";
    if (!formData.country.trim()) newErrors.country = "Kraj jest wymagany.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});
    if (!validateClientSide()) return;

    setIsLoading(true);
    const locationDataToSubmit = {
      ...formData,
      description: formData.description || null,
    };

    try {
      const newLocation = await createNewLocation(locationDataToSubmit);
      console.log("Lokalizacja utworzona (formularz):", newLocation);
      if (onSuccess) {
        onSuccess(newLocation);
      }
      setFormData({
        name: "",
        address: "",
        city: "",
        postal_code: "",
        country: "",
        description: "",
      });
    } catch (error) {
      console.error("Błąd tworzenia lokalizacji (formularz):", error);
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

  return (
    <div className={styles.createLocationForm}>
      {serverError && <p className={styles.serverError}>{serverError}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Kraj"
          name="country"
          value={formData.country}
          onChange={handleChange}
          error={errors.country}
          required
        />
        <Input
          label="Miasto"
          name="city"
          value={formData.city}
          onChange={handleChange}
          error={errors.city}
          required
        />
        <Input
          label="Adres"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          required
        />
        <div className={styles.formActions}>
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            disabled={isLoading}
          >
            Anuluj
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Dodawanie..." : "Dodaj Lokalizację"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateLocation;
