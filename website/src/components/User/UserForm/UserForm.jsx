import React, { useState, useEffect } from "react";
import styles from "./UserForm.module.css";
import Input from "../../UI/Input/Input";
import Button from "../../UI/Button/Button";

const UserForm = ({
  initialUser,
  onSubmit,
  isLoading,
  serverError,
  formErrors,
}) => {
  const [formData, setFormData] = useState({
    username: initialUser?.username || "",
    name: initialUser?.name || "",
    surname: initialUser?.surname || "",
    birthday: initialUser?.birthday
      ? new Date(initialUser.birthday).toISOString().split("T")[0]
      : "",
    email: initialUser?.email || "",
    phone_country_code: initialUser?.phone_country_code || "",
    phone_number: initialUser?.phone_number || "",
  });

  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    if (initialUser) {
      setFormData({
        username: initialUser.username || "",
        name: initialUser.name || "",
        surname: initialUser.surname || "",
        birthday: initialUser.birthday
          ? new Date(initialUser.birthday).toISOString().split("T")[0]
          : "",
        email: initialUser.email || "",
        phone_country_code: initialUser.phone_country_code || "",
        phone_number: initialUser.phone_number || "",
      });
    }
  }, [initialUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (clientErrors[name])
      setClientErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Imię jest wymagane.";
    if (!formData.surname.trim()) newErrors.surname = "Nazwisko jest wymagane.";
    if (formData.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthday)) {
      newErrors.birthday = "Niepoprawny format daty (YYYY-MM-DD).";
    }
    if (!formData.email.trim()) newErrors.email = "Email jest wymagany.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Niepoprawny format email.";

    // Phone validation (optional, if one part is provided)
    if (formData.phone_country_code && !formData.phone_number) {
      newErrors.phone_number =
        "Numer telefonu jest wymagany, jeśli podano kod kraju.";
    }
    if (!formData.phone_country_code && formData.phone_number) {
      newErrors.phone_country_code =
        "Kod kraju jest wymagany, jeśli podano numer telefonu.";
    }

    setClientErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <Input
        label="Nazwa użytkownika"
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={clientErrors.username || formErrors?.username}
      />
      <Input
        label="Imię"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={clientErrors.name || formErrors?.name}
        required
      />
      <Input
        label="Nazwisko"
        type="text"
        name="surname"
        value={formData.surname}
        onChange={handleChange}
        error={clientErrors.surname || formErrors?.surname}
        required
      />
      <Input
        label="Data urodzenia"
        type="date"
        name="birthday"
        value={formData.birthday}
        onChange={handleChange}
        error={clientErrors.birthday || formErrors?.birthday}
      />
      <Input
        label="Adres email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={clientErrors.email || formErrors?.email}
        required
      />
      <div className={styles.phoneGroup}>
        <Input
          label="Kod kraju"
          type="text"
          name="phone_country_code"
          value={formData.phone_country_code}
          onChange={handleChange}
          placeholder="+48"
          error={
            clientErrors.phone_country_code || formErrors?.phone_country_code
          }
        />
        <Input
          label="Numer telefonu"
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          placeholder="123456789"
          error={clientErrors.phone_number || formErrors?.phone_number}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? "Zapisywanie..." : "Zapisz Zmiany"}
      </Button>
    </form>
  );
};

export default UserForm;
