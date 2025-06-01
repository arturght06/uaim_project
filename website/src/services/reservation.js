import { handleResponse, getAuthHeaders } from "./auth";

const API_BASE_URL = "/api/reservations";

/**
 * Fetches all reservations.
 * NOTE: The backend endpoint GET /api/reservations/ currently doesn't filter by user.
 */
export const getAllMyReservations = async () => {
  const response = await fetch(`${API_BASE_URL}/`, {
    headers: getAuthHeaders(false),
  });
  return handleResponse(response);
};

/**
 * Creates a new reservation.
 */
export const createReservation = async (reservationData) => {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(reservationData),
  });
  return handleResponse(response);
};

/**
 * Deletes a reservation by its ID.
 */
export const deleteReservationById = async (reservationId) => {
  const response = await fetch(`${API_BASE_URL}/${reservationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(false),
  });
  return handleResponse(response);
};
