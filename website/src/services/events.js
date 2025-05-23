import { handleResponse, getAuthHeaders } from "./auth";

const API_BASE_URL = "/api/events";

/**
 * Fetches all events.
 */
export const getAllEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/`);
  return handleResponse(response);
};

/**
 * Fetches a single event by its ID.
 */
export const getEventById = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/${eventId}`);
  return handleResponse(response);
};

/**
 * Creates a new event.
 */
export const createNewEvent = async (eventData) => {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(eventData),
  });
  return handleResponse(response);
};

/**
 * Deletes an event by its ID.
 */
export const removeEvent = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/${eventId}`, {
    method: "DELETE",
    headers: getAuthHeaders(false),
  });
  return handleResponse(response);
};
