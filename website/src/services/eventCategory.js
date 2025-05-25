import { handleResponse, getAuthHeaders } from "./auth";

const API_BASE_URL = "/api/event-category"; // Vite proxy path

/**
 * Creates a relationship between an event and a category.
 */
export const linkEventToCategory = async (relationData) => {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(relationData),
  });
  return handleResponse(response);
};

/**
 * Deletes a relationship between an event and a category by relation ID.
 */
export const unlinkEventFromCategory = async (relationId) => {
  const response = await fetch(`${API_BASE_URL}/${relationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(false),
  });
  return handleResponse(response);
};

/**
 * Fetches all event-category relationships.
 */
export const getAllEventCategoryRelations = async () => {
  // Backend GET /api/event-category/ doesn't show @token_required
  const response = await fetch(`${API_BASE_URL}/`);
  return handleResponse(response);
};
