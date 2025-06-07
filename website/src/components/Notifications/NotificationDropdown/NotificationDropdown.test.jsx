import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; // NotificationItem might use Link or AppLink
import "@testing-library/jest-dom";
import NotificationDropdown from "./NotificationDropdown";

// Mock NotificationItem to prevent testing its internals here
// and to simplify props needed by it if they are complex (e.g., functions)
const mockOnMarkAsSeen = jest.fn();
const mockFetchNotifications = jest.fn();

jest.mock("../NotificationItem/NotificationItem", () =>
  jest.fn(({ notification, onMarkAsSeen }) => (
    <div
      data-testid={`notification-item-${notification.id}`}
      onClick={onMarkAsSeen}
    >
      {notification.title} - {notification.content}
    </div>
  ))
);

const mockNotifications = [
  {
    id: "n1",
    title: "Nowe Wydarzenie",
    content: "Zobacz nowe wydarzenie w Twojej okolicy!",
    created_at: "2023-01-01T10:00:00Z",
    status: "unread",
    type: "info",
  },
  {
    id: "n2",
    title: "Rezerwacja Potwierdzona",
    content: "Twoja rezerwacja na koncert została potwierdzona.",
    created_at: "2023-01-02T11:00:00Z",
    status: "seen",
    type: "success",
  },
];

const renderDropdown = (props = {}) => {
  const defaultProps = {
    notifications: mockNotifications,
    isLoading: false,
    onMarkAsSeen: mockOnMarkAsSeen,
    fetchNotifications: mockFetchNotifications,
    // onClose is commented out in the component, so not passing it unless it's used
  };
  return render(
    <MemoryRouter>
      {" "}
      {/* In case NotificationItem or future links are used */}
      <NotificationDropdown {...defaultProps} {...props} />
    </MemoryRouter>
  );
};

describe("NotificationDropdown Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders header and list of notifications", () => {
    renderDropdown();
    expect(
      screen.getByRole("heading", { name: "Powiadomienia" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("notification-item-n1")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Nowe Wydarzenie - Zobacz nowe wydarzenie w Twojej okolicy!"
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("notification-item-n2")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Rezerwacja Potwierdzona - Twoja rezerwacja na koncert została potwierdzona."
      )
    ).toBeInTheDocument();
  });

  test("displays loading message when isLoading is true", () => {
    renderDropdown({ isLoading: true, notifications: [] }); // Pass empty notifications to isolate loading
    expect(screen.getByText("Ładowanie powiadomień...")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Powiadomienia" })
    ).not.toBeInTheDocument();
  });

  test('displays "no notifications" message when notifications array is empty', () => {
    renderDropdown({ notifications: [] });
    expect(screen.getByText("Brak nowych powiadomień.")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Powiadomienia" })
    ).not.toBeInTheDocument(); // The component hides the header too
  });

  test('displays "no notifications" message when notifications prop is null or undefined', () => {
    const { rerender } = renderDropdown({ notifications: null });
    expect(screen.getByText("Brak nowych powiadomień.")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <NotificationDropdown
          notifications={undefined}
          isLoading={false}
          onMarkAsSeen={jest.fn()}
          fetchNotifications={jest.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.getByText("Brak nowych powiadomień.")).toBeInTheDocument();
  });

  //   test("passes onMarkAsSeen and fetchNotifications to NotificationItem components", () => {
  //     renderDropdown();

  //     const firstNotificationItem = screen.getByTestId("notification-item-n1");
  //     fireEvent.click(firstNotificationItem);
  //     expect(mockOnMarkAsSeen).toHaveBeenCalledTimes(1);
  //     expect(
  //       jest.requireMock("../NotificationItem/NotificationItem")
  //     ).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         notification: mockNotifications[0],
  //         fetchNotifications: mockFetchNotifications,
  //       }),
  //       {}
  //     );
  //   });
});
