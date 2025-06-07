import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import EditProfile from "./EditProfile";
import { AuthContext } from "../../../contexts/AuthContext";
import { AlertContext } from "../../../contexts/AlertContext";
import * as userService from "../../../services/user";

// Mock UserForm
jest.mock(
  "../../../components/User/UserForm/UserForm",
  () =>
    ({ initialUser, onSubmit, isLoading, serverError, formErrors }) =>
      (
        <form
          data-testid="user-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(initialUser);
          }}
        >
          <div data-testid="initial-user-name">{initialUser?.name}</div>
          {serverError && <div data-testid="server-error">{serverError}</div>}
          {/* Removed formErrors.general as UserForm handles field-specific errors internally via its own Input components */}
          <button
            type="submit"
            data-testid="submit-button"
            disabled={isLoading}
          >
            {isLoading ? "Zapisywanie..." : "Zapisz Zmiany"}
          </button>
        </form>
      )
);

jest.mock("../../../services/user");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockShowAlert = jest.fn();
const mockRefreshAuthStatus = jest.fn();

const initialMockUser = {
  id: "user1",
  name: "Test",
  surname: "User",
  email: "test@example.com",
};

const renderEditProfile = (authContextValue) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authContextValue}>
        <AlertContext.Provider value={{ showAlert: mockShowAlert }}>
          <Routes>
            <Route path="/" element={<EditProfile />} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/profile" element={<div>Profile Page</div>} />
          </Routes>
        </AlertContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe("EditProfile Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userService.updateUser.mockResolvedValue({});
  });

  const authenticatedUserContext = {
    currentUser: initialMockUser,
    isAuthenticated: true,
    isLoadingAuth: false,
    refreshAuthStatus: mockRefreshAuthStatus,
  };

  const authLoadingContext = {
    currentUser: null,
    isAuthenticated: false,
    isLoadingAuth: true,
    refreshAuthStatus: mockRefreshAuthStatus,
  };

  const unauthenticatedContext = {
    currentUser: null,
    isAuthenticated: false,
    isLoadingAuth: false,
    refreshAuthStatus: mockRefreshAuthStatus,
  };

  test("shows loading message when auth is loading", () => {
    renderEditProfile(authLoadingContext);
    expect(screen.getByText("Ładowanie...")).toBeInTheDocument();
  });

  test("redirects to login if user is not authenticated", async () => {
    renderEditProfile(unauthenticatedContext);
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true })
    );
  });

  test("renders page title and UserForm when authenticated", async () => {
    renderEditProfile(authenticatedUserContext);
    expect(screen.getByText("Edytuj Swój Profil")).toBeInTheDocument();
    const userForm = screen.getByTestId("user-form");
    expect(userForm).toBeInTheDocument();
    expect(await screen.findByTestId("initial-user-name")).toHaveTextContent(
      initialMockUser.name
    );
  });

  test("displays message if userToEdit is null after loading (edge case, usually currentUser is available)", async () => {
    renderEditProfile({ ...authenticatedUserContext, currentUser: null });
    await waitFor(() => {
      expect(
        screen.getByText("Brak danych użytkownika do edycji.")
      ).toBeInTheDocument();
    });
  });

  test("displays server error message on updateUser failure (general error)", async () => {
    const errorMessage = "Wystąpił nieoczekiwany błąd.";
    userService.updateUser.mockRejectedValueOnce({ message: errorMessage });
    renderEditProfile(authenticatedUserContext);

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => {
      expect(screen.getByTestId("server-error")).toHaveTextContent(
        errorMessage
      );
    });
    // Button should be re-enabled and show "Zapisz Zmiany"
    expect(
      screen.getByRole("button", { name: "Zapisz Zmiany" })
    ).not.toBeDisabled();
  });

  test("displays server error message on updateUser failure (error.error structure)", async () => {
    const specificError = "Email już istnieje.";
    userService.updateUser.mockRejectedValueOnce({ error: specificError });
    renderEditProfile(authenticatedUserContext);

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => {
      expect(screen.getByTestId("server-error")).toHaveTextContent(
        specificError
      );
    });
  });
});
