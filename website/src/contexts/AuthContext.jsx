import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { getUser as fetchUserServer } from "../services/user";
import {
  logout as logoutServiceCall,
  tryLogin as tryLoginServiceCall,
} from "../services/login";
import {
  getUserNotificationsById,
  markNotificationAsSeen as markAsSeenService,
} from "../services/notification";

/**
 * Provides and updates the current user's data and notifications for the whole app,
 * abstracting the authentication behind it.
 */
export const AuthContext = createContext(null);

/**
 * Custom hook to access the AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  /**
   * Fetches notifications for the current user
   */
  const fetchNotifications = useCallback(async (userId) => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    setIsLoadingNotifications(true);
    try {
      const userNotifications = await getUserNotificationsById(userId);
      setNotifications(userNotifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  /**
   * Checks authentication status by verifying token and user ID in localStorage
   */
  const checkUserStatus = useCallback(async () => {
    console.log("AuthProvider: Checking user status...");
    setIsLoadingAuth(true);
    let fetchedUserData = null;

    try {
      const token = localStorage.getItem("accessToken");
      const userUUID = localStorage.getItem("userUUID");

      if (token && userUUID) {
        const userFromServer = await fetchUserServer(userUUID);
        if (userFromServer) {
          if (userFromServer.phone_number === "None")
            userFromServer.phone_number = null;
          if (userFromServer.phone_country_code === "None")
            userFromServer.phone_country_code = null;

          setCurrentUser(userFromServer);
          fetchedUserData = userFromServer;

          console.log("AuthProvider: User found:", userFromServer);
        } else {
          setCurrentUser(null);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userUUID");

          console.log("AuthProvider: Invalid token/UUID, session cleared.");
        }
      } else {
        setCurrentUser(null);
        console.log("AuthProvider: No token or UUID in localStorage.");
      }
    } catch (error) {
      console.error("AuthProvider: Error fetching user status:", error);
      setCurrentUser(null);
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userUUID");
      }
    } finally {
      setIsLoadingAuth(false);
      if (fetchedUserData?.id) {
        fetchNotifications(fetchedUserData.id);
      } else {
        setNotifications([]);
      }
    }
  }, [fetchNotifications]);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  /**
   * Attempts login and updates user and notifications
   */
  const login = async (loginFormData) => {
    setIsLoadingAuth(true);
    try {
      const userData = await tryLoginServiceCall(loginFormData);
      setCurrentUser(userData);
      fetchNotifications(userData.id);
      setIsLoadingAuth(false);
      return userData;
    } catch (error) {
      console.error("AuthProvider: Login failed:", error);
      setCurrentUser(null);
      setNotifications([]);
      setIsLoadingAuth(false);
      throw error;
    }
  };

  /**
   * Logs out user and clears local storage and state
   */
  const logout = async () => {
    try {
      await logoutServiceCall();
    } catch (error) {
      console.error("AuthProvider: Logout error (ignored):", error);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userUUID");
    setCurrentUser(null);
    setNotifications([]);
    console.log("AuthProvider: Logged out.");
  };

  /**
   * Marks a notification as seen (optimistically updates UI)
   */
  const markNotificationAsSeen = async (notificationId) => {
    const originalNotifications = [...notifications];
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, seen: true } : n))
    );

    try {
      await markAsSeenService(notificationId);
    } catch (error) {
      console.error("Error marking notification as seen:", error);
      setNotifications(originalNotifications);
      throw error;
    }
  };

  const unreadNotificationsCount = notifications.filter(
    (n) => n.status !== "seen"
  ).length;

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoadingAuth,
    tryLogin: login,
    logout,
    refreshAuthStatus: checkUserStatus,
    notifications,
    isLoadingNotifications,
    fetchNotifications: () => currentUser && fetchNotifications(currentUser.id),
    markNotificationAsSeen,
    unreadNotificationsCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
