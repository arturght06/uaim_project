import { handleResponse, getAuthHeaders } from "./auth";

const API_BASE_URL = "/api/comments";

/**
 * Fetches all comments for a specific event.
 */
export const getCommentsByEventId = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/${eventId}`);
  return handleResponse(response);
};

/**
 * Creates a new comment.
 */
export const createComment = async (commentData) => {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(commentData),
  });
  return handleResponse(response);
};

/**
 * Updates an existing comment by its ID.
 */
export const updateComment = async (commentId, updatedData) => {
  const response = await fetch(`${API_BASE_URL}/${commentId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedData),
  });
  return handleResponse(response);
};

/**
 * Deletes a comment by its ID.
 */
export const deleteComment = async (commentId) => {
  const response = await fetch(`${API_BASE_URL}/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(false),
  });
  return handleResponse(response);
};
