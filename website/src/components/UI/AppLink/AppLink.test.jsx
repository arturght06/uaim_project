// src/components/UI/AppLink/AppLink.test.jsx

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom"; // Added useLocation for debugging
import "@testing-library/jest-dom";
import AppLink from "./AppLink";

const TestComponent = () => <div>Target Page</div>;
const CurrentLocation = () => {
  // Helper to see current route in tests
  const location = useLocation();
  return <div data-testid="current-location">{location.pathname}</div>;
};

describe("AppLink Component", () => {
  // Modified renderWithRouter to be more flexible
  const renderWithRouterContext = (
    ui,
    { initialRoute = "/", routesConfig = [] } = {}
  ) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          {routesConfig.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          {/* Optionally, add a route to display current location for debugging */}
          {/* <Route path="*" element={<CurrentLocation />} />  */}
        </Routes>
        {ui}{" "}
        {/* Render the component directly if it's not meant to be matched by a route itself */}
      </MemoryRouter>
    );
  };

  test("renders an internal link with RouterLink", () => {
    // For a simple link, we just need the MemoryRouter context
    render(
      <MemoryRouter>
        <AppLink to="/target">Internal Link</AppLink>
      </MemoryRouter>
    );
    const link = screen.getByText("Internal Link");
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/target");
  });

  test("renders an external link with <a> tag and correct attributes", () => {
    render(
      <AppLink to="https://example.com" external>
        External Link
      </AppLink>
    );
    // This test doesn't need MemoryRouter as it's a plain <a> tag
    const link = screen.getByText("External Link");
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("renders a mailto link correctly", () => {
    render(<AppLink to="mailto:test@example.com">Email Us</AppLink>);
    const link = screen.getByText("Email Us");
    expect(link).toHaveAttribute("href", "mailto:test@example.com");
  });

  // Updated NavLink test
  test("renders a NavLink and it is active when on the target route", () => {
    render(
      <MemoryRouter initialEntries={["/target"]}>
        {" "}
        {/* Start router at /target */}
        <Routes>
          {/* Define a route that uses the AppLink component */}
          <Route
            path="/target"
            element={
              <AppLink to="/target" nav>
                Nav Link
              </AppLink>
            }
          />
          <Route path="/other" element={<div>Other Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const link = screen.getByText("Nav Link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass("active"); // NavLink should be active
  });

  test("renders a NavLink and it is not active when the current route is different", () => {
    render(
      <MemoryRouter initialEntries={["/other"]}>
        {" "}
        {/* Current page is /other */}
        <div>
          {/* Simulate a navigation bar where both links are always present */}
          <AppLink to="/target" nav>
            Nav Link to Target
          </AppLink>{" "}
          {/* Points to /target */}
          <AppLink to="/other" nav>
            Nav Link to Other
          </AppLink>{" "}
          {/* Points to /other */}
        </div>
        <Routes>
          {/* Define the destinations, not strictly needed for link state testing if links are outside Routes */}
          <Route path="/target" element={<div>Target Page Content</div>} />
          <Route path="/other" element={<div>Other Page Content</div>} />
        </Routes>
      </MemoryRouter>
    );

    // screen.debug();

    // Check the link that points to /target (it should NOT be active)
    const navLinkToTarget = screen.getByText("Nav Link to Target");
    expect(navLinkToTarget).toBeInTheDocument();
    expect(navLinkToTarget).not.toHaveClass("active");

    // Check the link that points to /other (it SHOULD be active)
    const navLinkToOther = screen.getByText("Nav Link to Other");
    expect(navLinkToOther).toBeInTheDocument();
    expect(navLinkToOther).toHaveClass("active");
  });

  test("applies custom className", () => {
    render(
      <MemoryRouter>
        <AppLink to="/target" className="my-custom-class">
          Styled Link
        </AppLink>
      </MemoryRouter>
    );
    expect(screen.getByText("Styled Link")).toHaveClass("my-custom-class");
  });

  test("applies variant className", () => {
    render(
      <MemoryRouter>
        <AppLink to="/target" variant="default">
          Default Variant
        </AppLink>
      </MemoryRouter>
    );
    expect(screen.getByText("Default Variant")).toHaveClass("default");
  });
});
