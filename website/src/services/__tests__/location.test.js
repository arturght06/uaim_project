import {
  getAllLocations,
  getUserLocations,
  getLocationById,
  createNewLocation,
  removeLocation,
} from "../location";
import * as auth from "../auth";

global.fetch = jest.fn();

jest.mock("../auth", () => {
  const originalAuth = jest.requireActual("../auth");
  return {
    ...originalAuth,
    handleResponse: jest.fn(),
    getAuthHeaders: jest.fn((includeContentTypeJson = true) => {
      const headers = {
        Authorization: "bearer testtoken",
      };
      if (includeContentTypeJson) {
        headers["Content-Type"] = "application/json";
      }
      return headers;
    }),
  };
});

describe("Location Service", () => {
  const API_BASE_URL = "/api/location";

  beforeEach(() => {
    fetch.mockClear();
    auth.handleResponse.mockClear();
    auth.getAuthHeaders.mockClear();
  });

  describe("getAllLocations", () => {
    test("fetches all locations successfully", async () => {
      const mockLocations = [{ id: "loc1", name: "Main Hall" }];
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockLocations);

      const result = await getAllLocations();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/`);
      expect(auth.handleResponse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockLocations);
    });

    test("handles error when fetching all locations fails", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      auth.handleResponse.mockRejectedValueOnce(new Error("Server Error"));

      await expect(getAllLocations()).rejects.toThrow("Server Error");
    });
  });

  describe("getUserLocations", () => {
    test("fetches locations for a specific user successfully", async () => {
      const userId = "user123";
      const mockUserLocations = [
        { id: "loc2", name: "User Spot", user_id: userId },
      ];
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockUserLocations);

      const result = await getUserLocations(userId);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/user/${userId}`);
      expect(auth.handleResponse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserLocations);
    });
  });

  describe("getLocationById", () => {
    test("fetches a single location by its ID successfully", async () => {
      const locationId = "loc1";
      const mockLocation = { id: locationId, name: "Main Hall Detail" };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockLocation);

      const result = await getLocationById(locationId);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/${locationId}`);
      expect(auth.handleResponse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockLocation);
    });
  });

  describe("createNewLocation", () => {
    test("creates a new location successfully", async () => {
      const locationData = { name: "New Venue", address: "123 New St" };
      const mockCreatedLocation = { id: "loc3", ...locationData };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockCreatedLocation);

      const result = await createNewLocation(locationData);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bearer testtoken",
        },
        body: JSON.stringify(locationData),
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(); // Default true
      expect(result).toEqual(mockCreatedLocation);
    });
  });

  describe("removeLocation", () => {
    test("deletes a location by its ID successfully", async () => {
      const locationId = "loc1";
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce({
        message: "Location deleted",
      });

      await removeLocation(locationId);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/${locationId}`, {
        method: "DELETE",
        headers: { Authorization: "bearer testtoken" },
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(false); // No content type
    });
  });
});
