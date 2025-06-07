import { translateErrors } from "../translate";

describe("translateErrors", () => {
  test("translates known username error", () => {
    const errors = { username: "Some backend error for username" };
    const translated = translateErrors(errors);
    expect(translated.username).toBe("Nieprawidłowa nazwa użytkownika.");
  });

  test("translates known name error", () => {
    const errors = { name: "Invalid name format" };
    const translated = translateErrors(errors);
    expect(translated.name).toBe(
      "Imię jest nieprawidłowe (1-30 liter, tylko litery, spacje, myślniki lub apostrofy)."
    );
  });

  test("translates known surname error", () => {
    const errors = { surname: "Invalid surname format" };
    const translated = translateErrors(errors);
    expect(translated.surname).toBe(
      "Nazwisko jest nieprawidłowe (1-30 liter, tylko litery, spacje, myślniki lub apostrofy)."
    );
  });

  test("translates known birthday error", () => {
    const errors = { birthday: "Must be YYYY-MM-DD" };
    const translated = translateErrors(errors);
    expect(translated.birthday).toBe(
      "Nieprawidłowy format daty urodzenia (RRRR-MM-DD)."
    );
  });

  test("translates known email error", () => {
    const errors = { email: "Not a valid email" };
    const translated = translateErrors(errors);
    expect(translated.email).toBe("Nieprawidłowy adres e-mail.");
  });

  test("translates known password error", () => {
    const errors = { password: "Password too weak" };
    const translated = translateErrors(errors);
    expect(translated.password).toBe(
      "Hasło musi mieć co najmniej 8 znaków, zawierać wielką i małą literę oraz znak specjalny."
    );
  });

  test("passes through unknown errors", () => {
    const errors = { unknownField: "Some other error" };
    const translated = translateErrors(errors);
    expect(translated.unknownField).toBe("Some other error");
  });

  test("handles multiple errors", () => {
    const errors = { email: "bad email", password: "bad password" };
    const translated = translateErrors(errors);
    expect(translated.email).toBe("Nieprawidłowy adres e-mail.");
    expect(translated.password).toBe(
      "Hasło musi mieć co najmniej 8 znaków, zawierać wielką i małą literę oraz znak specjalny."
    );
  });

  test("handles empty error object", () => {
    const errors = {};
    const translated = translateErrors(errors);
    expect(translated).toEqual({});
  });
});
