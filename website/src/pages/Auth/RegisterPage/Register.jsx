import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import Input from "../../../components/UI/Input/Input";
import Button from "../../../components/UI/Button/Button";
import {
  tryRegister,
  validateRegisterClientSide,
} from "../../../services/register";
import AppLink from "../../../components/UI/AppLink/AppLink";

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

    try {
      validateRegisterClientSide(formData);
      setErrors({});
    } catch (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const responseData = await tryRegister(formData);

      // Success
      console.log("Registration successful (component):", responseData);
      navigate("/login");
    } catch (error) {
      console.error("Registration error (component):", error);
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setGeneralError(error.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.center}>
        <h1>Rejestracja</h1>
        <p>Dołącz do naszej społeczności i odkrywaj wydarzenia kulturalne.</p>
        <p className={styles.loginLink}>
          Masz już konto? <AppLink to="/login">Zaloguj się</AppLink>
        </p>
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
            />
            <Input
              label="Numer telefonu"
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="123456789"
              error={errors.phone_number}
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
