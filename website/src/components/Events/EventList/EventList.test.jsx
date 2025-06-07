// src/components/Events/EventList/EventList.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import EventList from "./EventList";
import * as eventService from "../../../services/events";
import { AuthContext } from "../../../contexts/AuthContext";

jest.mock("../../../services/events");
// Mock EventCard if its internal complexity or further context/service dependencies cause issues.
// For now, we assume it renders based on props without further complex async logic itself.
// jest.mock('../EventCard/EventCard', () => ({ event }) => <div data-testid={`event-card-${event.id}`}>{event.title}</div>);

const mockEvents = [
  {
    id: "e1",
    title: "Event Alpha",
    description: "Desc Alpha",
    event_date: "2025-01-01T10:00:00Z",
    organizer_id: "u1",
    reservation_count: 1,
    comment_count: 1,
    location_data: { city: "A" },
    organizer_data: { name: "OrgA" },
  },
  {
    id: "e2",
    title: "Event Beta",
    description: "Desc Beta",
    event_date: "2025-02-01T11:00:00Z",
    organizer_id: "u2",
    reservation_count: 2,
    comment_count: 2,
    location_data: { city: "B" },
    organizer_data: { name: "OrgB" },
  },
];

const mockAuthContextValue = {
  isAuthenticated: false,
  currentUser: null,
  // Add any other properties EventCard might expect from AuthContext
};

const renderEventList = (props) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={mockAuthContextValue}>
        <EventList {...props} />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe("EventList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading message initially", () => {
    // Keep the promise pending to simulate loading state
    eventService.getAllEvents.mockImplementation(() => new Promise(() => {}));
    renderEventList({});
    expect(screen.getByText("Ładowanie wydarzeń...")).toBeInTheDocument();
  });

  test("renders custom loading message if provided", () => {
    eventService.getAllEvents.mockImplementation(() => new Promise(() => {}));
    renderEventList({ customLoadingMessage: "Fetching cool events..." });
    expect(screen.getByText("Fetching cool events...")).toBeInTheDocument();
  });

  test("fetches and displays all events by default", async () => {
    eventService.getAllEvents.mockResolvedValue(mockEvents);
    renderEventList({});

    // Wait for the loading message to disappear OR for the expected content to appear
    // Using findBy* is generally preferred as it waits for the element.
    expect(await screen.findByText("Event Alpha")).toBeInTheDocument();
    expect(screen.getByText("Event Beta")).toBeInTheDocument();

    // Verify the service call
    expect(eventService.getAllEvents).toHaveBeenCalledTimes(1);
  });

  test("fetches and displays events by categoryId if provided", async () => {
    eventService.getCategoryEvents.mockResolvedValue([mockEvents[0]]);
    renderEventList({ categoryId: "cat123" });

    expect(await screen.findByText("Event Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Event Beta")).not.toBeInTheDocument();

    expect(eventService.getCategoryEvents).toHaveBeenCalledWith("cat123");
    expect(eventService.getAllEvents).not.toHaveBeenCalled();
    expect(eventService.getUserEvents).not.toHaveBeenCalled();
  });

  test("fetches and displays events by userId if provided", async () => {
    eventService.getUserEvents.mockResolvedValue([mockEvents[1]]);
    renderEventList({ userId: "user456" });

    expect(await screen.findByText("Event Beta")).toBeInTheDocument();
    expect(screen.queryByText("Event Alpha")).not.toBeInTheDocument();

    expect(eventService.getUserEvents).toHaveBeenCalledWith("user456");
    expect(eventService.getAllEvents).not.toHaveBeenCalled();
    expect(eventService.getCategoryEvents).not.toHaveBeenCalled();
  });

  test("displays error message if fetching fails", async () => {
    eventService.getAllEvents.mockRejectedValue(new Error("API Error"));
    renderEventList({});
    expect(await screen.findByText("Błąd: API Error")).toBeInTheDocument();
  });

  test('displays "no events" message if data is empty', async () => {
    eventService.getAllEvents.mockResolvedValue([]);
    renderEventList({});
    expect(
      await screen.findByText("Obecnie brak dostępnych wydarzeń.")
    ).toBeInTheDocument();
  });

  test('displays "no events" message if data is null', async () => {
    eventService.getAllEvents.mockResolvedValue(null);
    renderEventList({});
    // findByText will wait for the loading to finish and the "no events" message to appear
    expect(
      await screen.findByText("Obecnie brak dostępnych wydarzeń.")
    ).toBeInTheDocument();
  });

  test('displays custom "no events" message if provided and data is empty', async () => {
    eventService.getAllEvents.mockResolvedValue([]);
    renderEventList({ customNoEventsMessage: "No cool events found, sorry!" });
    expect(
      await screen.findByText("No cool events found, sorry!")
    ).toBeInTheDocument();
  });
});
