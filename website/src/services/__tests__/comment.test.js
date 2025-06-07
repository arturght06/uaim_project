import {
  getCommentsByEventId,
  createComment,
  updateComment,
  deleteComment,
} from "../comment";
import * as auth from "../auth"; // To mock handleResponse and getAuthHeaders

// Mock the global fetch
global.fetch = jest.fn();

// Mock auth.js module
jest.mock("../auth", () => {
  const originalAuth = jest.requireActual("../auth"); // Get actual implementation for other functions if needed
  return {
    ...originalAuth, // Spread original module to keep other functions intact if any
    handleResponse: jest.fn(),
    getAuthHeaders: jest.fn((includeContentTypeJson = true) => {
      // Mock respects the argument
      const headers = {
        Authorization: "bearer testtoken",
      };
      if (includeContentTypeJson) {
        headers["Content-Type"] = "application/json";
      }
      return headers;
    }),
  };
});

describe("Comment Service", () => {
  const API_BASE_URL = "/api/comments";

  beforeEach(() => {
    fetch.mockClear();
    // Clear mocks for auth functions before each test
    auth.handleResponse.mockClear();
    auth.getAuthHeaders.mockClear();
  });

  describe("getCommentsByEventId", () => {
    test("fetches comments for a given event ID successfully", async () => {
      const eventId = "event123";
      const mockComments = [{ id: "c1", content: "Great event!" }];
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockComments);

      const result = await getCommentsByEventId(eventId);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/${eventId}`);
      expect(auth.handleResponse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockComments);
    });

    test("handles error when fetching comments fails", async () => {
      const eventId = "event123";
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      auth.handleResponse.mockRejectedValueOnce(new Error("Server Error"));

      await expect(getCommentsByEventId(eventId)).rejects.toThrow(
        "Server Error"
      );
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/${eventId}`);
    });
  });

  describe("createComment", () => {
    test("creates a new comment successfully", async () => {
      const commentData = {
        event_id: "e1",
        user_id: "u1",
        content: "New comment",
      };
      const mockCreatedComment = { id: "c2", ...commentData };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockCreatedComment);

      const result = await createComment(commentData);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/`, {
        method: "POST",
        headers: {
          // Expect both because getAuthHeaders() is called with default true
          "Content-Type": "application/json",
          Authorization: "bearer testtoken",
        },
        body: JSON.stringify(commentData),
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(); // Called with default (true)
      expect(result).toEqual(mockCreatedComment);
    });
  });

  describe("updateComment", () => {
    test("updates an existing comment successfully", async () => {
      const commentId = "c1";
      const updatedData = { content: "Updated comment content" };
      const mockUpdatedComment = { id: commentId, ...updatedData };
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce(mockUpdatedComment);

      const result = await updateComment(commentId, updatedData);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/${commentId}`, {
        method: "PUT",
        headers: {
          // Expect both
          "Content-Type": "application/json",
          Authorization: "bearer testtoken",
        },
        body: JSON.stringify(updatedData),
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(); // Called with default (true)
      expect(result).toEqual(mockUpdatedComment);
    });
  });

  describe("deleteComment", () => {
    test("deletes a comment successfully", async () => {
      const commentId = "c1";
      fetch.mockResolvedValueOnce({ ok: true });
      auth.handleResponse.mockResolvedValueOnce({ message: "Comment deleted" });

      await deleteComment(commentId);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/${commentId}`, {
        method: "DELETE",
        headers: {
          // Now correctly expects only Authorization
          Authorization: "bearer testtoken",
        },
      });
      expect(auth.getAuthHeaders).toHaveBeenCalledWith(false); // Called with false
    });
  });
});
