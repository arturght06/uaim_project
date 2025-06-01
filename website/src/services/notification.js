import { handleResponse, getAuthHeaders } from "./auth";

const API_BASE_URL = "/api/notifications";

/**
 * Fetches notifications for a specific user by their ID.
 */
export const getUserNotificationsById = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    headers: getAuthHeaders(false),
  });
  return handleResponse(response);
};

/**
 * Creates a new notification.
 */
export const createNotification = async (notificationData) => {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(notificationData),
  });
  return handleResponse(response);
};

/**
 * Updates an existing notification.
 */
export const updateNotification = async (notificationId, notificationData) => {
  const response = await fetch(`${API_BASE_URL}/${notificationId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(notificationData),
  });
  return handleResponse(response);
};

/**
 * Deletes a notification by its ID.
 */
export const deleteNotification = async (notificationId) => {
  const response = await fetch(`${API_BASE_URL}/${notificationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(false),
  });
  return handleResponse(response);
};

/**
 * Sends an email reminder.
 */
export const sendReminderNotification = async (reminderData) => {
  const response = await fetch(`${API_BASE_URL}/reminder`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(reminderData),
  });
  return handleResponse(response);
};

/**
 * Marks a notification as seen.
 */
export const markNotificationAsSeen = async (notificationId) => {
  const response = await fetch(`${API_BASE_URL}/${notificationId}/seen`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
