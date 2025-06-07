import {
  getAllEvents,
  getUserEvents,
  getCategoryEvents,
  getEventById,
  createNewEvent,
  updateEvent,
  removeEvent,
} from "../events";
import * as auth from "../auth";

global.fetch = jest.fn();

jest.mock("../auth", () => {
  const originalAuth = jest.requireActual("../auth");
  return {
    ...originalAuth,
    handleResponse: jest.fn(),
    getAuthHeaders: jest.fn((includeContentTypeJson = true) => {
      const headers = { Authorization: "bearer testtoken" };
      if (includeContentTypeJson) {
        headers["Content-Type"] = "application/json";
      }
      return headers;
    }),
    getUserHeaders: jest.fn(() => ({ Useruuid: "test-user-uuid" })),
  };
});

describe("Events Service", () => {
  const API_BASE_URL = "/api/events";
  const mockEvent = { id: "e1", title: "Test Event" };
  const mockEventsArray = [mockEvent, { id: "e2", title: "Another Event" }];

  beforeEach(() => {
    fetch.mockClear();
    auth.handleResponse.mockClear();
    auth.getAuthHeaders.mockClear();
    auth.getUserHeaders.mockClear();
  });

  describe("getAllEvents", () => {
    test("fetches all events successfully with user headers", async () => {
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockEventsArray);

      const result = await getAllEvents();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/`, {
        headers: { Useruuid: "test-user-uuid" },
      });
      expect(auth.getUserHeaders).toHaveBeenCalledTimes(1);
      expect(auth.handleResponse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEventsArray);
    });
  });

  describe("getUserEvents", () => {
    test("fetches events for a specific user successfully with user headers", async () => {
      const userId = "user123";
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockEventsArray);

      const result = await getUserEvents(userId);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/user/${userId}`, {
        headers: { Useruuid: "test-user-uuid" },
      });
      expect(auth.getUserHeaders).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEventsArray);
    });
  });

  describe("getCategoryEvents", () => {
    test("fetches events for a specific category successfully with user headers", async () => {
      const categoryId = "cat1";
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockEventsArray);

      const result = await getCategoryEvents(categoryId);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/category/${categoryId}`,
        {
          headers: { Useruuid: "test-user-uuid" },
        }
      );
      expect(auth.getUserHeaders).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockEventsArray);
    });
  });

  describe("getEventById", () => {
    test("fetches a single event by ID successfully", async () => {
      const eventId = "e1";
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockEvent);

      const result = await getEventById(eventId);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/${eventId}`);
      // No specific headers like auth or useruuid are sent for public getEventById
      expect(auth.getUserHeaders).not.toHaveBeenCalled();
      expect(auth.getAuthHeaders).not.toHaveBeenCalled();
      expect(result).toEqual(mockEvent);
    });
  });

  describe("createNewEvent", () => {
    test("creates a new event successfully", async () => {
      const eventData = { title: "New Concert", description: "Music festival" };
      const mockCreatedEvent = { id: "e3", ...eventData };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockCreatedEvent);
      const consoleLogSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const result = await createNewEvent(eventData);

      expect(consoleLogSpy).toHaveBeenCalledWith(eventData);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/`, {
        method: "POST",
        headers: {
          Authorization: "bearer testtoken",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith();
      expect(result).toEqual(mockCreatedEvent);
      consoleLogSpy.mockRestore();
    });
  });

  describe("updateEvent", () => {
    test("updates an event successfully", async () => {
      const eventDataToUpdate = { id: "e1", title: "Updated Event Title" };
      const mockUpdatedEvent = { ...eventDataToUpdate };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockUpdatedEvent);

      const result = await updateEvent(eventDataToUpdate);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/${eventDataToUpdate.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: "bearer testtoken",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventDataToUpdate),
        }
      );
      expect(auth.getAuthHeaders).toHaveBeenCalledWith();
      expect(result).toEqual(mockUpdatedEvent);
    });
  });

  describe("removeEvent", () => {
    test("deletes an event successfully", async () => {
      const eventId = "e1";
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce({ message: "Event deleted" });

      await removeEvent(eventId);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: "bearer testtoken" },
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(false);
    });
  });

  // Generic error handling test for one of the GET methods
  test("getAllEvents handles fetch error", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    auth.handleResponse.mockRejectedValueOnce(new Error("Server Error"));
    await expect(getAllEvents()).rejects.toThrow("Server Error");
  });
});
