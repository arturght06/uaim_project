import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import "@testing-library/jest-dom";
import MainLayout from "./MainLayout";

// Mock child components Navbar and Footer to isolate MainLayout's logic
jest.mock("../Navbar/Navbar", () => () => (
  <nav data-testid="navbar">Mock Navbar</nav>
));
jest.mock("../Footer/Footer", () => () => (
  <footer data-testid="footer">Mock Footer</footer>
));

// Helper to set the current route for testing
const renderWithRoute = (children, route = "/") => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <MainLayout>{children}</MainLayout>
    </MemoryRouter>
  );
};

describe("MainLayout Component", () => {
  test("renders Navbar, children, and Footer", () => {
    renderWithRoute(<div>Test Children</div>);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByText("Test Children")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  test('applies home page specific styles when on "/" route', () => {
    const { container } = renderWithRoute(<div>Home Page Content</div>, "/");

    const mainElement = container.querySelector("main");
    const innerContainer = mainElement.firstChild; // Assuming children are wrapped directly

    // MainLayout.module.css styles (actual class names might differ if hashed)
    // We check for the presence of classes that would be applied.
    // This is a bit brittle if class names change. A more robust way is to check computed styles if possible,
    // or test the logic that *applies* the classes if it were more complex.
    // For now, we'll assume class names are somewhat stable or test for a distinguishing class.
    expect(mainElement).toHaveClass("mainContent");
    expect(mainElement).toHaveClass("mainContentHomePage"); // As per component logic
    expect(mainElement).not.toHaveClass("mainContentOtherPages");

    expect(innerContainer).toHaveClass("container");
    expect(innerContainer).toHaveClass("containerHomePage");
    expect(innerContainer).not.toHaveClass("containerOtherPages");
  });

  test('applies other pages specific styles when not on "/" route', () => {
    const { container } = renderWithRoute(
      <div>Other Page Content</div>,
      "/some-other-page"
    );

    const mainElement = container.querySelector("main");
    const innerContainer = mainElement.firstChild;

    expect(mainElement).toHaveClass("mainContent");
    expect(mainElement).toHaveClass("mainContentOtherPages"); // As per component logic
    expect(mainElement).not.toHaveClass("mainContentHomePage");

    expect(innerContainer).toHaveClass("container");
    expect(innerContainer).toHaveClass("containerOtherPages");
    expect(innerContainer).not.toHaveClass("containerHomePage");
  });
});
