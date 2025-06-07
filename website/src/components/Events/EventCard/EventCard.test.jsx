import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import EventCard from "./EventCard";
import { AuthContext } from "../../../contexts/AuthContext";
import * as formatService from "../../../services/format";

jest.mock("../../../services/format", () => ({
  formatDate: jest.fn((date) =>
    date ? `formatted-${date}` : "formatted-Data nieznana"
  ),
  formatLocation: jest.fn((loc) =>
    loc ? `formatted-${loc.city}` : "formatted-Lokalizacja nieznana"
  ),
  formatUser: jest.fn((user) =>
    user ? `formatted-${user.name}` : "formatted-Nieznany użytkownik"
  ), // <-- Corrected mock
}));

const mockEvent = {
  id: "event1",
  title: "Test Event Title",
  description: "A short description of the test event.",
  event_date: "2024-01-01T10:00:00.000Z",
  organizer_id: "user123",
  created_at: "2023-12-01T09:00:00.000Z",
  location_data: {
    city: "Test City",
    country: "Testland",
    address: "123 Main",
  },
  organizer_data: { id: "user123", name: "John", surname: "Doe" },
  reservation: null,
  reservation_count: 5,
  comment_count: 2,
};

const renderEventCard = (
  eventProps = mockEvent,
  authValue = { isAuthenticated: false, currentUser: null }
) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <EventCard event={eventProps} />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe("EventCard Component", () => {
  beforeEach(() => {
    formatService.formatDate.mockClear();
    formatService.formatLocation.mockClear();
    formatService.formatUser.mockClear();
  });

  test("renders basic event details", () => {
    renderEventCard();
    expect(screen.getByText("Test Event Title")).toBeInTheDocument();
    expect(screen.getByText("formatted-John")).toBeInTheDocument(); // Organizer
    expect(
      screen.getByText("formatted-2023-12-01T09:00:00.000Z")
    ).toBeInTheDocument(); // Created_at date
    expect(screen.getByText("formatted-Test City")).toBeInTheDocument(); // Location
    expect(
      screen.getByText("formatted-2024-01-01T10:00:00.000Z")
    ).toBeInTheDocument(); // Event date
    expect(
      screen.getByText("A short description of the test event.")
    ).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // Reservation count
    expect(screen.getByText("2")).toBeInTheDocument(); // Comment count
  });

  test('displays "Minęło" for past events', () => {
    const pastEvent = { ...mockEvent, event_date: "2020-01-01T10:00:00.000Z" };
    renderEventCard(pastEvent);
    expect(screen.getByText("Minęło")).toBeInTheDocument();
  });

  test('does not display "Minęło" for future events', () => {
    const futureEvent = {
      ...mockEvent,
      event_date: "2099-01-01T10:00:00.000Z",
    };
    renderEventCard(futureEvent);
    expect(screen.queryByText("Minęło")).not.toBeInTheDocument();
  });

  test('displays "Twoje wydarzenie" if user is the organizer', () => {
    const authValue = { isAuthenticated: true, currentUser: { id: "user123" } };
    renderEventCard(mockEvent, authValue);
    expect(screen.getByText("Twoje wydarzenie")).toBeInTheDocument();
  });

  test('does not display "Twoje wydarzenie" if user is not the organizer', () => {
    const authValue = {
      isAuthenticated: true,
      currentUser: { id: "otherUser" },
    };
    renderEventCard(mockEvent, authValue);
    expect(screen.queryByText("Twoje wydarzenie")).not.toBeInTheDocument();
  });

  test('displays "Weźmiesz udział" if user has a reservation', () => {
    const eventWithReservation = { ...mockEvent, reservation: { id: "res1" } };
    renderEventCard(eventWithReservation);
    expect(screen.getByText("Weźmiesz udział")).toBeInTheDocument();
  });

  test('does not display "Weźmiesz udział" if user has no reservation', () => {
    renderEventCard();
    expect(screen.queryByText("Weźmiesz udział")).not.toBeInTheDocument();
  });

  test("renders as a Link by default", () => {
    renderEventCard();
    const linkElement = screen.getByText("Test Event Title").closest("a");
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", `/events/${mockEvent.id}`);
  });

  test("renders as a span if disableLink is true", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{ isAuthenticated: false, currentUser: null }}
        >
          <EventCard event={mockEvent} disableLink />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    const linkElement = screen.getByText("Test Event Title").closest("a");
    const spanWrapper = screen
      .getByText("Test Event Title")
      .closest("span.cardLink"); // Check for the span wrapper with class
    expect(linkElement).not.toBeInTheDocument();
    expect(spanWrapper).toBeInTheDocument();
  });

  test("handles event prop being null or undefined gracefully", () => {
    const { container } = render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{ isAuthenticated: false, currentUser: null }}
        >
          <EventCard event={null} />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    // Check that it doesn't crash and renders something minimal or nothing
    // For example, if it renders an empty div or the structure without data:
    expect(container.firstChild).toBeInTheDocument(); // Or more specific check if it renders an empty shell
    // No specific text assertions as data is null
  });
});
