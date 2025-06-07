import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import Login from "./Login";
import { AuthContext } from "../../../contexts/AuthContext"; // Corrected path
import * as loginService from "../../../services/login";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../services/login", () => ({
  validateClientSide: jest.fn(),
  tryLogin: jest.fn(),
}));

const mockTryLoginAuthContext = jest.fn();

const renderLoginComponent = (authContextValue) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authContextValue}>
        <Login />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loginService.validateClientSide.mockClear();
    mockTryLoginAuthContext.mockClear();
  });

  test("renders login form with all fields and button", () => {
    renderLoginComponent({ tryLogin: mockTryLoginAuthContext });
    expect(screen.getByText("Logowanie")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Login (email lub nazwa użytkownika)")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Hasło")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Zaloguj się" })
    ).toBeInTheDocument();
    expect(screen.getByText("Nie masz jeszcze konta?")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Zarejestruj się" })
    ).toHaveAttribute("href", "/register");
  });

  test("updates form data on input change", () => {
    renderLoginComponent({ tryLogin: mockTryLoginAuthContext });
    const loginInput = screen.getByLabelText(
      "Login (email lub nazwa użytkownika)"
    );
    const passwordInput = screen.getByLabelText("Hasło");

    fireEvent.change(loginInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(loginInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password123");
  });

  test("calls client-side validation on submit", () => {
    renderLoginComponent({ tryLogin: mockTryLoginAuthContext });
    fireEvent.click(screen.getByRole("button", { name: "Zaloguj się" }));
    expect(loginService.validateClientSide).toHaveBeenCalledTimes(1);
  });

  test("displays client-side validation errors", () => {
    const clientErrors = {
      login: "Login jest wymagany.",
      password: "Hasło jest wymagane.",
    };
    loginService.validateClientSide.mockImplementation(() => {
      throw clientErrors;
    });
    renderLoginComponent({ tryLogin: mockTryLoginAuthContext });
    fireEvent.click(screen.getByRole("button", { name: "Zaloguj się" }));

    expect(screen.getByText("Login jest wymagany.")).toBeInTheDocument();
    expect(screen.getByText("Hasło jest wymagane.")).toBeInTheDocument();
    expect(mockTryLoginAuthContext).not.toHaveBeenCalled();
  });

  test("calls auth.tryLogin on successful client validation and navigates on success", async () => {
    loginService.validateClientSide.mockImplementation(() => {}); // No errors
    mockTryLoginAuthContext.mockResolvedValueOnce({
      id: "user1",
      name: "Test User",
    });

    renderLoginComponent({ tryLogin: mockTryLoginAuthContext });

    fireEvent.change(
      screen.getByLabelText("Login (email lub nazwa użytkownika)"),
      { target: { value: "test@example.com" } }
    );
    fireEvent.change(screen.getByLabelText("Hasło"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Zaloguj się" }));

    expect(screen.getByRole("button", { name: "Logowanie..." })).toBeDisabled();

    await waitFor(() => {
      expect(mockTryLoginAuthContext).toHaveBeenCalledWith({
        login: "test@example.com",
        password: "password123",
      });
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  test("displays general error if auth.tryLogin fails", async () => {
    loginService.validateClientSide.mockImplementation(() => {}); // No errors
    const errorMessage = "Niepoprawne dane logowania.";
    mockTryLoginAuthContext.mockRejectedValueOnce(errorMessage);

    renderLoginComponent({ tryLogin: mockTryLoginAuthContext });
    fireEvent.change(
      screen.getByLabelText("Login (email lub nazwa użytkownika)"),
      { target: { value: "wrong@example.com" } }
    );
    fireEvent.change(screen.getByLabelText("Hasło"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Zaloguj się" }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Zaloguj się" })
    ).not.toBeDisabled();
  });
});
