import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserForm from "./UserForm";

const mockOnSubmit = jest.fn();

const initialUserData = {
  username: "testuser",
  name: "Test",
  surname: "User",
  birthday: "1990-01-15",
  email: "test@example.com",
  phone_country_code: "+48",
  phone_number: "123456789",
};

const renderUserForm = (props = {}) => {
  const defaultProps = {
    initialUser: initialUserData,
    onSubmit: mockOnSubmit,
    isLoading: false,
    serverError: "",
    formErrors: {},
  };
  // Merge defaultProps with incoming props, ensuring initialUser can be fully overridden
  const mergedProps = { ...defaultProps, ...props };
  if (props.hasOwnProperty("initialUser")) {
    // Allow explicitly passing null or different object for initialUser
    mergedProps.initialUser = props.initialUser;
  }

  return render(<UserForm {...mergedProps} />);
};

describe("UserForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders form with initial user data populated", () => {
    renderUserForm();
    expect(screen.getByLabelText("Nazwa użytkownika")).toHaveValue(
      initialUserData.username
    );
    expect(screen.getByLabelText("Imię")).toHaveValue(initialUserData.name);
    expect(screen.getByLabelText("Nazwisko")).toHaveValue(
      initialUserData.surname
    );
    expect(screen.getByLabelText("Data urodzenia")).toHaveValue(
      initialUserData.birthday
    );
    expect(screen.getByLabelText("Adres email")).toHaveValue(
      initialUserData.email
    );
    expect(screen.getByLabelText("Kod kraju")).toHaveValue(
      initialUserData.phone_country_code
    );
    expect(screen.getByLabelText("Numer telefonu")).toHaveValue(
      initialUserData.phone_number
    );
  });

  test("renders with empty fields if initialUser is null from the start", () => {
    renderUserForm({ initialUser: null });
    expect(screen.getByLabelText("Nazwa użytkownika")).toHaveValue("");
    expect(screen.getByLabelText("Imię")).toHaveValue("");
    expect(screen.getByLabelText("Adres email")).toHaveValue("");
  });

  test("updates form data on input change", () => {
    renderUserForm();
    fireEvent.change(screen.getByLabelText("Imię"), {
      target: { value: "Jane" },
    });
    expect(screen.getByLabelText("Imię")).toHaveValue("Jane");
  });

  test("displays serverError message if provided", () => {
    renderUserForm({ serverError: "An error from the server." });
    expect(screen.getByText("An error from the server.")).toBeInTheDocument();
  });

  test("displays field-specific formErrors if provided", () => {
    renderUserForm({ formErrors: { email: "Email already taken." } });
    expect(screen.getByText("Email already taken.")).toBeInTheDocument();
  });

  describe("Form submission", () => {
    test("calls onSubmit with form data when valid", () => {
      renderUserForm(); // Uses initialUserData which is valid
      fireEvent.change(screen.getByLabelText("Imię"), {
        target: { value: "Jane" },
      }); // Make a change

      fireEvent.click(screen.getByRole("button", { name: "Zapisz Zmiany" }));

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({
        ...initialUserData,
        name: "Jane",
      });
    });

    test("does not call onSubmit when form is invalid (e.g. name empty)", () => {
      renderUserForm({ initialUser: { ...initialUserData, name: "" } }); // Make name empty
      fireEvent.click(screen.getByRole("button", { name: "Zapisz Zmiany" }));
      expect(mockOnSubmit).not.toHaveBeenCalled();
      // Check that the error message for name appears
      expect(screen.getByText("Imię jest wymagane.")).toBeInTheDocument();
    });

    test("submit button is disabled when isLoading is true", () => {
      renderUserForm({ isLoading: true });
      expect(
        screen.getByRole("button", { name: "Zapisywanie..." })
      ).toBeDisabled();
    });
  });
});
