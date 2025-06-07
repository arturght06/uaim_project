import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeleteGrid from "./DeleteGrid";

const mockOnDeleteItem = jest.fn();

const mockItems = [
  { id: "1", name: "Item Alpha" },
  { id: "2", title: "Item Beta" }, // Test with 'title' as display key
  { id: "3" }, // Test with only id
];

const renderDeleteGrid = (props = {}) => {
  const defaultProps = {
    items: mockItems,
    onDeleteItem: mockOnDeleteItem,
  };
  return render(<DeleteGrid {...defaultProps} {...props} />);
};

// Mock window.confirm
global.confirm = jest.fn(() => true); // Default to 'true' (user confirms deletion)

describe("DeleteGrid Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.confirm.mockClear().mockReturnValue(true); // Reset and default to true
  });

  test("renders headers and list of items with delete buttons", () => {
    renderDeleteGrid();
    expect(screen.getByText("Nazwa")).toBeInTheDocument();
    expect(screen.getByText("Akcje")).toBeInTheDocument();

    expect(screen.getByText("Item Alpha")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /Usuń/i })[0]
    ).toBeInTheDocument();

    expect(screen.getByText("Item Beta")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /Usuń/i })[1]
    ).toBeInTheDocument();

    expect(screen.getByText("3")).toBeInTheDocument(); // Default displayFormatter uses id
    expect(
      screen.getAllByRole("button", { name: /Usuń/i })[2]
    ).toBeInTheDocument();
  });

  test("uses custom displayFormatter if provided", () => {
    const customFormatter = (item) =>
      `Formatted: ${item.id} - ${item.name || item.title}`;
    renderDeleteGrid({ displayFormatter: customFormatter });
    expect(screen.getByText("Formatted: 1 - Item Alpha")).toBeInTheDocument();
    expect(screen.getByText("Formatted: 2 - Item Beta")).toBeInTheDocument();
  });

  test("displays loading message when isLoading is true", () => {
    renderDeleteGrid({ isLoading: true, items: [] }); // Provide empty items to isolate loading
    expect(screen.getByText("Ładowanie elementy...")).toBeInTheDocument(); // Default plural
  });

  test("displays custom loading message with custom item name", () => {
    renderDeleteGrid({ isLoading: true, items: [], itemNamePlural: "książki" });
    expect(screen.getByText("Ładowanie książki...")).toBeInTheDocument();
  });

  test("displays error message when error is provided", () => {
    renderDeleteGrid({ error: "Failed to load items.", items: [] });
    expect(
      screen.getByText("Błąd ładowania elementy: Failed to load items.")
    ).toBeInTheDocument();
  });

  test('displays "no items" message when items array is empty', () => {
    renderDeleteGrid({ items: [] });
    expect(
      screen.getByText("Brak elementy do wyświetlenia.")
    ).toBeInTheDocument();
  });

  test('displays custom "no items" message if provided', () => {
    renderDeleteGrid({ items: [], noItemsMessage: "No cool things here." });
    expect(screen.getByText("No cool things here.")).toBeInTheDocument();
  });

  describe("Deletion Handling", () => {
    test("calls onDeleteItem with item id after confirmation", async () => {
      renderDeleteGrid({ items: [mockItems[0]] });
      const deleteButton = screen.getByRole("button", { name: /Usuń/i });
      fireEvent.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith(
        'Czy na pewno chcesz usunąć element "Item Alpha"?'
      );
      expect(deleteButton).toBeDisabled(); // Shows "Usuwanie..."
      expect(deleteButton).toHaveTextContent("Usuwanie...");

      await waitFor(() => expect(mockOnDeleteItem).toHaveBeenCalledWith("1"));
      // Button should re-enable after deletion attempt (in a real scenario, item would be gone)
      // For this test, we only check it becomes disabled. If it re-enables, it's due to mockOnDeleteItem resolving.
      // await waitFor(() => expect(deleteButton).not.toBeDisabled()); // This depends on component re-render or state update
    });

    test("uses custom itemNameSingular in confirmation", () => {
      renderDeleteGrid({ items: [mockItems[0]], itemNameSingular: "wpis" });
      const deleteButton = screen.getByRole("button", { name: /Usuń/i });
      fireEvent.click(deleteButton);
      expect(global.confirm).toHaveBeenCalledWith(
        'Czy na pewno chcesz usunąć wpis "Item Alpha"?'
      );
    });

    test("does not call onDeleteItem if user cancels confirmation", () => {
      global.confirm.mockReturnValueOnce(false); // User clicks "Cancel"
      renderDeleteGrid({ items: [mockItems[0]] });
      const deleteButton = screen.getByRole("button", { name: /Usuń/i });
      fireEvent.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledTimes(1);
      expect(mockOnDeleteItem).not.toHaveBeenCalled();
      expect(deleteButton).not.toBeDisabled();
    });

    test("handles error during onDeleteItem", async () => {
      mockOnDeleteItem.mockRejectedValueOnce(new Error("Deletion failed"));
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {}); // Suppress console.error

      renderDeleteGrid({ items: [mockItems[0]] });
      const deleteButton = screen.getByRole("button", { name: /Usuń/i });
      fireEvent.click(deleteButton);

      await waitFor(() => expect(mockOnDeleteItem).toHaveBeenCalledTimes(1));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error deleting item 1:",
        expect.any(Error)
      );
      // Check if button re-enables (from deletingItemId being set back to null in finally block)
      await waitFor(() => expect(deleteButton).not.toBeDisabled());
      expect(deleteButton).toHaveTextContent(/Usuń/);

      consoleErrorSpy.mockRestore();
    });
  });
});
