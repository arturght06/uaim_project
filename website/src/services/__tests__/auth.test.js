import { handleResponse, getAuthHeaders, getUserHeaders } from "../auth";

global.fetch = jest.fn(); // Though not directly used by these utils, good for consistency if other tests import this

describe("Auth Service Utilities", () => {
  describe("handleResponse", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should return parsed JSON for a successful JSON response", async () => {
      const mockData = { id: 1, name: "Test" };
      const mockResponse = {
        ok: true,
        headers: { get: jest.fn(() => "application/json") },
        json: jest.fn().mockResolvedValue(mockData),
        text: jest.fn(),
      };
      const result = await handleResponse(mockResponse);
      expect(result).toEqual(mockData);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.text).not.toHaveBeenCalled();
    });

    test("should return text for a successful non-JSON response", async () => {
      const mockText = "Success";
      const mockResponse = {
        ok: true,
        headers: { get: jest.fn(() => "text/plain") },
        json: jest.fn(),
        text: jest.fn().mockResolvedValue(mockText),
      };
      const result = await handleResponse(mockResponse);
      expect(result).toBe(mockText);
      expect(mockResponse.text).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    test("should return null if response.ok but response.json() fails (e.g. empty body but content-type json)", async () => {
      const mockResponse = {
        ok: true,
        headers: { get: jest.fn(() => "application/json") },
        json: jest.fn().mockRejectedValue(new Error("Parse error")), // Simulate parsing failure
        text: jest.fn().mockResolvedValue(""), // Text might resolve to empty
      };
      const result = await handleResponse(mockResponse);
      expect(result).toBeNull();
    });

    test("should throw error with data.error for a failed JSON response", async () => {
      const errorData = { error: "Specific error message" };
      const mockResponse = {
        ok: false,
        status: 400,
        headers: { get: jest.fn(() => "application/json") },
        json: jest.fn().mockResolvedValue(errorData),
      };
      try {
        await handleResponse(mockResponse);
      } catch (e) {
        expect(e.message).toBe("Specific error message");
        expect(e.data).toEqual(errorData);
        expect(e.status).toBe(400);
      }
    });

    test("should throw error with data.message for a failed JSON response", async () => {
      const errorData = { message: "Another specific message" };
      const mockResponse = {
        ok: false,
        status: 401,
        headers: { get: jest.fn(() => "application/json") },
        json: jest.fn().mockResolvedValue(errorData),
      };
      await expect(handleResponse(mockResponse)).rejects.toMatchObject({
        message: "Another specific message",
        data: errorData,
        status: 401,
      });
    });

    test("should throw error with first field error from data.errors", async () => {
      const errorData = {
        errors: { field1: "Field1 error", field2: "Field2 error" },
      };
      const mockResponse = {
        ok: false,
        status: 422,
        headers: { get: jest.fn(() => "application/json") },
        json: jest.fn().mockResolvedValue(errorData),
      };
      try {
        await handleResponse(mockResponse);
      } catch (e) {
        expect(e.message).toBe("Field1 error");
        expect(e.data).toEqual(errorData);
        expect(e.status).toBe(422);
        expect(e.serverErrors).toEqual(errorData.errors);
        expect(e.isValidationError).toBe(true);
      }
    });

    test("should throw error with default message for non-string first field error", async () => {
      const errorData = { errors: { field1: { code: "invalid" } } };
      const mockResponse = {
        ok: false,
        status: 422,
        headers: { get: jest.fn(() => "application/json") },
        json: jest.fn().mockResolvedValue(errorData),
      };
      await expect(handleResponse(mockResponse)).rejects.toMatchObject({
        message: "Validation failed. Please check the fields.",
        serverErrors: errorData.errors,
        isValidationError: true,
      });
    });

    test("should throw error with stringified data if no specific error field found", async () => {
      const errorData = { detail: "Some detail about the error" };
      const mockResponse = {
        ok: false,
        status: 500,
        headers: { get: jest.fn(() => "application/json") },
        json: jest.fn().mockResolvedValue(errorData),
      };
      await expect(handleResponse(mockResponse)).rejects.toMatchObject({
        message: JSON.stringify(errorData),
        data: errorData,
      });
    });

    test("should throw error with response.statusText if parsing data fails for a non-ok response", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error Text",
        headers: { get: jest.fn(() => "application/json") }, // Say it's JSON but parsing fails
        json: jest.fn().mockRejectedValue(new Error("Parse error")),
        text: jest.fn().mockResolvedValue("Cannot parse this as text either"), // fallback for text
      };
      try {
        await handleResponse(mockResponse);
      } catch (e) {
        expect(e.message).toBe("Internal Server Error Text");
        expect(e.status).toBe(500);
        expect(e.data).toBe("Internal Server Error Text");
      }
    });

    test("should throw error with details if present", async () => {
      const errorData = { error: "Base error", details: "More details here" };
      const mockResponse = {
        ok: false,
        status: 400,
        headers: { get: () => "application/json" },
        json: async () => errorData,
      };
      await expect(handleResponse(mockResponse)).rejects.toMatchObject({
        message: "Base error More details here",
      });
    });

    test("should throw default message if data is not stringifiable in error path", async () => {
      const unstringifiableData = { a: BigInt(10) }; // BigInt is not stringifiable by JSON.stringify
      const mockResponse = {
        ok: false,
        status: 500,
        headers: { get: () => "application/json" },
        json: async () => unstringifiableData,
      };
      await expect(handleResponse(mockResponse)).rejects.toMatchObject({
        message: "An unknown error occurred.", // Falls back to this
      });
    });
  });

  describe("getAuthHeaders", () => {
    const mockToken = "test-access-token";

    beforeEach(() => {
      localStorage.clear();
    });

    test("should return only Authorization header if token exists and contentTypeJson is false", () => {
      localStorage.setItem("accessToken", mockToken);
      const headers = getAuthHeaders(false);
      expect(headers).toEqual({ Authorization: `bearer ${mockToken}` });
    });

    test("should return Authorization and Content-Type headers if token exists and contentTypeJson is true (default)", () => {
      localStorage.setItem("accessToken", mockToken);
      const headers = getAuthHeaders();
      expect(headers).toEqual({
        Authorization: `bearer ${mockToken}`,
        "Content-Type": "application/json",
      });
    });

    test("should return only Content-Type header if no token and contentTypeJson is true", () => {
      const headers = getAuthHeaders(true);
      expect(headers).toEqual({ "Content-Type": "application/json" });
    });

    test("should return empty object if no token and contentTypeJson is false", () => {
      const headers = getAuthHeaders(false);
      expect(headers).toEqual({});
    });
  });

  describe("getUserHeaders", () => {
    const mockUuid = "test-user-uuid";

    beforeEach(() => {
      localStorage.clear();
    });

    test("should return Useruuid header if userUUID exists in localStorage", () => {
      localStorage.setItem("userUUID", mockUuid);
      const headers = getUserHeaders();
      expect(headers).toEqual({ Useruuid: mockUuid });
    });

    test("should return empty object if userUUID does not exist in localStorage", () => {
      const headers = getUserHeaders();
      expect(headers).toEqual({});
    });
  });
});
