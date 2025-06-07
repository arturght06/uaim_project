import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Register from "./Register";
import * as registerService from "../../../services/register";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../services/register", () => ({
  validateRegisterClientSide: jest.fn(),
  tryRegister: jest.fn(),
}));

describe("Register Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillForm = (data = {}) => {
    fireEvent.change(screen.getByLabelText("Nazwa użytkownika"), {
      target: { value: data.username || "testuser" },
    });
    fireEvent.change(screen.getByLabelText("Imię"), {
      target: { value: data.name || "Test" },
    });
    fireEvent.change(screen.getByLabelText("Nazwisko"), {
      target: { value: data.surname || "User" },
    });
    fireEvent.change(screen.getByLabelText("Data urodzenia (YYYY-MM-DD)"), {
      target: { value: data.birthday || "2000-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: data.email || "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Hasło"), {
      target: { value: data.password || "Password123!" },
    });
    fireEvent.change(screen.getByLabelText("Potwierdź hasło"), {
      target: { value: data.confirmPassword || "Password123!" },
    });
  };

  test("renders registration form with all fields and button", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    expect(screen.getByText("Rejestracja")).toBeInTheDocument();
    expect(screen.getByLabelText("Nazwa użytkownika")).toBeInTheDocument();
    expect(screen.getByLabelText("Imię")).toBeInTheDocument();
    expect(screen.getByLabelText("Nazwisko")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Data urodzenia (YYYY-MM-DD)")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kod kraju")).toBeInTheDocument();
    expect(screen.getByLabelText("Numer telefonu")).toBeInTheDocument();
    expect(screen.getByLabelText("Hasło")).toBeInTheDocument();
    expect(screen.getByLabelText("Potwierdź hasło")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Zarejestruj" })
    ).toBeInTheDocument();
    expect(screen.getByText("Masz już konto?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Zaloguj się" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  test("updates form data on input change", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const usernameInput = screen.getByLabelText("Nazwa użytkownika");
    fireEvent.change(usernameInput, { target: { value: "newuser" } });
    expect(usernameInput.value).toBe("newuser");
  });

  test("calls client-side validation on submit", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Zarejestruj" }));
    expect(registerService.validateRegisterClientSide).toHaveBeenCalledTimes(1);
  });

  test("displays client-side validation errors", () => {
    const clientErrors = { username: "Nazwa użytkownika jest wymagana." };
    registerService.validateRegisterClientSide.mockImplementation(() => {
      throw clientErrors;
    });
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Zarejestruj" }));

    expect(
      screen.getByText("Nazwa użytkownika jest wymagana.")
    ).toBeInTheDocument();
    expect(registerService.tryRegister).not.toHaveBeenCalled();
  });

  test("calls tryRegister service on successful client validation and navigates on success", async () => {
    registerService.validateRegisterClientSide.mockImplementation(() => {}); // No errors
    registerService.tryRegister.mockResolvedValueOnce({
      success: true,
      user: { id: "u1" },
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const formData = {
      username: "testuser",
      name: "Test",
      surname: "User",
      birthday: "2000-01-01",
      email: "test@example.com",
      phone_country_code: "",
      phone_number: "",
      password: "Password123!",
      confirmPassword: "Password123!",
    };
    fillForm(formData);
    fireEvent.click(screen.getByRole("button", { name: "Zarejestruj" }));

    expect(
      screen.getByRole("button", { name: "Rejestrowanie..." })
    ).toBeDisabled();

    await waitFor(() => {
      expect(registerService.tryRegister).toHaveBeenCalledWith(
        expect.objectContaining({ username: "testuser" })
      );
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("displays field-specific errors if tryRegister fails with errors object", async () => {
    registerService.validateRegisterClientSide.mockImplementation(() => {});
    const serverErrors = { email: "Email już istnieje." };
    registerService.tryRegister.mockRejectedValueOnce({ errors: serverErrors });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Zarejestruj" }));

    await waitFor(() => {
      expect(screen.getByText("Email już istnieje.")).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("displays general error if tryRegister fails with general error string", async () => {
    registerService.validateRegisterClientSide.mockImplementation(() => {});
    const errorMessage = "Wystąpił nieoczekiwany błąd.";
    registerService.tryRegister.mockRejectedValueOnce({ error: errorMessage });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Zarejestruj" }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Zarejestruj" })
    ).not.toBeDisabled();
  });
});
