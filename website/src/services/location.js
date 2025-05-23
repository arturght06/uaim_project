import { handleResponse, getAuthHeaders } from "./auth";

const API_BASE_URL = "/api/location";

/**
 * Fetches all locations.
 */
export const getAllLocations = async () => {
  const response = await fetch(`${API_BASE_URL}/`);
  return handleResponse(response);
};

/**
 * Fetches a single location by its UUID.
 */
export const getLocationById = async (locationId) => {
  const response = await fetch(`${API_BASE_URL}/${locationId}`);
  return handleResponse(response);
};

/**
 * Creates a new location.
 */
export const createNewLocation = async (locationData) => {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(locationData),
  });
  return handleResponse(response);
};

/**
 * Deletes a location by its UUID.
 */
export const removeLocation = async (locationId) => {
  const response = await fetch(`${API_BASE_URL}/${locationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(false),
  });
  return handleResponse(response);
};
