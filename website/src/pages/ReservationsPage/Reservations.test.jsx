import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Reservations from "./Reservations";

describe("Reservations Page", () => {
  test("renders the page title and description", () => {
    render(<Reservations />);
    expect(screen.getByText("Moje Rezerwacje")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tutaj znajdziesz listę swoich zarezerwowanych wydarzeń."
      )
    ).toBeInTheDocument();
  });
});
