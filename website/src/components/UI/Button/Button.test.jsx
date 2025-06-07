import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Button from "./Button";

describe("Button Component", () => {
  test("renders with children", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  test("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText("Click Me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies correct variant class (primary by default)", () => {
    render(<Button>Primary Button</Button>);
    expect(screen.getByText("Primary Button")).toHaveClass("button primary");
  });

  test("applies specified variant class (e.g., secondary)", () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    expect(screen.getByText("Secondary Button")).toHaveClass(
      "button secondary"
    );
  });

  test("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByText("Disabled Button")).toBeDisabled();
  });

  test('has default type "button"', () => {
    render(<Button>Test</Button>);
    expect(screen.getByText("Test")).toHaveAttribute("type", "button");
  });

  test("applies specified type (e.g., submit)", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByText("Submit")).toHaveAttribute("type", "submit");
  });
});
