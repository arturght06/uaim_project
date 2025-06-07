import React, { createContext, useState, useCallback, useContext } from "react";

let alertIdCounter = 0;

export const AlertContext = createContext(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children, defaultTimeout = 5000 }) => {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((idToRemove) => {
    setAlerts((prevAlerts) =>
      prevAlerts.filter((alert) => alert.id !== idToRemove)
    );
  }, []);

  const showAlert = useCallback(
    (message, type = "info", duration = defaultTimeout) => {
      const id = alertIdCounter++;
      const newAlert = { id, message, type, duration };

      setAlerts((prevAlerts) => [...prevAlerts, newAlert]);

      if (duration !== null && duration > 0) {
        setTimeout(() => {
          removeAlert(id);
        }, duration);
      }
      return id;
    },
    [defaultTimeout, removeAlert]
  );

  const value = {
    alerts,
    showAlert,
    removeAlert,
  };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};
