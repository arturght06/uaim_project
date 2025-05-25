import { getAuthHeaders, handleResponse } from "./auth";
import { translateErrors } from "./translate";

const API_BASE_URL_USERS = "/users";

/**
 * Attempts to get a user's information.
 */
export const getUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL_USERS}/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

/**
 * Attempts to get a user's name (doesn't require authentication).
 */
export const getUserName = async (userId) => {
  const response = await fetch(`${API_BASE_URL_USERS}/name/${userId}`, {
    method: "GET",
  });
  return handleResponse(response);
};

/**
 * Updates a user's data.
 */
export const updateUser = async (userId, userData) => {
  const response = await fetch(`${API_BASE_URL_USERS}/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  const responseData = await response.json();

  if (!response.ok) {
    if (response.status === 409) {
      if (responseData.error) {
        throw { error: "Użytkownik już istnieje." };
      } else if (responseData.errors) {
        throw { errors: translateErrors(responseData.errors) };
      } else {
        throw { error: "Nieznany błąd walidacji." };
      }
    } else if (response.status === 500) {
      throw { error: "Błąd serwera." };
    } else {
      throw responseData;
    }
  }
};
