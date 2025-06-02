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
        translated.name = "Imię jest nieprawidłowe (1-30 liter, tylko litery, spacje, myślniki lub apostrofy).";
        break;
            case "surname":
        translated.surname = "Nazwisko jest nieprawidłowe (1-30 liter, tylko litery, spacje, myślniki lub apostrofy).";
        break;
      case "birthday":
        translated.birthday =
          "Nieprawidłowy format daty urodzenia (RRRR-MM-DD).";
        break;
      case "email":
        translated.email = "Nieprawidłowy adres e-mail.";
        break;
      case "password":
        translated.password = "Hasło musi mieć co najmniej 8 znaków, zawierać wielką i małą literę oraz znak specjalny.";
        break;
      default:
        translated[field] = message;
    }
  }
  return translated;
};
