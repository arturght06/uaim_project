/**
 * Translates a set of errors to generic Polish versions
 */
export const translateErrors = (data) => {
  let translated = {};
  for (const [field, message] of Object.entries(data)) {
    switch (field) {
      case "username":
        translated.username = "Nieprawidłowa nazwa użytkownika.";
        break;
      case "name":
        translated.name = "Nieprawidłowe imię.";
        break;
      case "surname":
        translated.surname = "Nieprawidłowe nazwisko.";
        break;
      case "birthday":
        translated.birthday =
          "Nieprawidłowy format daty urodzenia (RRRR-MM-DD).";
        break;
      case "email":
        translated.email = "Nieprawidłowy adres e-mail.";
        break;
      case "password":
        translated.password = "Nieprawidłowe hasło.";
        break;
      default:
        translated[field] = message;
    }
  }
  return translated;
};
