import {
  getAllMyReservations,
  createReservation,
  deleteReservationById,
} from "../reservation";
import * as auth from "../auth";

global.fetch = jest.fn();

jest.mock("../auth", () => {
  // Using the same smart mock for getAuthHeaders as in comment.test.js
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

describe("Reservation Service", () => {
  const API_BASE_URL = "/api/reservations";

  beforeEach(() => {
    fetch.mockClear();
    auth.handleResponse.mockClear();
    auth.getAuthHeaders.mockClear();
  });

  describe("getAllMyReservations", () => {
    test("fetches all reservations for the current user successfully", async () => {
      const mockReservations = [{ id: "r1", event_id: "e1", user_id: "u1" }];
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockReservations);

      const result = await getAllMyReservations();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/`, {
        headers: { Authorization: "bearer testtoken" }, // Expects only Auth header
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(false); // includeContentTypeJson = false
      expect(auth.handleResponse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockReservations);
    });

    test("handles error when fetching reservations fails", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      auth.handleResponse.mockRejectedValueOnce(new Error("Server Error"));

      await expect(getAllMyReservations()).rejects.toThrow("Server Error");
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/`,
        expect.any(Object)
      );
    });
  });

  describe("createReservation", () => {
    test("creates a new reservation successfully", async () => {
      const reservationData = {
        event_id: "e1",
        user_id: "u1",
        status: "confirmed",
      };
      const mockCreatedReservation = { id: "r2", ...reservationData };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockCreatedReservation);

      const result = await createReservation(reservationData);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bearer testtoken",
        },
        body: JSON.stringify(reservationData),
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(); // Default true
      expect(result).toEqual(mockCreatedReservation);
    });

    test("handles error when creating a reservation fails", async () => {
      const reservationData = {
        event_id: "e1",
        user_id: "u1",
        status: "confirmed",
      };
      fetch.mockResolvedValueOnce({ ok: false, status: 400 });
      auth.handleResponse.mockRejectedValueOnce(new Error("Creation failed"));

      await expect(createReservation(reservationData)).rejects.toThrow(
        "Creation failed"
      );
    });
  });

  describe("deleteReservationById", () => {
    test("deletes a reservation by ID successfully", async () => {
      const reservationId = "r1";
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce({
        message: "Reservation deleted",
      });

      await deleteReservationById(reservationId);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/${reservationId}`, {
        method: "DELETE",
        headers: { Authorization: "bearer testtoken" }, // Expects only Auth header
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(false); // includeContentTypeJson = false
    });

    test("handles error when deleting a reservation fails", async () => {
      const reservationId = "r1";
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      auth.handleResponse.mockRejectedValueOnce(
        new Error("Deletion server error")
      );

      await expect(deleteReservationById(reservationId)).rejects.toThrow(
        "Deletion server error"
      );
    });
  });
});
