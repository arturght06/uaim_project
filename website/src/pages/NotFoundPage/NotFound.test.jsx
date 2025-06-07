import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import NotFound from "./NotFound";

describe("NotFound Page", () => {
  test("renders 404 message and a link to home", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByText("Strona nie została znaleziona")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Przepraszamy, strona której szukasz nie istnieje.")
    ).toBeInTheDocument();

    const homeLink = screen.getByRole("link", {
      name: "Wróć na stronę główną",
    });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
