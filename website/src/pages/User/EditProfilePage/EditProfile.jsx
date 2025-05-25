import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EditProfile.module.css";
import UserForm from "../../../components/User/UserForm/UserForm";
import { AuthContext } from "../../../contexts/AuthContext";
import { updateUser } from "../../../services/user";

const EditProfile = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [userToEdit, setUserToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (auth.isAuthenticated) {
        console.log(auth.currentUser);
        setUserToEdit(auth.currentUser);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    if (auth.isLoadingAuth) {
      return;
    }
    if (!auth.isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    fetchCurrentUser();
  }, [auth.isAuthenticated, auth.currentUser, auth.isLoadingAuth, navigate]);

  const handleProfileUpdate = async (updatedData) => {
    setIsLoading(true);
    setServerError("");
    setFormErrors({});
    try {
      await updateUser(auth.currentUser.id, updatedData);
      auth.refreshAuthStatus();
      alert("Profil został pomyślnie zaktualizowany!");
      navigate("/profile");
    } catch (error) {
      console.error("Błąd aktualizacji profilu:", error);
      if (error.errors) {
        setFormErrors(error.serverErrors);
        setServerError("Popraw błędy w formularzu.");
      } else if (error.error) {
        setServerError(error.error);
      } else {
        setServerError(error.message || "Wystąpił nieoczekiwany błąd.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || auth.isLoadingAuth)
    return <p className={styles.message}>Ładowanie...</p>;
  if (!auth.isAuthenticated) return null;
  if (serverError && !userToEdit)
    return <p className={styles.errorMessage}>{serverError}</p>;
  if (!userToEdit)
    return <p className={styles.message}>Brak danych użytkownika do edycji.</p>;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Edytuj Swój Profil</h1>
      <UserForm
        initialUser={userToEdit}
        onSubmit={handleProfileUpdate}
        isLoading={isLoading}
        serverError={serverError}
        formErrors={formErrors}
      />
    </div>
  );
};

export default EditProfile;
