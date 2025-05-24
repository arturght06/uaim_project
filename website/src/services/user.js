import { getAuthHeaders } from "./auth";

/**
 * Attempts to get a user's information.
 * Returns null if unsuccessful
 */
export const getUser = async (userId) => {
  const response = await fetch(`/users/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const responseData = await response.json();
  // Success
  if (response.ok) {
    return responseData;
  }
  return null;
};

/**
 * Attempts to get a user's name (doesn't require authentication).
 * Returns null if unsuccessful
 */
export const getUserName = async (userId) => {
  const response = await fetch(`/users/name/${userId}`, {
    method: "GET",
  });
  const responseData = await response.json();
  // Success
  if (response.ok) {
    return responseData;
  }
  return null;
};
