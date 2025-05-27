import React, { useState } from "react";
import styles from "./CreateCategory.module.css";
import Input from "../../UI/Input/Input";
import Textarea from "../../UI/Textarea/Textarea";
import Button from "../../UI/Button/Button";
import { createCategory as createNewCategoryService } from "../../../services/category";
import { useAlert } from "../../../contexts/AlertContext";

const CreateCategory = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { showAlert } = useAlert();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    setServerError("");
  };

  const validateClientSide = () => {
    const newErrors = {};
    if (!formData.name.trim())
      newErrors.name = "Nazwa kategorii jest wymagana.";
    else if (formData.name.trim().length < 3)
      newErrors.name = "Nazwa kategorii musi mieć co najmniej 3 znaki."; // Example validation

    if (!formData.description.trim())
      newErrors.description = "Opis kategorii jest wymagany.";
    else if (formData.description.trim().length < 10)
      newErrors.description = "Opis kategorii musi mieć co najmniej 10 znaków."; // Example validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});
    if (!validateClientSide()) return;

    setIsLoading(true);
    try {
      const newCategory = await createNewCategoryService(formData); // Pass formData directly
      console.log("Kategoria utworzona (formularz):", newCategory);
      showAlert(
        `Kategoria "${
          newCategory.name || formData.name
        }" została pomyślnie utworzona!`,
        "success"
      );
      if (onSuccess) {
        onSuccess({
          id: newCategory.id,
          name: formData.name,
          description: formData.description,
        });
      }
      // Reset form or close modal (handled by parent through onCancel or onSuccess)
      setFormData({ name: "", description: "" }); // Reset local form
    } catch (error) {
      console.error("Błąd tworzenia kategorii (formularz):", error);
      if (error.isValidationError && error.serverErrors) {
        // Assuming handleResponse sets these
        setErrors(error.serverErrors);
        setServerError("Popraw błędy w formularzu.");
      } else if (error.data && error.data.error) {
        // Backend returns { "error": "message" }
        setServerError(error.data.error);
      } else {
        setServerError(
          error.message ||
            "Wystąpił nieoczekiwany błąd podczas tworzenia kategorii."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.createCategoryForm}>
      <h3>Dodaj Nową Kategorię</h3>
      {serverError && <p className={styles.serverError}>{serverError}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Nazwa kategorii"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Np. Muzyka, Teatr, Sztuka Wizualna"
          error={errors.name}
        />
        <Textarea
          label="Opis kategorii"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Krótki opis czego dotyczy kategoria..."
          error={errors.description}
          rows={4}
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
            {isLoading ? "Dodawanie..." : "Dodaj Kategorię"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
