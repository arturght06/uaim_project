import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import EventListPage from "./EventList"; // Renamed to avoid confusion with the component

describe("EventListPage (Page Component)", () => {
  test("renders the page title and description", () => {
    render(<EventListPage />);
    expect(screen.getByText("Lista Wydarzeń")).toBeInTheDocument();
    expect(
      screen.getByText("Przeglądaj dostępne wydarzenia kulturalne.")
    ).toBeInTheDocument();
  });
});
