import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import NotificationItem from "./NotificationItem";
import * as formatService from "../../../services/format";
import * as notificationService from "../../../services/notification";

jest.mock("../../../services/format", () => ({
  formatDate: jest.fn((date) => (date ? `formatted-${date}` : "Date Unknown")),
}));

jest.mock("../../../services/notification", () => ({
  deleteNotification: jest.fn(),
}));

const mockOnMarkAsSeenGlobal = jest.fn(); // Use a different name for the global mock
const mockFetchNotificationsGlobal = jest.fn();

const baseDefaultNotification = {
  id: "n1",
  title: "Test Title",
  content: "Test content of the notification.",
  created_at: "2023-01-01T12:00:00Z",
  status: "unread",
  type: "info",
};

describe("NotificationItem Component", () => {
  let currentDefaultNotification;

  beforeEach(() => {
    jest.clearAllMocks();
    currentDefaultNotification = { ...baseDefaultNotification };
  });

  const renderNotificationItem = (props = {}) => {
    const notificationData = {
      ...currentDefaultNotification,
      ...(props.notification || {}),
    };
    // Ensure 'id' in notificationData is always defined for testId, fallback if necessary
    const finalNotificationData = {
      ...notificationData,
      id: notificationData.id || currentDefaultNotification.id,
    };

    // Determine the onMarkAsSeen prop: if explicitly passed as undefined, use undefined.
    // Otherwise, use the prop if provided, or default to the global mock.
    let onMarkAsSeenProp = mockOnMarkAsSeenGlobal;
    if (props.hasOwnProperty("onMarkAsSeen")) {
      // Check if the prop was explicitly passed
      onMarkAsSeenProp = props.onMarkAsSeen;
    }

    return render(
      <NotificationItem
        notification={finalNotificationData}
        onMarkAsSeen={onMarkAsSeenProp}
        fetchNotifications={
          props.fetchNotifications !== undefined
            ? props.fetchNotifications
            : mockFetchNotificationsGlobal
        }
      />
    );
  };

  test("renders notification title, content, and formatted date", () => {
    renderNotificationItem();
    expect(
      screen.getByText(currentDefaultNotification.title)
    ).toBeInTheDocument();
    expect(
      screen.getByText(currentDefaultNotification.content)
    ).toBeInTheDocument();
    expect(formatService.formatDate).toHaveBeenCalledWith(
      currentDefaultNotification.created_at
    );
    expect(
      screen.getByText(`formatted-${currentDefaultNotification.created_at}`)
    ).toBeInTheDocument();
  });

  test("renders default content if notification.content is null", () => {
    renderNotificationItem({ notification: { content: null } });
    expect(screen.getByText("Brak treści powiadomienia.")).toBeInTheDocument();
  });

  test("applies correct classes for unread notification and type", () => {
    const { container } = renderNotificationItem({
      notification: { status: "unread", type: "success" },
    });
    const itemDiv = container.firstChild;
    expect(itemDiv).toHaveClass("unseen");
    expect(itemDiv).toHaveClass("success");
    expect(screen.getByTitle("Nieprzeczytane")).toBeInTheDocument();
  });

  test("applies correct classes for seen notification", () => {
    const { container } = renderNotificationItem({
      notification: { status: "seen" },
    });
    const itemDiv = container.firstChild;
    expect(itemDiv).toHaveClass("seen");
    expect(itemDiv).not.toHaveClass("unseen");
    expect(screen.queryByTitle("Nieprzeczytane")).not.toBeInTheDocument();
  });

  test("calls onMarkAsSeen when an unread notification item is clicked", () => {
    renderNotificationItem({
      notification: { status: "unread", id: "unread-click-test" },
    });
    const itemClickable = screen.getByTestId(
      "notification-item-clickable-unread-click-test"
    );
    fireEvent.click(itemClickable);
    expect(mockOnMarkAsSeenGlobal).toHaveBeenCalledTimes(1);
    expect(mockOnMarkAsSeenGlobal).toHaveBeenCalledWith("unread-click-test");
  });

  test("does not call onMarkAsSeen when a seen notification item is clicked", () => {
    renderNotificationItem({
      notification: { status: "seen", id: "seen-click-test" },
    });
    const itemClickable = screen.getByTestId(
      "notification-item-clickable-seen-click-test"
    );
    fireEvent.click(itemClickable);
    expect(mockOnMarkAsSeenGlobal).not.toHaveBeenCalled();
  });

  test("calls deleteNotification and fetchNotifications when delete icon is clicked", async () => {
    notificationService.deleteNotification.mockResolvedValueOnce({});
    renderNotificationItem({ notification: { id: "delete-test" } });
    const deleteIcon = screen.getByText("delete");
    fireEvent.click(deleteIcon);

    expect(notificationService.deleteNotification).toHaveBeenCalledTimes(1);
    expect(notificationService.deleteNotification).toHaveBeenCalledWith(
      "delete-test"
    );
    await waitFor(() =>
      expect(mockFetchNotificationsGlobal).toHaveBeenCalledTimes(1)
    );
  });

  test("handles keyboard interaction (Enter key) for marking as seen", () => {
    renderNotificationItem({
      notification: { status: "unread", id: "enter-key-test" },
    });
    const itemClickable = screen.getByTestId(
      "notification-item-clickable-enter-key-test"
    );
    fireEvent.keyDown(itemClickable, { key: "Enter", code: "Enter" });
    expect(mockOnMarkAsSeenGlobal).toHaveBeenCalledTimes(1);
    expect(mockOnMarkAsSeenGlobal).toHaveBeenCalledWith("enter-key-test");
  });

  test("handles keyboard interaction (Space key) for marking as seen", () => {
    renderNotificationItem({
      notification: { status: "unread", id: "space-key-test" },
    });
    const itemClickable = screen.getByTestId(
      "notification-item-clickable-space-key-test"
    );
    fireEvent.keyDown(itemClickable, { key: " ", code: "Space" });
    expect(mockOnMarkAsSeenGlobal).toHaveBeenCalledTimes(1);
    expect(mockOnMarkAsSeenGlobal).toHaveBeenCalledWith("space-key-test");
  });

  test("does not call global mockOnMarkAsSeen if onMarkAsSeen prop is explicitly undefined", () => {
    renderNotificationItem({
      notification: { status: "unread", id: "no-prop-test" },
      onMarkAsSeen: undefined,
    });
    const itemClickable = screen.getByTestId(
      "notification-item-clickable-no-prop-test"
    );
    fireEvent.click(itemClickable);
    expect(mockOnMarkAsSeenGlobal).not.toHaveBeenCalled();
  });

  test("console.log is called with notification data (for coverage)", () => {
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});
    renderNotificationItem({ notification: { id: "log-test" } });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: "log-test" })
    );
    consoleLogSpy.mockRestore();
  });
});
