import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateLocation from "./CreateLocation";
import * as locationService from "../../../services/location";
import { useAlert } from "../../../contexts/AlertContext";

jest.mock("../../../services/location");
jest.mock("../../../contexts/AlertContext");

const mockShowAlert = jest.fn();
const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();

describe("CreateLocation Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAlert.mockReturnValue({ showAlert: mockShowAlert });
  });

  const renderComponent = () => {
    render(
      <CreateLocation onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );
  };

  test("renders form with inputs and buttons", () => {
    renderComponent();
    // No explicit title like "Dodaj Nową Lokalizację" is in this component's JSX
    // It's usually part of the Modal that wraps it.
    expect(screen.getByLabelText("Kraj")).toBeInTheDocument();
    expect(screen.getByLabelText("Miasto")).toBeInTheDocument();
    expect(screen.getByLabelText("Adres")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anuluj" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Dodaj Lokalizację" })
    ).toBeInTheDocument();
  });

  test("updates form data on input change", () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText("Kraj"), {
      target: { value: "Polska" },
    });
    fireEvent.change(screen.getByLabelText("Miasto"), {
      target: { value: "Warszawa" },
    });
    fireEvent.change(screen.getByLabelText("Adres"), {
      target: { value: "Marszałkowska 1" },
    });

    expect(screen.getByLabelText("Kraj")).toHaveValue("Polska");
    expect(screen.getByLabelText("Miasto")).toHaveValue("Warszawa");
    expect(screen.getByLabelText("Adres")).toHaveValue("Marszałkowska 1");
  });

  test("calls onCancel when cancel button is clicked", () => {
    renderComponent();
    fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  describe("Client-side validation", () => {
    test("shows error if country is empty", async () => {
      renderComponent();
      fireEvent.click(
        screen.getByRole("button", { name: "Dodaj Lokalizację" })
      );
      // Validation for country, city, address happens. Country is first in component.
      expect(
        await screen.findByText("Kraj jest wymagany.")
      ).toBeInTheDocument(); // Default form validation will show this first
    });

    test("shows error if city is empty (after country is filled)", async () => {
      renderComponent();
      fireEvent.change(screen.getByLabelText("Kraj"), {
        target: { value: "Polska" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: "Dodaj Lokalizację" })
      );
      expect(
        await screen.findByText("Miasto jest wymagane.")
      ).toBeInTheDocument();
    });

    test("shows error if address is empty (after country and city are filled)", async () => {
      renderComponent();
      fireEvent.change(screen.getByLabelText("Kraj"), {
        target: { value: "Polska" },
      });
      fireEvent.change(screen.getByLabelText("Miasto"), {
        target: { value: "Warszawa" },
      });
      fireEvent.click(
        screen.getByRole("button", { name: "Dodaj Lokalizację" })
      );
      expect(
        await screen.findByText("Adres jest wymagany.")
      ).toBeInTheDocument();
    });
  });

  describe("Form submission", () => {
    const validLocationData = {
      country: "Polska",
      city: "Warszawa",
      address: "Marszałkowska 1",
      // Optional fields are not included here for the minimal valid submission
      name: "",
      postal_code: "",
      description: "",
    };
    const locationDataToSubmit = {
      ...validLocationData,
      description: null, // As per component logic
    };

    test("calls createNewLocation and onSuccess on successful submission", async () => {
      const mockNewLocation = { id: "loc123", ...validLocationData };
      locationService.createNewLocation.mockResolvedValue(mockNewLocation);

      renderComponent();
      fireEvent.change(screen.getByLabelText("Kraj"), {
        target: { value: validLocationData.country },
      });
      fireEvent.change(screen.getByLabelText("Miasto"), {
        target: { value: validLocationData.city },
      });
      fireEvent.change(screen.getByLabelText("Adres"), {
        target: { value: validLocationData.address },
      });
      // Optional fields can be left empty or filled
      // fireEvent.change(screen.getByLabelText('Nazwa lokalizacji (opcjonalne)'), { target: { value: 'Central Point' } });

      fireEvent.click(
        screen.getByRole("button", { name: "Dodaj Lokalizację" })
      );

      expect(
        screen.getByRole("button", { name: "Dodawanie..." })
      ).toBeDisabled();

      await waitFor(() => {
        expect(locationService.createNewLocation).toHaveBeenCalledWith(
          locationDataToSubmit
        );
      });
      expect(mockShowAlert).toHaveBeenCalledWith(
        "Lokalizacja utworzona pomyślnie!",
        "success"
      );
      expect(mockOnSuccess).toHaveBeenCalledWith(mockNewLocation);

      // Check form reset
      expect(screen.getByLabelText("Kraj")).toHaveValue("");
      expect(screen.getByLabelText("Miasto")).toHaveValue("");
      expect(screen.getByLabelText("Adres")).toHaveValue("");
    });

    test("handles server-side validation errors", async () => {
      const serverValidationErrors = {
        city: "To miasto jest już zajęte.",
        address: "Adres niepoprawny.",
      };
      locationService.createNewLocation.mockRejectedValue({
        isValidationError: true,
        serverErrors: serverValidationErrors,
      });

      renderComponent();
      fireEvent.change(screen.getByLabelText("Kraj"), {
        target: { value: validLocationData.country },
      });
      fireEvent.change(screen.getByLabelText("Miasto"), {
        target: { value: validLocationData.city },
      });
      fireEvent.change(screen.getByLabelText("Adres"), {
        target: { value: validLocationData.address },
      });
      fireEvent.click(
        screen.getByRole("button", { name: "Dodaj Lokalizację" })
      );

      await waitFor(() => {
        expect(
          screen.getByText("To miasto jest już zajęte.")
        ).toBeInTheDocument();
        expect(screen.getByText("Adres niepoprawny.")).toBeInTheDocument();
        expect(
          screen.getByText("Popraw błędy w formularzu.")
        ).toBeInTheDocument();
      });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    test("handles general server error (with error.data.error)", async () => {
      locationService.createNewLocation.mockRejectedValue({
        data: { error: "Błąd po stronie serwera." },
      });

      renderComponent();
      fireEvent.change(screen.getByLabelText("Kraj"), {
        target: { value: validLocationData.country },
      });
      fireEvent.change(screen.getByLabelText("Miasto"), {
        target: { value: validLocationData.city },
      });
      fireEvent.change(screen.getByLabelText("Adres"), {
        target: { value: validLocationData.address },
      });
      fireEvent.click(
        screen.getByRole("button", { name: "Dodaj Lokalizację" })
      );

      await waitFor(() => {
        expect(
          screen.getByText("Błąd po stronie serwera.")
        ).toBeInTheDocument();
      });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    test("handles general server error (with error.message)", async () => {
      locationService.createNewLocation.mockRejectedValue(
        new Error("Unexpected network issue.")
      );

      renderComponent();
      fireEvent.change(screen.getByLabelText("Kraj"), {
        target: { value: validLocationData.country },
      });
      fireEvent.change(screen.getByLabelText("Miasto"), {
        target: { value: validLocationData.city },
      });
      fireEvent.change(screen.getByLabelText("Adres"), {
        target: { value: validLocationData.address },
      });
      fireEvent.click(
        screen.getByRole("button", { name: "Dodaj Lokalizację" })
      );

      await waitFor(() => {
        expect(
          screen.getByText("Unexpected network issue.")
        ).toBeInTheDocument();
      });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
