import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Alert from "./Alert";
import { AlertContext } from "../../../contexts/AlertContext"; // We'll provide this

const mockRemoveAlert = jest.fn();

const mockAlerts = [
  { id: "alert1", message: "Success!", type: "success" },
  { id: "alert2", message: "Error occurred.", type: "error" },
  { id: "alert3", message: "Just some info.", type: "info" },
  { id: "alert4", message: "Warning ahead.", type: "warning" },
];

// Helper for providing context and rendering
const renderAlertComponent = (alerts = mockAlerts) => {
  return render(
    <AlertContext.Provider value={{ alerts, removeAlert: mockRemoveAlert }}>
      <Alert />
    </AlertContext.Provider>
  );
};

describe("Alert Component (using AlertItem)", () => {
  let portalRoot;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create the portal root for each test if not already there
    portalRoot = document.getElementById("alert-root");
    if (!portalRoot) {
      portalRoot = document.createElement("div");
      portalRoot.setAttribute("id", "alert-root");
      document.body.appendChild(portalRoot);
    }
    // Also ensure modal-root exists as it's a fallback in the component
    let modalFallbackRoot = document.getElementById("modal-root");
    if (!modalFallbackRoot) {
      modalFallbackRoot = document.createElement("div");
      modalFallbackRoot.setAttribute("id", "modal-root");
      document.body.appendChild(modalFallbackRoot);
    }
  });

  afterEach(() => {
    // Clean up the portal root after each test if it was created by the test
    if (portalRoot && portalRoot.parentElement === document.body) {
      // document.body.removeChild(portalRoot); // Don't remove if it's shared and set up in beforeAll
    }
    // This cleanup is better handled in a global setup (like setupTests.js or Jest's globalSetup/Teardown)
    // or a beforeAll/afterAll in the test suite if consistently needed.
    // For now, we ensure it exists in beforeEach.
  });

  test("renders nothing if no alerts are present", () => {
    const { container } = renderAlertComponent([]);
    // The component returns null, so container.firstChild should not exist
    // or the portal root should be empty if it always renders the container div.
    // Since it portals, we check if the portalRoot itself has children.
    expect(portalRoot.children.length).toBe(0);
    // Or, if the component renders a container div even when empty:
    // const alertContainer = screen.queryByRole('status'); // aria-live="assertive"
    // expect(alertContainer).not.toBeInTheDocument(); // This might fail if the container div is always rendered
  });

  test("renders multiple alerts with correct messages and types", () => {
    renderAlertComponent();

    const successAlert = screen.getByText("Success!");
    expect(successAlert).toBeInTheDocument();
    expect(successAlert.closest("div.alertItem")).toHaveClass("success");

    const errorAlert = screen.getByText("Error occurred.");
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert.closest("div.alertItem")).toHaveClass("error");

    const infoAlert = screen.getByText("Just some info.");
    expect(infoAlert).toBeInTheDocument();
    expect(infoAlert.closest("div.alertItem")).toHaveClass("info");

    const warningAlert = screen.getByText("Warning ahead.");
    expect(warningAlert).toBeInTheDocument();
    expect(warningAlert.closest("div.alertItem")).toHaveClass("warning");
  });

  test("calls removeAlert when an alert's close button is clicked", () => {
    renderAlertComponent([mockAlerts[0]]); // Render with only the first alert

    const closeButton = screen.getByRole("button", { name: "Zamknij alert" });
    fireEvent.click(closeButton);

    expect(mockRemoveAlert).toHaveBeenCalledTimes(1);
    expect(mockRemoveAlert).toHaveBeenCalledWith("alert1");
  });

  test("renders into fallback container if specific portal root is not found initially", () => {
    // Temporarily remove the 'alert-root' to test fallback
    const tempAlertRoot = document.getElementById("alert-root");
    if (tempAlertRoot) tempAlertRoot.remove();

    // modal-root should still exist as the fallback
    renderAlertComponent([mockAlerts[0]]);
    expect(screen.getByText("Success!")).toBeInTheDocument(); // Alert still renders

    // Restore for other tests if needed, though beforeEach handles creation
    if (tempAlertRoot) document.body.appendChild(tempAlertRoot);
  });
});
