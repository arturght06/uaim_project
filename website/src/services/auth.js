/**
 * Handles API responses, parsing JSON and throwing errors for non-ok statuses.
 */
export const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  let data;

  try {
    data = isJson ? await response.json() : await response.text();
  } catch {
    // If response.json() fails
    // but response was otherwise ok
    if (response.ok) return null;
    data = response.statusText || "Failed to parse server response.";
  }

  if (!response.ok) {
    let errorMessage = "An unknown error occurred.";
    if (data) {
      if (typeof data === "string") {
        errorMessage = data;
      } else if (data.error) {
        // { "error": "..." }
        errorMessage = data.error;
      } else if (data.message) {
        // { "message": "..." }
        errorMessage = data.message;
      } else if (data.errors && typeof data.errors === "object") {
        // { "errors": { field: "msg" } }
        const firstFieldError = Object.values(data.errors)[0];
        errorMessage =
          typeof firstFieldError === "string"
            ? firstFieldError
            : "Validation failed. Please check the fields.";
      } else {
        try {
          errorMessage = JSON.stringify(data);
        } catch {
          // data might not be stringifiable
        }
      }
    }

    const error = new Error(errorMessage);
    error.data = data; // Attach the full parsed error data
    error.status = response.status;
    if (data && data.errors && typeof data.errors === "object") {
      error.serverErrors = data.errors; // Field-specific errors
      error.isValidationError = true;
    }
    throw error;
  }
  return data; // Return parsed data on success
};

/**
 * Returns a headers object headers for authenticated requests.
 */
export const getAuthHeaders = (includeContentTypeJson = true) => {
  const headers = {};
  const token = localStorage.getItem("accessToken");

  if (token) {
    headers["Authorization"] = `bearer ${token}`;
  }
  if (includeContentTypeJson) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};
