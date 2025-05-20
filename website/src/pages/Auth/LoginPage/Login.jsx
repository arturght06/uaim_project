import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import Input from "../../../components/UI/Input/Input";
import Button from "../../../components/UI/Button/Button";
import { tryLogin, validateClientSide } from "../../../services/login";
import AppLink from "../../../components/UI/AppLink/AppLink";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setErrors({});

    try {
      validateClientSide(formData);
    } catch (errors) {
      setErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      await tryLogin(formData);
    } catch (error) {
      setGeneralError(error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    navigate("/");
  };

  return (
    <>
      <div className={styles.center}>
        <h1>Logowanie</h1>
        <p className={styles.subtitle}>Zaloguj się, aby kontynuować.</p>
        <p className={styles.registerLink}>
          Nie masz jeszcze konta?{" "}
          <AppLink to="/register">Zarejestruj się</AppLink>
        </p>
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
      </div>
    </>
  );
};

export default Login;
