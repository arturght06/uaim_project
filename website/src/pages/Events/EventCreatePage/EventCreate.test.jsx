import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import EventCreate from "./EventCreate";

// This will be the function our mock calls, allowing us to control its argument
let mockOnSuccessArgument = { id: "newEvent123" };

jest.mock("../../../components/Events/EventForm/EventForm", () => {
  // The mock component now uses a function defined *outside* its factory scope,
  // but it's okay because the factory itself doesn't try to *define* this variable.
  // It only *references* it at the time the mock component is rendered and used.
  // A cleaner way is often to have the mock component call a jest.fn() that you control from the test.
  return ({ onSuccess }) => (
    <div data-testid="event-form">
      Mock Event Form
      <button onClick={() => onSuccess(mockOnSuccessArgument)}>
        Simulate Form Action
      </button>
    </div>
  );
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("EventCreate Page", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Reset default success argument for mockOnSuccessArgument before each test
    mockOnSuccessArgument = { id: "newEvent123" };
  });

  test("renders the page title and the EventForm component", () => {
    render(
      <MemoryRouter>
        <EventCreate />
      </MemoryRouter>
    );
    expect(screen.getByText("Utwórz Nowe Wydarzenie")).toBeInTheDocument();
    expect(screen.getByTestId("event-form")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Simulate Form Action" })
    ).toBeInTheDocument();
  });

  test("navigates to the created event's detail page on successful form submission", () => {
    mockOnSuccessArgument = { id: "newEvent123" }; // Ensure correct arg for this test
    render(
      <MemoryRouter>
        <EventCreate />
      </MemoryRouter>
    );
    const simulateSuccessButton = screen.getByText("Simulate Form Action");
    fireEvent.click(simulateSuccessButton);
    expect(mockNavigate).toHaveBeenCalledWith("/events/newEvent123");
  });

  test("navigates to home if createdEvent or createdEvent.id is missing after success", () => {
    mockOnSuccessArgument = null; // Set arg to null for this test
    render(
      <MemoryRouter>
        <EventCreate />
      </MemoryRouter>
    );
    const simulateSuccessButtonNoId = screen.getByRole("button", {
      name: "Simulate Form Action",
    });
    fireEvent.click(simulateSuccessButtonNoId);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
