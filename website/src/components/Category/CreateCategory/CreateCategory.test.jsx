import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateCategory from "./CreateCategory";
import * as categoryServices from "../../../services/category"; // To mock createNewCategoryService
import * as alertContext from "../../../contexts/AlertContext"; // To mock useAlert

// Mock the services and contexts
jest.mock("../../../services/category");
jest.mock("../../../contexts/AlertContext");

describe("CreateCategory Component", () => {
  let mockShowAlert;
  let mockOnSuccess;
  let mockOnCancel;

  beforeEach(() => {
    mockShowAlert = jest.fn();
    mockOnSuccess = jest.fn();
    mockOnCancel = jest.fn();

    // Setup the mock for useAlert
    alertContext.useAlert.mockReturnValue({ showAlert: mockShowAlert });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <CreateCategory onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );
  };

  test("renders the form with inputs and buttons", () => {
    renderComponent();
    expect(screen.getByText("Dodaj Nową Kategorię")).toBeInTheDocument();
    expect(screen.getByLabelText("Nazwa kategorii")).toBeInTheDocument();
    expect(screen.getByLabelText("Opis kategorii")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anuluj" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Dodaj Kategorię" })
    ).toBeInTheDocument();
  });

  test("updates form data on input change", () => {
    renderComponent();
    const nameInput = screen.getByLabelText("Nazwa kategorii");
    const descriptionInput = screen.getByLabelText("Opis kategorii");

    fireEvent.change(nameInput, { target: { value: "Nowa Kategoria" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Opis nowej kategorii" },
    });

    expect(nameInput.value).toBe("Nowa Kategoria");
    expect(descriptionInput.value).toBe("Opis nowej kategorii");
  });

  test("calls onCancel when cancel button is clicked", () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  describe("Client-side validation", () => {
    test("shows error if name is empty", () => {
      renderComponent();
      fireEvent.click(screen.getByRole("button", { name: "Dodaj Kategorię" }));
      expect(
        screen.getByText("Nazwa kategorii jest wymagana.")
      ).toBeInTheDocument();
    });

    test("shows error if name is too short", () => {
      renderComponent();
      fireEvent.change(screen.getByLabelText("Nazwa kategorii"), {
        target: { value: "No" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Dodaj Kategorię" }));
      expect(
        screen.getByText("Nazwa kategorii musi mieć co najmniej 3 znaki.")
      ).toBeInTheDocument();
    });

    test("shows error if description is empty", () => {
      renderComponent();
      fireEvent.change(screen.getByLabelText("Nazwa kategorii"), {
        target: { value: "Valid Name" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Dodaj Kategorię" }));
      expect(
        screen.getByText("Opis kategorii jest wymagany.")
      ).toBeInTheDocument();
    });

    test("shows error if description is too short", () => {
      renderComponent();
      fireEvent.change(screen.getByLabelText("Nazwa kategorii"), {
        target: { value: "Valid Name" },
      });
      fireEvent.change(screen.getByLabelText("Opis kategorii"), {
        target: { value: "Short" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Dodaj Kategorię" }));
      expect(
        screen.getByText("Opis kategorii musi mieć co najmniej 10 znaków.")
      ).toBeInTheDocument();
    });
  });

  describe("Form submission", () => {
    test("calls createNewCategoryService and onSuccess on successful submission", async () => {
      const mockNewCategory = {
        id: "1",
        name: "Test Kategoria",
        description: "Testowy opis",
      };
      categoryServices.createCategory.mockResolvedValue(mockNewCategory);

      renderComponent();

      fireEvent.change(screen.getByLabelText("Nazwa kategorii"), {
        target: { value: "Test Kategoria" },
      });
      fireEvent.change(screen.getByLabelText("Opis kategorii"), {
        target: { value: "To jest wystarczająco długi opis testowy." },
      });
      fireEvent.click(screen.getByRole("button", { name: "Dodaj Kategorię" }));

      expect(
        screen.getByRole("button", { name: "Dodawanie..." })
      ).toBeDisabled();

      await waitFor(() => {
        expect(categoryServices.createCategory).toHaveBeenCalledWith({
          name: "Test Kategoria",
          description: "To jest wystarczająco długi opis testowy.",
        });
      });

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith(
          `Kategoria "${mockNewCategory.name}" została pomyślnie utworzona!`,
          "success"
        );
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({
          id: mockNewCategory.id, // from mocked response
          name: "Test Kategoria", // from form data as fallback if not in response
          description: "To jest wystarczająco długi opis testowy.",
        });
      });

      // Check if form is reset
      expect(screen.getByLabelText("Nazwa kategorii").value).toBe("");
      expect(screen.getByLabelText("Opis kategorii").value).toBe("");
    });

    test("handles server-side validation errors", async () => {
      const serverValidationErrors = {
        name: "Ta nazwa już istnieje.",
        description: "Opis jest niepoprawny.",
      };
      categoryServices.createCategory.mockRejectedValue({
        isValidationError: true,
        serverErrors: serverValidationErrors,
      });

      renderComponent();
      fireEvent.change(screen.getByLabelText("Nazwa kategorii"), {
        target: { value: "Istniejąca Kategoria" },
      });
      fireEvent.change(screen.getByLabelText("Opis kategorii"), {
        target: { value: "Jakiś poprawny opis kategorii." },
      });
      fireEvent.click(screen.getByRole("button", { name: "Dodaj Kategorię" }));

      await waitFor(() => {
        expect(screen.getByText("Ta nazwa już istnieje.")).toBeInTheDocument();
        expect(screen.getByText("Opis jest niepoprawny.")).toBeInTheDocument();
        expect(
          screen.getByText("Popraw błędy w formularzu.")
        ).toBeInTheDocument(); // Server error message
      });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    test("handles general server error", async () => {
      categoryServices.createCategory.mockRejectedValue({
        data: { error: "Wystąpił błąd serwera." },
      });

      renderComponent();
      fireEvent.change(screen.getByLabelText("Nazwa kategorii"), {
        target: { value: "Dobra Kategoria" },
      });
      fireEvent.change(screen.getByLabelText("Opis kategorii"), {
        target: { value: "Bardzo dobry opis kategorii." },
      });
      fireEvent.click(screen.getByRole("button", { name: "Dodaj Kategorię" }));

      await waitFor(() => {
        expect(screen.getByText("Wystąpił błąd serwera.")).toBeInTheDocument();
      });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
