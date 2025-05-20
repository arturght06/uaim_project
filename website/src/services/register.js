/**
 * Validates registration form data on the client-side.
 * Throws an error object if validation fails.
 */
export const validateRegisterClientSide = ({
  username,
  name,
  surname,
  birthday,
  email,
  password,
  confirmPassword,
  phone_country_code,
  phone_number,
}) => {
  const errors = {};
  if (!username.trim()) errors.username = "Nazwa użytkownika jest wymagana.";
  if (!name.trim()) errors.name = "Imię jest wymagane.";
  if (!surname.trim()) errors.surname = "Nazwisko jest wymagane.";
  if (!birthday) errors.birthday = "Data urodzenia jest wymagana.";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    errors.birthday = "Niepoprawny format daty (YYYY-MM-DD).";
  }
  if (!email.trim()) errors.email = "Adres email jest wymagany.";
  else if (!/\S+@\S+\.\S+/.test(email))
    errors.email = "Niepoprawny format adresu email.";

  if (!password) errors.password = "Hasło jest wymagane.";
  else if (password.length < 8)
    errors.password = "Hasło musi mieć co najmniej 8 znaków.";
  if (password !== confirmPassword)
    errors.confirmPassword = "Hasła nie są zgodne.";

  if (phone_country_code && !phone_number) {
    errors.phone_number =
      "Numer telefonu jest wymagany, jeśli podano kod kraju.";
  }
  if (!phone_country_code && phone_number) {
    errors.phone_country_code =
      "Kod kraju jest wymagany, jeśli podano numer telefonu.";
  }

  if (Object.keys(errors).length > 0) {
    throw errors;
  }
};

/**
 * Attempts to register a new user.
 * Throws an error from the server if unsuccessful
 */
export const tryRegister = async (userData) => {
  // Destructure to remove confirmPassword before sending to backend
  // eslint-disable-next-line no-unused-vars
  const { confirmPassword, ...dataToSubmit } = userData;

  const response = await fetch("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToSubmit),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw responseData;
  }

  return responseData;
};
