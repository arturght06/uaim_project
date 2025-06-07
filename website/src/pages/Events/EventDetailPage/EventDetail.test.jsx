import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import EventDetail from "./EventDetail";
import { AuthContext } from "../../../contexts/AuthContext";
import { AlertContext } from "../../../contexts/AlertContext";
import * as eventService from "../../../services/events";
import * as reservationService from "../../../services/reservation";
import * as commentService from "../../../services/comment";
import * as format from "../../../services/format";

jest.mock("../../../services/events");
jest.mock("../../../services/reservation");
jest.mock("../../../services/comment");

// Mock formatUser to ensure consistent output for the test
jest.mock("../../../services/format", () => ({
  formatUser: jest.fn((user) =>
    user ? `${user.name} ${user.surname}`.trim() : "Nieznany Użytkownik"
  ),
  formatDate: jest.fn((dateStr) => {
    if (!dateStr) return "Data nieznana";
    try {
      return new Date(dateStr).toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Niepoprawna data";
    }
  }),
  formatLocation: jest.fn((loc) => {
    if (!loc) return "Lokalizacja nieznana";
    return `${loc.country || ""}, ${loc.city || ""}, ${loc.address || ""}`
      .replace(/^, |, $/g, "")
      .replace(/, ,/g, ",");
  }),
}));

const mockNavigate = jest.fn();
const mockEventIdParam = "testEvent1";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ eventId: mockEventIdParam }),
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

const mockShowAlert = jest.fn();

const mockEventData = {
  id: "testEvent1",
  title: "Awesome Concert",
  description: "A great concert.",
  event_date: new Date(2025, 5, 10, 18, 0, 0).toISOString(),
  organizer_id: "userOrg1",
  created_at: new Date(2025, 5, 1, 10, 0, 0).toISOString(),
  location_data: {
    id: "loc1",
    country: "Poland",
    city: "Warsaw",
    address: "Main 1",
  },
  organizer_data: {
    id: "userOrg1",
    name: "OrganizerName",
    surname: "OrganizerSurname",
  },
  max_participants: 100,
  reservation_count: 50,
};

const mockComments = [
  {
    id: "c1",
    event_id: "testEvent1",
    user_id: "u1",
    content: "Great!",
    created_at: new Date().toISOString(),
    user_data: { name: "User", surname: "One" },
  },
];

const mockReservations = [
  {
    id: "r1",
    event_id: "testEvent1",
    user_id: "currentUser123",
    status: "confirmed",
  },
];

const renderEventDetail = (authContextValue, eventIdParamOverride) => {
  eventService.getEventById.mockResolvedValue(mockEventData);
  commentService.getCommentsByEventId.mockResolvedValue(mockComments);
  reservationService.getAllMyReservations.mockResolvedValue(mockReservations);

  return render(
    <MemoryRouter initialEntries={[`/events/${mockEventIdParam}`]}>
      <AuthContext.Provider value={authContextValue}>
        <AlertContext.Provider value={{ showAlert: mockShowAlert }}>
          <Routes>
            <Route path="/events/:eventId" element={<EventDetail />} />
          </Routes>
        </AlertContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe("EventDetail Page", () => {
  const authenticatedUser = {
    currentUser: { id: "currentUser123", name: "Current" },
    isAuthenticated: true,
    isLoadingAuth: false,
    fetchNotifications: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks for services that return data
    eventService.getEventById.mockResolvedValue({ ...mockEventData });
    commentService.getCommentsByEventId.mockResolvedValue([...mockComments]);
    reservationService.getAllMyReservations.mockResolvedValue([
      ...mockReservations,
    ]);
    // Reset format mocks specific to this describe block if needed, or rely on the global one
    format.formatUser.mockImplementation((user) =>
      user ? `${user.name} ${user.surname}`.trim() : "Nieznany Użytkownik"
    );
  });

  test("renders loading message initially", () => {
    eventService.getEventById.mockImplementation(() => new Promise(() => {}));
    renderEventDetail(authenticatedUser);
    expect(
      screen.getByText("Ładowanie szczegółów wydarzenia...")
    ).toBeInTheDocument();
  });

  test("shows error message if event fetch fails", async () => {
    eventService.getEventById.mockRejectedValueOnce(
      new Error("Failed to fetch event")
    );
    renderEventDetail(authenticatedUser);
    await waitFor(() => {
      expect(
        screen.getByText("Błąd: Failed to fetch event")
      ).toBeInTheDocument();
    });
  });

  test("shows 'Nie znaleziono wydarzenia' if event is null after loading", async () => {
    eventService.getEventById.mockResolvedValueOnce(null);
    renderEventDetail(authenticatedUser);
    await waitFor(() => {
      expect(
        screen.getByText("Nie znaleziono wydarzenia.")
      ).toBeInTheDocument();
    });
  });

  test("displays comments section", async () => {
    renderEventDetail(authenticatedUser);
    await waitFor(() => {
      expect(screen.getByText(mockEventData.title)).toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { name: "Komentarze" })
    ).toBeInTheDocument();
    expect(screen.getByText(mockComments[0].content)).toBeInTheDocument();
  });
});

// Need to import within from testing-library for the refined query
import { within } from "@testing-library/react";
