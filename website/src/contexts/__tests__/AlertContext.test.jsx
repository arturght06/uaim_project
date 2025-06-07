import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AlertProvider, useAlert } from "../AlertContext";

const AlertConsumerComponent = ({ action, message, type, duration }) => {
  const { showAlert } = useAlert();
  return (
    <button
      onClick={() => {
        if (action === "show") showAlert(message, type, duration);
      }}
    >
      Perform Action
    </button>
  );
};

const ComponentWithoutProvider = () => {
  useAlert();
  return <div>Will not render</div>;
};

describe("AlertContext", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test("useAlert throws an error when used outside of AlertProvider", () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    expect(() => render(<ComponentWithoutProvider />)).toThrow(
      "useAlert must be used within an AlertProvider"
    );
    console.error = originalConsoleError;
  });

  test("showAlert adds an alert that auto-removes after defaultTimeout", () => {
    const defaultTimeout = 3000;
    render(
      <AlertProvider defaultTimeout={defaultTimeout}>
        <AlertConsumerComponent
          action="show"
          message="Auto Default"
          type="success"
        />
        {/* Render alerts for assertion */}
        <AlertDisplayComponent />
      </AlertProvider>
    );

    fireEvent.click(screen.getByText("Perform Action"));
    expect(screen.getByText("Auto Default")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(defaultTimeout);
    });
    expect(screen.queryByText("Auto Default")).not.toBeInTheDocument();
  });

  test("showAlert adds an alert that auto-removes after specified duration", () => {
    const customDuration = 1500;
    render(
      <AlertProvider>
        <AlertConsumerComponent
          action="show"
          message="Auto Custom"
          type="warning"
          duration={customDuration}
        />
        <AlertDisplayComponent />
      </AlertProvider>
    );

    fireEvent.click(screen.getByText("Perform Action"));
    expect(screen.getByText("Auto Custom")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(customDuration);
    });
    expect(screen.queryByText("Auto Custom")).not.toBeInTheDocument();
  });

  test("showAlert does not auto-remove if duration is 0", () => {
    render(
      <AlertProvider defaultTimeout={100}>
        <AlertConsumerComponent
          action="show"
          message="No Auto Remove (0)"
          type="error"
          duration={0}
        />
        <AlertDisplayComponent />
      </AlertProvider>
    );
    fireEvent.click(screen.getByText("Perform Action"));
    expect(screen.getByText("No Auto Remove (0)")).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.getByText("No Auto Remove (0)")).toBeInTheDocument();
  });

  test("showAlert does not auto-remove if duration is negative", () => {
    render(
      <AlertProvider defaultTimeout={100}>
        <AlertConsumerComponent
          action="show"
          message="No Auto Remove (-1)"
          type="error"
          duration={-100}
        />
        <AlertDisplayComponent />
      </AlertProvider>
    );
    fireEvent.click(screen.getByText("Perform Action"));
    expect(screen.getByText("No Auto Remove (-1)")).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.getByText("No Auto Remove (-1)")).toBeInTheDocument();
  });

  test("multiple alerts are managed correctly", () => {
    let capturedAlerts;
    let capturedShowAlert;
    let capturedRemoveAlert;

    const MultiAlertManager = () => {
      const context = useAlert();
      capturedAlerts = context.alerts;
      capturedShowAlert = context.showAlert;
      capturedRemoveAlert = context.removeAlert;
      return (
        <div>
          {capturedAlerts.map((alert) => (
            <div key={alert.id}>{alert.message}</div>
          ))}
        </div>
      );
    };

    render(
      <AlertProvider>
        <MultiAlertManager />
      </AlertProvider>
    );

    let id1, id2, id3;
    act(() => {
      id1 = capturedShowAlert("Alert One", "info", null);
    });
    act(() => {
      id2 = capturedShowAlert("Alert Two", "success", 1000);
    });
    act(() => {
      id3 = capturedShowAlert("Alert Three", "error", null);
    });

    expect(screen.getByText("Alert One")).toBeInTheDocument();
    expect(screen.getByText("Alert Two")).toBeInTheDocument();
    expect(screen.getByText("Alert Three")).toBeInTheDocument();
    expect(capturedAlerts).toHaveLength(3);

    act(() => {
      capturedRemoveAlert(id2);
    });
    expect(screen.queryByText("Alert Two")).not.toBeInTheDocument();
    expect(capturedAlerts).toHaveLength(2);

    act(() => {
      jest.advanceTimersByTime(1000);
    }); // Time for id2 to have auto-removed (it was manually)
    expect(screen.queryByText("Alert Two")).not.toBeInTheDocument(); // Still removed
    expect(capturedAlerts).toHaveLength(2); // id1 and id3 should remain
    expect(screen.getByText("Alert One")).toBeInTheDocument();
    expect(screen.getByText("Alert Three")).toBeInTheDocument();
  });
});

// Helper to display alerts for assertion
const AlertDisplayComponent = () => {
  const { alerts } = useAlert();
  return (
    <>
      {alerts.map((alert) => (
        <div key={alert.id} data-testid={`displayed-alert-${alert.id}`}>
          {alert.message}
        </div>
      ))}
    </>
  );
};
