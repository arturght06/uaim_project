import { tryRegister, validateRegisterClientSide } from "../register"; // Corrected: Go up one level for 'register'
import { translateErrors } from "../translate"; // Corrected: Go up one level for 'translate'

global.fetch = jest.fn();
jest.mock("../translate", () => ({
  // Corrected: Go up one level for 'translate'
  translateErrors: jest.fn((errors) => ({ ...errors, translated: true })),
}));

describe("Register Service", () => {
  beforeEach(() => {
    fetch.mockClear();
    translateErrors.mockClear();
  });

  describe("validateRegisterClientSide", () => {
    const validData = {
      username: "testuser",
      name: "Test",
      surname: "User",
      birthday: "2000-01-01",
      email: "test@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      phone_country_code: "",
      phone_number: "",
    };

    test("does not throw error for valid data", () => {
      expect(() => validateRegisterClientSide(validData)).not.toThrow();
    });

    test("throws error if username is empty", () => {
      expect(() =>
        validateRegisterClientSide({ ...validData, username: "" })
      ).toThrow(
        expect.objectContaining({
          username: "Nazwa użytkownika jest wymagana.",
        })
      );
    });

    test("throws error if name is empty", () => {
      expect(() =>
        validateRegisterClientSide({ ...validData, name: "" })
      ).toThrow(expect.objectContaining({ name: "Imię jest wymagane." }));
    });
    test("throws error if surname is empty", () => {
      expect(() =>
        validateRegisterClientSide({ ...validData, surname: "" })
      ).toThrow(
        expect.objectContaining({ surname: "Nazwisko jest wymagane." })
      );
    });
    test("throws error if birthday is empty or invalid", () => {
      expect(() =>
        validateRegisterClientSide({ ...validData, birthday: "" })
      ).toThrow(
        expect.objectContaining({ birthday: "Data urodzenia jest wymagana." })
      );
      expect(() =>
        validateRegisterClientSide({ ...validData, birthday: "invalid-date" })
      ).toThrow(
        expect.objectContaining({
          birthday: "Niepoprawny format daty (YYYY-MM-DD).",
        })
      );
    });
    test("throws error if email is empty or invalid", () => {
      expect(() =>
        validateRegisterClientSide({ ...validData, email: "" })
      ).toThrow(
        expect.objectContaining({ email: "Adres email jest wymagany." })
      );
      expect(() =>
        validateRegisterClientSide({ ...validData, email: "invalid" })
      ).toThrow(
        expect.objectContaining({ email: "Niepoprawny format adresu email." })
      );
    });
    test("throws error if password is empty or too short", () => {
      expect(() =>
        validateRegisterClientSide({ ...validData, password: "" })
      ).toThrow(expect.objectContaining({ password: "Hasło jest wymagane." }));
      expect(() =>
        validateRegisterClientSide({ ...validData, password: "short" })
      ).toThrow(
        expect.objectContaining({
          password: "Hasło musi mieć co najmniej 8 znaków.",
        })
      );
    });
    test("throws error if passwords do not match", () => {
      expect(() =>
        validateRegisterClientSide({
          ...validData,
          confirmPassword: "WrongPassword123!",
        })
      ).toThrow(
        expect.objectContaining({ confirmPassword: "Hasła nie są zgodne." })
      );
    });
    test("throws error if phone_number is present without phone_country_code", () => {
      expect(() =>
        validateRegisterClientSide({
          ...validData,
          phone_number: "123",
          phone_country_code: "",
        })
      ).toThrow(
        expect.objectContaining({
          phone_country_code:
            "Kod kraju jest wymagany, jeśli podano numer telefonu.",
        })
      );
    });
    test("throws error if phone_country_code is present without phone_number", () => {
      expect(() =>
        validateRegisterClientSide({
          ...validData,
          phone_number: "",
          phone_country_code: "+48",
        })
      ).toThrow(
        expect.objectContaining({
          phone_number: "Numer telefonu jest wymagany, jeśli podano kod kraju.",
        })
      );
    });
  });

  describe("tryRegister", () => {
    const userData = {
      username: "testuser",
      name: "Test",
      surname: "User",
      birthday: "2000-01-01",
      email: "test@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      phone_country_code: "",
      phone_number: "",
    };
    const { confirmPassword, ...expectedPayload } = userData;

    test("successful registration", async () => {
      const mockResponseData = { success: true, user: { id: "123" } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponseData,
      });

      const result = await tryRegister(userData);
      expect(fetch).toHaveBeenCalledWith("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expectedPayload),
      });
      expect(result).toEqual(mockResponseData);
    });

    test("handles 400 error with responseData.error (user exists)", async () => {
      const mockErrorResponse = { error: "User already exists" };
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      });
      await expect(tryRegister(userData)).rejects.toEqual({
        error: "Użytkownik już istnieje.",
      });
    });

    test("handles 400 error with responseData.errors (validation errors)", async () => {
      const backendErrors = { email: "Invalid email from backend" };
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ errors: backendErrors }),
      });
      await expect(tryRegister(userData)).rejects.toEqual({
        errors: { email: "Invalid email from backend", translated: true },
      });
      expect(translateErrors).toHaveBeenCalledWith(backendErrors);
    });

    test("handles 400 error with unknown validation error structure", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ someOtherError: "details" }),
      });
      await expect(tryRegister(userData)).rejects.toEqual({
        error: "Nieznany błąd walidacji.",
      });
    });

    test("handles 500 server error", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal Server Error" }),
      });
      await expect(tryRegister(userData)).rejects.toEqual({
        error: "Błąd serwera.",
      });
    });

    test("handles other non-ok responses", async () => {
      const mockErrorData = { detail: "Some other error" };
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => mockErrorData,
      });
      await expect(tryRegister(userData)).rejects.toEqual(mockErrorData);
    });
  });
});
