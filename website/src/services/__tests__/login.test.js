import { validateClientSide, tryLogin, logout } from "../login";

global.fetch = jest.fn();

describe("Login Service", () => {
  const originalLocalStorage = global.localStorage;
  let mockLocalStorageStore;

  // Define the mock functions once
  const mockGetItem = jest.fn((key) => mockLocalStorageStore[key] || null);
  const mockSetItem = jest.fn((key, value) => {
    mockLocalStorageStore[key] = value.toString();
  });
  const mockRemoveItem = jest.fn((key) => {
    delete mockLocalStorageStore[key];
  });
  const mockClear = jest.fn(() => {
    mockLocalStorageStore = {};
  });

  beforeAll(() => {
    mockLocalStorageStore = {}; // Initialize the store
    global.localStorage = {
      getItem: mockGetItem,
      setItem: mockSetItem,
      removeItem: mockRemoveItem,
      clear: mockClear,
    };
  });

  beforeEach(() => {
    fetch.mockClear();
    // Clear the store and the call history of the mock functions
    mockClear(); // This will reset mockLocalStorageStore
    mockGetItem.mockClear();
    mockSetItem.mockClear();
    mockRemoveItem.mockClear();
  });

  afterAll(() => {
    global.localStorage = originalLocalStorage;
  });

  describe("validateClientSide", () => {
    test("should not throw error for valid data", () => {
      expect(() =>
        validateClientSide({ login: "user", password: "pass" })
      ).not.toThrow();
    });

    test("should throw error if login is empty", () => {
      try {
        validateClientSide({ login: " ", password: "pass" });
      } catch (e) {
        expect(e.login).toBe("Email lub nazwa użytkownika jest wymagana.");
      }
    });

    test("should throw error if password is empty", () => {
      try {
        validateClientSide({ login: "user", password: "" });
      } catch (e) {
        expect(e.password).toBe("Hasło jest wymagane.");
      }
    });

    test("should throw error if both are empty", () => {
      try {
        validateClientSide({ login: "", password: "" });
      } catch (e) {
        expect(e.login).toBe("Email lub nazwa użytkownika jest wymagana.");
        expect(e.password).toBe("Hasło jest wymagane.");
      }
    });
  });

  describe("tryLogin", () => {
    const loginData = { login: "testuser", password: "password123" };
    const mockUser = { id: "user123", name: "Test User" };
    const mockTokens = { access_token: "abc", refresh_token: "xyz" };

    test('should throw "Niepoprawne dane." for non-500 error responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Invalid credentials" }),
      });
      await expect(tryLogin(loginData)).rejects.toBe("Niepoprawne dane.");
    });

    test('should throw "Błąd serwera." for 500 error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Server down" }),
      });
      await expect(tryLogin(loginData)).rejects.toBe("Błąd serwera.");
    });

    test('should throw "Błąd logowania: Nieprawidłowa odpowiedź serwera." if response success is false', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, message: "Logical error" }),
      });
      await expect(tryLogin(loginData)).rejects.toBe(
        "Błąd logowania: Nieprawidłowa odpowiedź serwera."
      );
    });

    test('should throw "Błąd logowania: Nieprawidłowa odpowiedź serwera." if tokens are missing', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser }),
      });
      await expect(tryLogin(loginData)).rejects.toBe(
        "Błąd logowania: Nieprawidłowa odpowiedź serwera."
      );
    });

    test('should throw "Błąd logowania: Nieprawidłowa odpowiedź serwera." if user is missing', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, tokens: mockTokens }),
      });
      await expect(tryLogin(loginData)).rejects.toBe(
        "Błąd logowania: Nieprawidłowa odpowiedź serwera."
      );
    });
  });
});
