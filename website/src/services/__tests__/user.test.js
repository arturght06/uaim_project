import { getUser, getUserName, updateUser } from "../user";
import * as auth from "../auth";
import * as translate from "../translate";

global.fetch = jest.fn();

// Mock auth.js for getAuthHeaders and handleResponse (for GET requests)
jest.mock("../auth", () => {
  const originalAuth = jest.requireActual("../auth");
  return {
    ...originalAuth,
    handleResponse: jest.fn(), // Used by getUser and getUserName
    getAuthHeaders: jest.fn((includeContentTypeJson = true) => {
      const headers = { Authorization: "bearer testtoken" };
      if (includeContentTypeJson) {
        headers["Content-Type"] = "application/json";
      }
      return headers;
    }),
  };
});

// Mock translate.js for updateUser's error translation
jest.mock("../translate", () => ({
  translateErrors: jest.fn((errors) => ({ ...errors, translated: true })),
}));

describe("User Service", () => {
  const API_BASE_URL_USERS = "/users";
  const mockUserId = "user123";

  beforeEach(() => {
    fetch.mockClear();
    auth.handleResponse.mockClear();
    auth.getAuthHeaders.mockClear();
    translate.translateErrors.mockClear();
  });

  describe("getUser", () => {
    test("fetches user data successfully", async () => {
      const mockUserData = { id: mockUserId, name: "Test User" };
      fetch.mockResolvedValueOnce({ ok: true }); // Assume handleResponse will be called
      auth.handleResponse.mockResolvedValueOnce(mockUserData);

      const result = await getUser(mockUserId);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL_USERS}/${mockUserId}`,
        {
          method: "GET",
          headers: {
            Authorization: "bearer testtoken",
            "Content-Type": "application/json",
          },
        }
      );
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(); // Default true
      expect(auth.handleResponse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserData);
    });

    test("handles error when fetching user data fails", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 404 });
      auth.handleResponse.mockRejectedValueOnce(new Error("User not found"));

      await expect(getUser(mockUserId)).rejects.toThrow("User not found");
    });
  });

  describe("getUserName", () => {
    test("fetches user name successfully", async () => {
      const mockUserNameData = { name: "Test User" };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockUserNameData);

      const result = await getUserName(mockUserId);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL_USERS}/name/${mockUserId}`,
        {
          method: "GET",
          // No auth headers expected for this endpoint based on service code
        }
      );
      // getAuthHeaders should NOT be called for getUserName
      expect(auth.getAuthHeaders).not.toHaveBeenCalled();
      expect(auth.handleResponse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserNameData);
    });
  });

  describe("updateUser", () => {
    const userDataToUpdate = { name: "Updated Name" };

    test("updates user data successfully", async () => {
      const mockSuccessResponse = { id: mockUserId, ...userDataToUpdate }; // Assuming backend returns updated user
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse, // updateUser parses JSON directly
      });

      // updateUser doesn't directly return the data in this implementation, it relies on response.ok
      await expect(
        updateUser(mockUserId, userDataToUpdate)
      ).resolves.toBeUndefined(); // or check for specific response if it returned one

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL_USERS}/${mockUserId}`,
        {
          method: "PUT",
          headers: {
            Authorization: "bearer testtoken",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userDataToUpdate),
        }
      );
      expect(auth.getAuthHeaders).toHaveBeenCalledWith();
    });

    test("throws translated error for 409 conflict (user exists type error)", async () => {
      const backendError = { error: "Username already taken" }; // Example error from backend
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => backendError,
      });

      await expect(updateUser(mockUserId, userDataToUpdate)).rejects.toEqual({
        error: "Użytkownik już istnieje.",
      });
      expect(translate.translateErrors).not.toHaveBeenCalled(); // Should not call translate for this specific error message
    });

    test("throws translated error for 409 conflict (validation errors)", async () => {
      const backendValidationErrors = {
        errors: { email: "Email format invalid" },
      };
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => backendValidationErrors,
      });

      await expect(updateUser(mockUserId, userDataToUpdate)).rejects.toEqual({
        errors: { email: "Email format invalid", translated: true },
      });
      expect(translate.translateErrors).toHaveBeenCalledWith(
        backendValidationErrors.errors
      );
    });

    test("throws translated error for 409 conflict (unknown validation error structure)", async () => {
      const backendError = { someOtherField: "some issue" };
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => backendError,
      });
      await expect(updateUser(mockUserId, userDataToUpdate)).rejects.toEqual({
        error: "Nieznany błąd walidacji.",
      });
    });

    test("throws server error for 500 status", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal server error" }),
      });

      await expect(updateUser(mockUserId, userDataToUpdate)).rejects.toEqual({
        error: "Błąd serwera.",
      });
    });

    test("throws response data for other non-ok statuses", async () => {
      const otherErrorData = { detail: "Permission denied" };
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => otherErrorData,
      });

      await expect(updateUser(mockUserId, userDataToUpdate)).rejects.toEqual(
        otherErrorData
      );
    });
  });
});
