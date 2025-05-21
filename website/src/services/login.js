/**
 * Validates login form data on the client-side.
 * Throws an error object if validation fails.
 */
export const validateClientSide = ({ login, password }) => {
  const errors = {};
  if (!login.trim()) {
    errors.login = "Email lub nazwa użytkownika jest wymagana.";
  }
  if (!password) {
    errors.password = "Hasło jest wymagane.";
  }
  if (Object.keys(errors).length) {
    throw errors;
  }
};

/**
 * Attempts to login with form data.
 * Throws an error from the server if unsuccessful
 */
export const tryLogin = async (data) => {
  const response = await fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  // Error
  if (!response.ok) {
    // Server error is always a string
    throw responseData;
  }

  // Success
  if (responseData.success && responseData.tokens && responseData.user) {
    console.log("Logowanie udane:", responseData);
    localStorage.setItem("accessToken", responseData.tokens.access_token);
    localStorage.setItem("refreshToken", responseData.tokens.refresh_token);
    localStorage.setItem("userUUID", responseData.user.id);
    return responseData.user;
  } else {
    console.log(responseData);
    throw "Błąd logowania: Nieprawidłowa odpowiedź serwera.";
  }
};

/**
 * Logs out user
 */
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userUUID");
};
