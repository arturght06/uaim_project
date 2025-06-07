import {
  getUserNotificationsById,
  createNotification,
  updateNotification,
  deleteNotification,
  sendReminderNotification,
  markNotificationAsSeen,
} from "../notification";
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

describe("Notification Service", () => {
  const API_BASE_URL = "/api/notifications";

  beforeEach(() => {
    fetch.mockClear();
    auth.handleResponse.mockClear();
    auth.getAuthHeaders.mockClear();
  });

  describe("getUserNotificationsById", () => {
    test("fetches notifications for a specific user successfully", async () => {
      const userId = "user123";
      const mockNotifications = [{ id: "n1", title: "Reminder" }];
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockNotifications);

      const result = await getUserNotificationsById(userId);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/user/${userId}`, {
        headers: { Authorization: "bearer testtoken" },
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(false);
      expect(result).toEqual(mockNotifications);
    });
  });

  describe("createNotification", () => {
    test("creates a new notification successfully", async () => {
      const notificationData = {
        user_id: "u1",
        title: "New Event",
        content: "Check it out",
      };
      const mockCreatedNotification = { id: "n2", ...notificationData };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockCreatedNotification);

      const result = await createNotification(notificationData);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bearer testtoken",
        },
        body: JSON.stringify(notificationData),
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith();
      expect(result).toEqual(mockCreatedNotification);
    });
  });

  describe("updateNotification", () => {
    test("updates an existing notification successfully", async () => {
      const notificationId = "n1";
      const notificationData = { title: "Updated Reminder", status: "seen" };
      const mockUpdatedNotification = {
        id: notificationId,
        ...notificationData,
      };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockUpdatedNotification);

      const result = await updateNotification(notificationId, notificationData);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bearer testtoken",
        },
        body: JSON.stringify(notificationData),
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith();
      expect(result).toEqual(mockUpdatedNotification);
    });
  });

  describe("deleteNotification", () => {
    test("deletes a notification successfully", async () => {
      const notificationId = "n1";
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce({
        message: "Notification deleted",
      });

      await deleteNotification(notificationId);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: "bearer testtoken" },
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(false);
    });
  });

  describe("sendReminderNotification", () => {
    test("sends a reminder notification successfully", async () => {
      const reminderData = { event_id: "e1", user_id: "u1", type: "email" };
      const mockResponse = { message: "Reminder sent" };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockResponse);

      const result = await sendReminderNotification(reminderData);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bearer testtoken",
        },
        body: JSON.stringify(reminderData),
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("markNotificationAsSeen", () => {
    test("marks a notification as seen successfully", async () => {
      const notificationId = "n1";
      const mockResponse = { id: notificationId, status: "seen" };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockResponse);

      const result = await markNotificationAsSeen(notificationId);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/${notificationId}/seen`,
        {
          method: "PUT",
          headers: {
            // Should include Content-Type by default as per getAuthHeaders()
            "Content-Type": "application/json",
            Authorization: "bearer testtoken",
          },
          // Body might be empty for this specific PUT, or backend might not require it.
          // If it's strictly no body, getAuthHeaders(false) would be used.
          // Assuming the service was written to use getAuthHeaders() default.
        }
      );
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(); // Default is true
      expect(result).toEqual(mockResponse);
    });

    test("markNotificationAsSeen calls getAuthHeaders without false if intended to send content-type", async () => {
      const notificationId = "n1";
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce({
        id: notificationId,
        status: "seen",
      });

      await markNotificationAsSeen(notificationId);
      // Check the actual call to the mock
      // The service `markNotificationAsSeen` calls `getAuthHeaders()` without an argument,
      // so our mock for `getAuthHeaders` will use its default `includeContentTypeJson = true`.
      expect(auth.getAuthHeaders.mock.calls[0][0]).toBeUndefined(); // Or .toBe(true) if default is explicit
      expect(fetch.mock.calls[0][1].headers).toHaveProperty(
        "Content-Type",
        "application/json"
      );
    });
  });
});
