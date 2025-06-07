import {
  linkEventToCategory,
  unlinkEventFromCategory,
  getAllEventCategoryRelations,
} from "../eventCategory";
import * as auth from "../auth";

global.fetch = jest.fn();

jest.mock("../auth", () => ({
  handleResponse: jest.fn(),
  getAuthHeaders: jest.fn(() => ({
    "Content-Type": "application/json",
    Authorization: "bearer testtoken",
  })),
}));

describe("EventCategory Service", () => {
  const API_BASE_URL = "/api/event-category";

  beforeEach(() => {
    fetch.mockClear();
    auth.handleResponse.mockClear();
    auth.getAuthHeaders.mockClear();
  });

  describe("linkEventToCategory", () => {
    test("links an event to a category successfully", async () => {
      const relationData = { event_id: "e1", category_id: "c1" };
      const mockCreatedRelation = { id: "ec1", ...relationData };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockCreatedRelation);

      const result = await linkEventToCategory(relationData);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "bearer testtoken",
        },
        body: JSON.stringify(relationData),
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(); // Default true for content type
      expect(result).toEqual(mockCreatedRelation);
    });

    test("handles error when linking event to category fails", async () => {
      const relationData = { event_id: "e1", category_id: "c1" };
      fetch.mockResolvedValueOnce({ ok: false, status: 400 });
      auth.handleResponse.mockRejectedValueOnce(new Error("Link failed"));

      await expect(linkEventToCategory(relationData)).rejects.toThrow(
        "Link failed"
      );
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/`,
        expect.any(Object)
      );
    });
  });

  describe("getAllEventCategoryRelations", () => {
    test("fetches all event-category relations successfully", async () => {
      const mockRelations = [
        { id: "ec1", event_id: "e1", category_id: "c1" },
        { id: "ec2", event_id: "e2", category_id: "c2" },
      ];
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockRelations);

      const result = await getAllEventCategoryRelations();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/`);
      expect(auth.handleResponse).toHaveBeenCalledTimes(1);
      // getAuthHeaders should NOT be called for this specific endpoint as per component comment
      expect(auth.getAuthHeaders).not.toHaveBeenCalled();
      expect(result).toEqual(mockRelations);
    });

    test("handles error when fetching all event-category relations fails", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      auth.handleResponse.mockRejectedValueOnce(
        new Error("Fetch all relations error")
      );

      await expect(getAllEventCategoryRelations()).rejects.toThrow(
        "Fetch all relations error"
      );
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/`);
    });
  });
});
