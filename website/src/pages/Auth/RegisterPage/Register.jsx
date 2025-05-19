import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import Input from "../../../components/UI/Input/Input";
import Button from "../../../components/UI/Button/Button";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    surname: "",
    birthday: "",
    email: "",
    phone_country_code: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState(""); // General server errors

  const handleChange = (e) => {
    // Change data
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear errors
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
    setGeneralError("");
  };

  // Client-side validation
  const validateClientSide = () => {
    const newErrors = {};
    if (!formData.username.trim())
      newErrors.username = "Nazwa użytkownika jest wymagana.";
    if (!formData.name.trim()) newErrors.name = "Imię jest wymagane.";
    if (!formData.surname.trim()) newErrors.surname = "Nazwisko jest wymagane.";
    if (!formData.birthday)
      newErrors.birthday = "Data urodzenia jest wymagana.";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.birthday)) {
      newErrors.birthday = "Niepoprawny format daty (YYYY-MM-DD).";
    }
    if (!formData.email.trim()) newErrors.email = "Email jest wymagany.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Niepoprawny format email.";

    if (!formData.password) newErrors.password = "Hasło jest wymagane.";
    else if (formData.password.length < 8)
      newErrors.password = "Hasło musi mieć co najmniej 8 znaków.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Hasła nie są zgodne.";

    if (formData.phone_country_code && !formData.phone_number) {
      newErrors.phone_number =
        "Numer telefonu jest wymagany, jeśli podano kod kraju.";
    }
    if (!formData.phone_country_code && formData.phone_number) {
      newErrors.phone_country_code =
        "Kod kraju jest wymagany, jeśli podano numer telefonu.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setErrors({});

    if (!validateClientSide()) {
      return;
    }

    setIsLoading(true);

    // Remove client-side elements
    const { _confirmPassword, ...dataToSubmit } = formData;

    // Fetch
    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData && responseData.errors) {
          setErrors(responseData.errors);
        } else if (responseData && responseData.error) {
          setGeneralError(responseData.error);
        } else {
          setGeneralError(
            `Nieznany błąd rejestracji: ${response.status} ${response.statusText}`
          );
        }
        setIsLoading(false);
        return;
      }

      // Success
      console.log("Rejestracja udana:", responseData);
      alert("Rejestracja zakończona pomyślnie! Możesz się teraz zalogować.");
      navigate("/login");
    } catch (error) {
      console.error("Błąd podczas wysyłania żądania:", error);
      setGeneralError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.center}>
        <h1>Rejestracja</h1>
        <p>Dołącz do naszej społeczności i odkrywaj wydarzenia kulturalne.</p>
      </div>
      <div className={styles.container}>
        {generalError && <p className={styles.generalError}>{generalError}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Nazwa użytkownika"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Wpisz nazwę użytkownika"
            error={errors.username}
          />
          <Input
            label="Imię"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Wpisz imię"
            error={errors.name}
          />
          <Input
            label="Nazwisko"
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            placeholder="Wpisz nazwisko"
            error={errors.surname}
          />
          <Input
            label="Data urodzenia (YYYY-MM-DD)"
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            error={errors.birthday}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Wpisz adres email"
            error={errors.email}
          />
          <div className={styles.phoneGroup}>
            <Input
              label="Kod kraju"
              type="text"
              name="phone_country_code"
              value={formData.phone_country_code}
              onChange={handleChange}
              placeholder="+48"
              error={errors.phone_country_code}
              className={styles.phoneCountryCode}
            />
            <Input
              label="Numer telefonu"
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="123456789"
              error={errors.phone_number}
              className={styles.phoneNumber}
            />
          </div>
          <Input
            label="Hasło"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Wpisz hasło"
            error={errors.password}
          />
          <Input
            label="Potwierdź hasło"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Potwierdź hasło"
            error={errors.confirmPassword}
          />
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Rejestrowanie..." : "Zarejestruj"}
          </Button>
        </form>
      </div>
    </>
  );
};

export default Register;
