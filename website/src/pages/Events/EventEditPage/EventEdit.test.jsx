import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import EventEdit from "./EventEdit";
import { AuthContext } from "../../../contexts/AuthContext";

// Mock EventForm
const mockEventFormOnSuccess = jest.fn();
let mockEventFormSuccessArg = { id: "defaultIdFromMock" };

jest.mock(
  "../../../components/Events/EventForm/EventForm",
  () =>
    ({ eventToEditId, onSuccess }) =>
      (
        <div data-testid="event-form" data-eventid={eventToEditId}>
          Mock Event Form for ID: {eventToEditId}
          <button onClick={() => onSuccess(mockEventFormSuccessArg)}>
            Simulate Update Success
          </button>
        </div>
      )
);

const mockNavigate = jest.fn();

// Store the mock function for useParams globally so it can be controlled
const mockUseParams = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(), // Call the mock function
}));

const renderEventEdit = (authContextValue, routeParamValue) => {
  // Configure what useParams will return for this render
  mockUseParams.mockReturnValue({ eventId: routeParamValue });

  return render(
    <MemoryRouter
      initialEntries={[`/events/edit/${routeParamValue || "dummy"}`]}
    >
      <AuthContext.Provider value={authContextValue}>
        <Routes>
          <Route path="/events/edit/:eventId" element={<EventEdit />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe("EventEdit Page", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockEventFormOnSuccess.mockClear();
    mockUseParams.mockClear(); // Clear useParams mock calls
    mockEventFormSuccessArg = { id: "defaultIdFromMock" };
  });

  const authenticatedUser = {
    currentUser: { id: "user1", name: "Test User" },
    isAuthenticated: true,
    isLoadingAuth: false,
  };

  const authLoading = {
    currentUser: null,
    isAuthenticated: false,
    isLoadingAuth: true,
  };

  const unauthenticated = {
    currentUser: null,
    isAuthenticated: false,
    isLoadingAuth: false,
  };

  test("shows loading message when auth is loading", () => {
    renderEventEdit(authLoading, "event123");
    expect(screen.getByText("Ładowanie...")).toBeInTheDocument();
  });

  test("redirects to login if user is not authenticated", async () => {
    renderEventEdit(unauthenticated, "event123");
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true })
    );
  });

  test("shows error if eventId is missing (param is undefined)", () => {
    renderEventEdit(authenticatedUser, undefined);
    expect(
      screen.getByText("Błąd: Brak ID wydarzenia do edycji.")
    ).toBeInTheDocument();
  });

  test("renders page title and EventForm when authenticated and eventId is present", () => {
    renderEventEdit(authenticatedUser, "testEventId123");
    expect(screen.getByText("Edytuj Wydarzenie")).toBeInTheDocument();
    const eventForm = screen.getByTestId("event-form");
    expect(eventForm).toBeInTheDocument();
    expect(eventForm).toHaveAttribute("data-eventid", "testEventId123");
    expect(
      screen.getByText("Mock Event Form for ID: testEventId123")
    ).toBeInTheDocument();
  });

  test("navigates to updated event's detail page on successful form submission", async () => {
    const eventIdForUpdate = "eventToUpdate";
    mockEventFormSuccessArg = { id: eventIdForUpdate };
    renderEventEdit(authenticatedUser, eventIdForUpdate);

    const simulateSuccessButton = screen.getByText("Simulate Update Success");
    fireEvent.click(simulateSuccessButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/events/${eventIdForUpdate}`);
    });
  });

  test("navigates to home if updatedEvent or updatedEvent.id is missing after success", async () => {
    mockEventFormSuccessArg = null;
    renderEventEdit(authenticatedUser, "eventToUpdateNoId");

    const simulateSuccessButtonNoId = screen.getByText(
      "Simulate Update Success"
    );
    fireEvent.click(simulateSuccessButtonNoId);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
