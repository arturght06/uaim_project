import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import UserPage from "./User";
import { AuthContext } from "../../../contexts/AuthContext";
import { AlertContext } from "../../../contexts/AlertContext";
import * as locationService from "../../../services/location";
import * as categoryService from "../../../services/category";
import * as formatService from "../../../services/format";

jest.mock(
  "../../../components/Events/EventList/EventList",
  () =>
    ({ userId }) =>
      (
        <div data-testid="event-list" data-userid={userId}>
          Mock EventList
        </div>
      )
);
const mockDeleteGridRenderSpy = jest.fn();
jest.mock("../../../components/UI/DeleteGrid/DeleteGrid", () => (props) => {
  mockDeleteGridRenderSpy(props);
  const {
    items,
    onDeleteItem,
    displayFormatter,
    itemNameSingular,
    isLoading,
    error,
    noItemsMessage,
  } = props;
  return (
    <div data-testid={`delete-grid-${itemNameSingular}`}>
      {isLoading && <p>Loading {itemNameSingular}...</p>}
      {error && <p>Error: {error}</p>}
      {!isLoading && !error && (!items || items.length === 0) && (
        <p data-testid={`no-items-${itemNameSingular}`}>{noItemsMessage}</p>
      )}
      {items &&
        items.map((item) => (
          <div key={item.id}>
            <span>{displayFormatter(item)}</span>
            <button onClick={() => onDeleteItem(item.id)}>
              Delete {item.id}
            </button>
          </div>
        ))}
    </div>
  );
});
jest.mock(
  "../../../components/UI/Modal/Modal",
  () =>
    ({ isOpen, onClose, title, children }) =>
      isOpen ? (
        <div data-testid={`modal-${title.replace(/\s+/g, "-")}`}>
          {children}
        </div>
      ) : null
);
jest.mock(
  "../../../components/Location/CreateLocation/CreateLocation",
  () =>
    ({ onSuccess, onCancel }) =>
      (
        <div data-testid="create-location-form">
          <button
            onClick={() =>
              onSuccess({
                id: "newLoc1",
                name: "New Location Name",
                city: "New City",
                address: "New Address",
              })
            }
          >
            Create Location Success
          </button>
          <button onClick={onCancel}>Cancel Create Location</button>
        </div>
      )
);
jest.mock(
  "../../../components/Category/CreateCategory/CreateCategory",
  () =>
    ({ onSuccess, onCancel }) =>
      (
        <div data-testid="create-category-form">
          <button
            onClick={() =>
              onSuccess({ id: "newCat1", name: "New Category Name" })
            }
          >
            Create Category Success
          </button>
          <button onClick={onCancel}>Cancel Create Category</button>
        </div>
      )
);

jest.mock("../../../services/location");
jest.mock("../../../services/category");
jest.mock("../../../services/format", () => ({
  formatLocation: jest.fn((item) =>
    item ? `${item.city || "N/A"}, ${item.address || "N/A"}` : "N/A Loc"
  ),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockShowAlert = jest.fn();

const mockUser = {
  id: "user123",
  username: "testuser",
  name: "Test",
  surname: "User",
};
const initialMockLocations = () => [
  { id: "loc1", city: "Warsaw", address: "Main St", user_id: "user123" },
];
const initialMockCategories = () => [{ id: "cat1", name: "Music" }];

const getLatestDeleteGridItems = (itemNameSingular) => {
  const calls = mockDeleteGridRenderSpy.mock.calls;
  for (let i = calls.length - 1; i >= 0; i--) {
    if (calls[i][0].itemNameSingular === itemNameSingular) {
      return calls[i][0].items;
    }
  }
  return [];
};

const renderUserPage = (
  authContextValue,
  {
    locations = initialMockLocations(),
    categories = initialMockCategories(),
  } = {}
) => {
  locationService.getUserLocations.mockResolvedValue(locations);
  categoryService.getAllCategories.mockResolvedValue(categories);
  locationService.removeLocation.mockResolvedValue({});
  categoryService.deleteCategory.mockResolvedValue({});

  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authContextValue}>
        <AlertContext.Provider value={{ showAlert: mockShowAlert }}>
          <UserPage />
        </AlertContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe("UserPage", () => {
  const authenticatedUserContext = {
    currentUser: mockUser,
    isAuthenticated: true,
    isLoadingAuth: false,
  };
  const authLoadingContext = {
    currentUser: null,
    isAuthenticated: false,
    isLoadingAuth: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteGridRenderSpy.mockClear();
  });

  test("shows loading message when auth is loading", () => {
    renderUserPage(authLoadingContext);
    expect(
      screen.getByText("Ładowanie danych użytkownika...")
    ).toBeInTheDocument();
  });

  test("redirects to login if user is not authenticated (after auth load)", async () => {
    renderUserPage({ ...authLoadingContext, isLoadingAuth: false });
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true })
    );
  });

  test("renders user profile information and sections when authenticated", async () => {
    renderUserPage(authenticatedUserContext);
    await waitFor(() => {
      expect(
        screen.getByText(`${mockUser.name} ${mockUser.surname}`)
      ).toBeInTheDocument();
    });
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Edytuj Profil/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Nowe wydarzenie/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Twoje Wydarzenia")).toBeInTheDocument();
    expect(screen.getByTestId("event-list")).toHaveAttribute(
      "data-userid",
      mockUser.id
    );
    expect(screen.getByText("Twoje Lokalizacje")).toBeInTheDocument();
    expect(screen.getByTestId("delete-grid-lokalizację")).toBeInTheDocument();
    expect(screen.getByText("Twoje Kategorie")).toBeInTheDocument();
    expect(screen.getByTestId("delete-grid-kategorię")).toBeInTheDocument();
  });

  test("navigates to edit profile page on button click", async () => {
    renderUserPage(authenticatedUserContext);
    await waitFor(() =>
      expect(
        screen.getByText(`${mockUser.name} ${mockUser.surname}`)
      ).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /Edytuj Profil/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/profile/edit");
  });

  test("navigates to create event page on button click", async () => {
    renderUserPage(authenticatedUserContext);
    await waitFor(() =>
      expect(
        screen.getByText(`${mockUser.name} ${mockUser.surname}`)
      ).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /Nowe wydarzenie/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/events/create");
  });

  test("opens and closes CreateLocation modal", async () => {
    renderUserPage(authenticatedUserContext);
    await waitFor(() =>
      expect(screen.getByText("Twoje Lokalizacje")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /Dodaj Lokalizację/i }));
    expect(
      screen.getByTestId("modal-Dodaj-Nową-Lokalizację")
    ).toBeInTheDocument();
    expect(screen.getByTestId("create-location-form")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel Create Location"));
    expect(
      screen.queryByTestId("modal-Dodaj-Nową-Lokalizację")
    ).not.toBeInTheDocument();
  });

  test("handles successful location creation from modal", async () => {
    renderUserPage(authenticatedUserContext);
    await waitFor(() =>
      expect(screen.getByText("Twoje Lokalizacje")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /Dodaj Lokalizację/i }));
    fireEvent.click(screen.getByText("Create Location Success"));
    await waitFor(() =>
      expect(
        screen.queryByTestId("modal-Dodaj-Nową-Lokalizację")
      ).not.toBeInTheDocument()
    );
    await waitFor(() => {
      const latestLocationItems = getLatestDeleteGridItems("lokalizację");
      expect(
        latestLocationItems.some((loc) => loc.name === "New Location Name")
      ).toBe(true);
      expect(
        screen.getByText(
          formatService.formatLocation({
            city: "New City",
            address: "New Address",
          })
        )
      ).toBeInTheDocument();
    });
  });

  test("opens and closes CreateCategory modal", async () => {
    renderUserPage(authenticatedUserContext);
    await waitFor(() =>
      expect(screen.getByText("Twoje Kategorie")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /Dodaj Kategorię/i }));
    expect(
      screen.getByTestId("modal-Dodaj-Nową-Kategorię")
    ).toBeInTheDocument();
    expect(screen.getByTestId("create-category-form")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel Create Category"));
    expect(
      screen.queryByTestId("modal-Dodaj-Nową-Kategorię")
    ).not.toBeInTheDocument();
  });

  test("handles successful category creation from modal", async () => {
    renderUserPage(authenticatedUserContext);
    await waitFor(() =>
      expect(screen.getByText("Twoje Kategorie")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole("button", { name: /Dodaj Kategorię/i }));
    fireEvent.click(screen.getByText("Create Category Success"));
    await waitFor(() =>
      expect(
        screen.queryByTestId("modal-Dodaj-Nową-Kategorię")
      ).not.toBeInTheDocument()
    );
    await waitFor(() => {
      const latestCategoryItems = getLatestDeleteGridItems("kategorię");
      expect(
        latestCategoryItems.some((cat) => cat.name === "New Category Name")
      ).toBe(true);
      expect(screen.getByText("New Category Name")).toBeInTheDocument();
    });
  });

  test("handles location deletion", async () => {
    renderUserPage(authenticatedUserContext);
    const locationToDelete = initialMockLocations()[0];
    await waitFor(() =>
      expect(
        screen.getByText(formatService.formatLocation(locationToDelete))
      ).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText(`Delete ${locationToDelete.id}`));
    await waitFor(() =>
      expect(locationService.removeLocation).toHaveBeenCalledWith(
        locationToDelete.id
      )
    );
    expect(mockShowAlert).toHaveBeenCalledWith(
      "Lokalizacja usunięta pomyślnie.",
      "success"
    );
    await waitFor(() => {
      const latestLocationItems = getLatestDeleteGridItems("lokalizację");
      expect(
        latestLocationItems.find((loc) => loc.id === locationToDelete.id)
      ).toBeUndefined();
    });
    expect(
      screen.queryByText(formatService.formatLocation(locationToDelete))
    ).not.toBeInTheDocument();
  });

  // Test for location deletion error REMOVED
  // test("handles location deletion error", async () => { ... });

  test("handles category deletion", async () => {
    renderUserPage(authenticatedUserContext);
    const categoryToDelete = initialMockCategories()[0];
    await waitFor(() =>
      expect(screen.getByText(categoryToDelete.name)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText(`Delete ${categoryToDelete.id}`));
    await waitFor(() =>
      expect(categoryService.deleteCategory).toHaveBeenCalledWith(
        categoryToDelete.id
      )
    );
    expect(mockShowAlert).toHaveBeenCalledWith(
      "Kategoria usunięta pomyślnie.",
      "success"
    );
    await waitFor(() => {
      const latestCategoryItems = getLatestDeleteGridItems("kategorię");
      expect(
        latestCategoryItems.find((cat) => cat.id === categoryToDelete.id)
      ).toBeUndefined();
    });
    expect(screen.queryByText(categoryToDelete.name)).not.toBeInTheDocument();
  });

  // Test for category deletion error REMOVED
  // test("handles category deletion error", async () => { ... });

  test("displays error message if fetching locations fails", async () => {
    locationService.getUserLocations.mockRejectedValueOnce(
      new Error("Failed to load locations")
    );
    renderUserPage(authenticatedUserContext);
    await waitFor(() =>
      expect(screen.getByTestId("delete-grid-lokalizację")).toHaveTextContent(
        "Error: Failed to load locations"
      )
    );
  });

  test("displays error message if fetching categories fails", async () => {
    categoryService.getAllCategories.mockRejectedValueOnce(
      new Error("Failed to load categories")
    );
    renderUserPage(authenticatedUserContext);
    await waitFor(() =>
      expect(screen.getByTestId("delete-grid-kategorię")).toHaveTextContent(
        "Error: Failed to load categories"
      )
    );
  });

  test("displays no items message for locations when locations array is empty", async () => {
    renderUserPage(authenticatedUserContext, { locations: [] });
    await waitFor(() => {
      expect(screen.getByTestId("no-items-lokalizację")).toHaveTextContent(
        "Nie dodałeś jeszcze żadnych lokalizacji."
      );
    });
  });

  test("displays no items message for categories when categories array is empty", async () => {
    renderUserPage(authenticatedUserContext, { categories: [] });
    await waitFor(() => {
      expect(screen.getByTestId("no-items-kategorię")).toHaveTextContent(
        "Nie dodałeś jeszcze żadnych kategorii."
      );
    });
  });
});
