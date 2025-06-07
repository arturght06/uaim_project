import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Home from "./Home";
import * as categoryServices from "../../services/category"; // Corrected path
import { AuthContext } from "../../contexts/AuthContext"; // Corrected path

jest.mock("../../services/category"); // Corrected path

// Mock EventList to simplify Home page testing
jest.mock(
  "../../components/Events/EventList/EventList",
  () =>
    ({ categoryId }) =>
      (
        <div data-testid="event-list" data-categoryid={categoryId || "all"}>
          Mock Event List {categoryId ? `for category ${categoryId}` : ""}
        </div>
      )
);

// Mock HTMLMediaElement methods used by the video player
global.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
global.HTMLMediaElement.prototype.load = jest.fn();
global.HTMLMediaElement.prototype.pause = jest.fn();

const mockCategories = [
  { id: "cat1", name: "Music" },
  { id: "cat2", name: "Art" },
];

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    categoryServices.getAllCategories.mockResolvedValue(mockCategories);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderHome = () => {
    const mockAuthContext = {
      isAuthenticated: false,
      currentUser: null,
      isLoadingAuth: false,
    };
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <Home />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  test("renders welcome message and category filter", async () => {
    renderHome();
    expect(screen.getByText("Witaj w EVE.NT!")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Przeglądaj nadchodzące wydarzenia, rezerwuj miejsca i ciesz się kulturą."
      )
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByLabelText("Filtruj według kategorii")
      ).toBeInTheDocument();
    });
    expect(categoryServices.getAllCategories).toHaveBeenCalledTimes(1);
  });

  test("renders EventList component (initially with no category filter)", async () => {
    renderHome();
    const eventList = await screen.findByTestId("event-list");
    expect(eventList).toBeInTheDocument();
    expect(eventList).toHaveAttribute("data-categoryid", "all");
  });

  test("updates EventList when a category is selected", async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText("Music")).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText("Filtruj według kategorii");
    fireEvent.change(categorySelect, { target: { value: "cat1" } });

    const eventList = await screen.findByTestId("event-list");
    expect(eventList).toHaveAttribute("data-categoryid", "cat1");
  });

  test("video elements are present and attempt to play on mount", async () => {
    renderHome();
    await waitFor(() => {
      expect(global.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    });
    const videos = document.querySelectorAll("video");
    expect(videos.length).toBe(2);
  });

  test("video transitions on timeupdate (simulated)", async () => {
    renderHome();

    await waitFor(() => {
      expect(global.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    });

    const videos = document.querySelectorAll("video");
    const firstVideo = videos[0];

    Object.defineProperty(firstVideo, "duration", {
      writable: true,
      configurable: true,
      value: 10,
    });
    Object.defineProperty(firstVideo, "currentTime", {
      writable: true,
      configurable: true,
      value: 9.5,
    });
    Object.defineProperty(firstVideo, "_hasTriggeredNext", {
      writable: true,
      configurable: true,
      value: false,
    });

    act(() => {
      fireEvent(firstVideo, new Event("timeupdate"));
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(global.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    });
  });
});
