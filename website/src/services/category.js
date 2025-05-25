import { handleResponse, getAuthHeaders } from "./auth";

const API_BASE_URL = "/api/category";

/**
 * Fetches all categories.
 */
export const getAllCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/`);
  return handleResponse(response);
};

/**
 * Creates a new category.
 */
export const createCategory = async (categoryData) => {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData),
  });
  return handleResponse(response);
};

/**
 * Deletes a category by its ID.
 */
export const deleteCategory = async (categoryId) => {
  const response = await fetch(`${API_BASE_URL}/${categoryId}`, {
    method: "DELETE",
    headers: getAuthHeaders(false),
  });
  return handleResponse(response);
};
