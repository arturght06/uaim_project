import React, { createContext, useState, useEffect, useCallback } from "react";
import { getUser } from "../services/user";
import { logout, tryLogin } from "../services/login";

/**
 * Provides and updates the current user's data for the whole app, abstracting the authentication behind it
 */
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const checkUserStatus = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      let uuid = localStorage.getItem("userUUID");
      const user = await getUser(uuid);
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error fetching user status:", error);
      setCurrentUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      checkUserStatus();
    } else {
      setIsLoadingAuth(false);
      setCurrentUser(null);
    }
  }, [checkUserStatus]);

  const context_login = async (formData) => {
    let userData = await tryLogin(formData);
    setCurrentUser(userData);
  };

  const context_logout = async () => {
    logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoadingAuth,
    tryLogin: context_login,
    logout: context_logout,
    refreshAuthStatus: checkUserStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
