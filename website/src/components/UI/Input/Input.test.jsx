import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Input from "./Input";

describe("Input Component", () => {
  test("renders with label, type, value, placeholder", () => {
    render(
      <Input
        label="Test Label"
        type="email"
        value="test@example.com"
        onChange={() => {}}
        placeholder="Enter email"
        name="testEmail"
      />
    );
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toHaveValue(
      "test@example.com"
    );
    expect(screen.getByLabelText("Test Label")).toHaveAttribute(
      "name",
      "testEmail"
    );
  });

  test("displays error message when error prop is provided", () => {
    render(<Input label="Test Label" name="test" error="This is an error" />);
    expect(screen.getByText("This is an error")).toBeInTheDocument();
    expect(screen.getByLabelText("Test Label")).toHaveClass("errorInput");
  });

  test("does not display error message when error prop is not provided", () => {
    render(<Input label="Test Label" name="test" />);
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument(); // General check
    expect(screen.getByLabelText("Test Label")).not.toHaveClass("errorInput");
  });

  // Test to cover the 'name' prop branch for inputId
  test("generates a random id if name prop is not provided", () => {
    render(<Input label="No Name Input" />);
    const inputElement = screen.getByLabelText("No Name Input");
    expect(inputElement.id).toMatch(/^input-/); // Check if ID starts with "input-"
  });

  test("uses the name prop as id if provided", () => {
    render(<Input label="Named Input" name="customName" />);
    const inputElement = screen.getByLabelText("Named Input");
    expect(inputElement.id).toBe("customName");
  });
});
