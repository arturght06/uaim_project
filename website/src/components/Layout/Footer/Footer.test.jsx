import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "./Footer";

describe("Footer Component", () => {
  test("renders the current year and copyright text", () => {
    const currentYear = new Date().getFullYear();
    const mockDate = new Date(currentYear, 0, 1); // Jan 1st of current year
    jest.spyOn(global, "Date").mockImplementation(() => mockDate);

    render(<Footer />);

    expect(
      screen.getByText(`© ${currentYear} EVE.nt. Wszelkie prawa zastrzeżone.`)
    ).toBeInTheDocument();

    // Restore original Date object
    global.Date.mockRestore();
  });
});
