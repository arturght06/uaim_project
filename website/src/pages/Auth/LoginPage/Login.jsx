import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Login.module.css";
import Input from "../../../components/UI/Input/Input";
import Button from "../../../components/UI/Button/Button";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
    setGeneralError("");
  };

  const validateClientSide = () => {
    const newErrors = {};
    if (!formData.login.trim()) {
      newErrors.login = "Email lub nazwa użytkownika jest wymagana.";
    }
    if (!formData.password) {
      newErrors.password = "Hasło jest wymagane.";
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

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      // Error
      if (!response.ok) {
        // Server error is always a string
        setGeneralError(responseData);

        setIsLoading(false);
        return;
      }

      // Success
      if (
        responseData.success &&
        responseData.tokens &&
        responseData.tokens.access_token
      ) {
        console.log("Logowanie udane:", responseData);
        localStorage.setItem("accessToken", responseData.tokens.access_token);
        localStorage.setItem("refreshToken", responseData.tokens.refresh_token);
        alert("Zalogowano pomyślnie!");
        navigate("/");
      } else {
        setGeneralError("Błąd logowania: Nieprawidłowa odpowiedź serwera.");
      }
    } catch (error) {
      console.error("Błąd podczas wysyłania żądania:", error);
      if (error instanceof SyntaxError) {
        setGeneralError(
          "Błąd odpowiedzi serwera: Nieprawidłowy format JSON. Sprawdź konsolę backendu."
        );
      } else {
        setGeneralError(
          "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.center}>
        <h2>Logowanie</h2>
        <p className={styles.subtitle}>Zaloguj się, aby kontynuować.</p>
      </div>
      <div className={styles.container}>
        {generalError && <p className={styles.generalError}>{generalError}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Login (email lub nazwa użytkownika)"
            type="text"
            name="login"
            value={formData.login}
            onChange={handleChange}
            placeholder="Wpisz email lub nazwę użytkownika"
            error={errors.login}
          />
          <Input
            label="Hasło"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Wpisz hasło"
            error={errors.password}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className={styles.loginButton}
          >
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </form>
        <p className={styles.registerLink}>
          Nie masz jeszcze konta? <Link to="/register">Zarejestruj się</Link>
        </p>
      </div>
    </>
  );
};

export default Login;
