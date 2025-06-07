import { getAllCategories, createCategory, deleteCategory } from "../category";
import * as authService from "../auth"; // To mock handleResponse and getAuthHeaders

// Mock the global fetch
global.fetch = jest.fn();

// Mock authService functions
jest.mock("../auth", () => ({
  handleResponse: jest.fn(),
  getAuthHeaders: jest.fn(() => ({
    Authorization: "bearer testtoken",
    "Content-Type": "application/json",
  })),
}));

describe("Category Service", () => {
  beforeEach(() => {
    fetch.mockClear();
    authService.handleResponse.mockClear();
    authService.getAuthHeaders.mockClear();
  });

  describe("getAllCategories", () => {
    test("fetches all categories successfully", async () => {
      const mockCategories = [{ id: "1", name: "Music" }];
      fetch.mockResolvedValueOnce({
        ok: true /* other response properties if needed */,
      }); // Mock the Response object
      authService.handleResponse.mockResolvedValueOnce(mockCategories); // Mock what handleResponse returns

      const result = await getAllCategories();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith("/api/category/");
      expect(authService.handleResponse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategories);
    });

    test("handles error when fetching categories", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      authService.handleResponse.mockRejectedValueOnce(
        new Error("Server Error")
      );

      await expect(getAllCategories()).rejects.toThrow("Server Error");

      expect(fetch).toHaveBeenCalledWith("/api/category/");
    });
  });

  describe("createCategory", () => {
    test("creates a new category successfully", async () => {
      const categoryData = { name: "New Category", description: "A new one" };
      const mockCreatedCategory = { id: "2", ...categoryData };

      fetch.mockResolvedValueOnce({ ok: true });
      authService.handleResponse.mockResolvedValueOnce(mockCreatedCategory);
      authService.getAuthHeaders.mockReturnValueOnce({
        Authorization: "bearer testtoken",
        "Content-Type": "application/json",
      });

      const result = await createCategory(categoryData);

      expect(fetch).toHaveBeenCalledWith("/api/category/", {
        method: "POST",
        headers: {
          Authorization: "bearer testtoken",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });
      expect(authService.getAuthHeaders).toHaveBeenCalledWith(); // Default true for content type
      expect(result).toEqual(mockCreatedCategory);
    });
  });

  describe("deleteCategory", () => {
    test("deletes a category successfully", async () => {
      const categoryId = "1";
      fetch.mockResolvedValueOnce({ ok: true });
      authService.handleResponse.mockResolvedValueOnce({ message: "Deleted" }); // Or whatever your API returns
      authService.getAuthHeaders.mockReturnValueOnce({
        Authorization: "bearer testtoken",
      });

      await deleteCategory(categoryId);

      expect(fetch).toHaveBeenCalledWith(`/api/category/${categoryId}`, {
        method: "DELETE",
        headers: { Authorization: "bearer testtoken" },
      });
      expect(authService.getAuthHeaders).toHaveBeenCalledWith(false); // includeContentTypeJson = false
    });
  });
});
