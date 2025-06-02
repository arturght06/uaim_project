import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import Button from "../../UI/Button/Button";
import NotificationDropdown from "../../Notifications/NotificationDropdown/NotificationDropdown";

const Navbar = () => {
  const auth = useAuth();
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  const [showSolidBackground, setShowSolidBackground] = useState(!isHomePage);

  useEffect(() => {
    const handleStateChange = () => {
      if (isHomePage) {
        setShowSolidBackground(window.scrollY > 50);
      } else {
        setShowSolidBackground(true);
      }
    };

    handleStateChange();

    if (isHomePage) {
      window.addEventListener("scroll", handleStateChange);
      return () => window.removeEventListener("scroll", handleStateChange);
    }
  }, [location.pathname, isHomePage]);

  const navbarComputedClasses = `
    ${styles.navbar}
    ${
      isHomePage && !showSolidBackground
        ? styles.navbarTransparentState
        : styles.navbarSolidState
    }
  `;
  const backgroundSliderClass = showSolidBackground
    ? styles.backgroundVisible
    : styles.backgroundHidden;

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationIconRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target) &&
        notificationIconRef.current &&
        !notificationIconRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleMarkAsSeenAndCloseDropdown = async (notificationId) => {
    try {
      await auth.markNotificationAsSeen(notificationId);
      auth.fetchNotifications();
    } catch (error) {
      console.error("Navbar: Error marking notification as seen", error);
    }
    // setShowNotifications(false);
  };

  if (auth.isLoadingAuth) {
    return (
      <nav
        className={`${styles.navbar} ${styles.navbarSolidState} ${styles.noTransition}`}
      >
        {" "}
        <div className={styles.container}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link to="/" className={styles.brand}>
                <img
                  src="/logo-long.png"
                  alt="Logo EVE.NT"
                  className={styles.logoLong}
                />
              </Link>
            </li>
          </ul>
          <div className={styles.loadingAuth}>Ładowanie...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`${navbarComputedClasses} ${backgroundSliderClass}`}>
      <div className={styles.container}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link to="/" className={styles.brand}>
              <img
                src="/logo-long.png"
                alt="Logo EVE.NT"
                className={styles.logoLong}
              />
            </Link>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              <span className="material-symbols-outlined">home</span>
              <span className={styles.linkText}>Strona Główna</span>
            </NavLink>
          </li>
        </ul>

        <ul className={styles.navList}>
          {auth.isAuthenticated ? (
            <>
              {auth.currentUser && (
                <li className={styles.navItem}>
                  <span className={styles.userName}>
                    Witaj, {auth.currentUser.name || auth.currentUser.username}!
                  </span>
                </li>
              )}
              <li className={styles.navItem}>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                >
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
                  <span className={styles.linkText}>Mój Profil</span>
                </NavLink>
              </li>

              <li
                className={`${styles.navItem} ${styles.notificationNavItem}`}
                ref={notificationIconRef}
              >
                <button
                  onClick={toggleNotifications}
                  className={styles.iconButton}
                  aria-label="Powiadomienia"
                >
                  <span className="material-symbols-outlined">
                    {auth.unreadNotificationsCount > 0
                      ? "notifications_active"
                      : "notifications"}
                  </span>
                  {auth.unreadNotificationsCount > 0 && (
                    <span className={styles.notificationBadge}>
                      {auth.unreadNotificationsCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div ref={notificationDropdownRef}>
                    <NotificationDropdown
                      notifications={auth.notifications}
                      isLoading={auth.isLoadingNotifications}
                      onMarkAsSeen={handleMarkAsSeenAndCloseDropdown}
                      fetchNotifications={auth.fetchNotifications}
                      onClose={() => setShowNotifications(false)}
                    />
                  </div>
                )}
              </li>

              <li className={styles.navItem}>
                <Link
                  to="/login"
                  onClick={async () => {
                    await auth.logout();
                  }}
                >
                  <Button variant="danger" className={styles.navButtonSpecial}>
                    {" "}
                    <span className="material-symbols-outlined">logout</span>
                    <span className={styles.linkText}>Wyloguj</span>
                  </Button>
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className={styles.navItem}>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                >
                  <span className="material-symbols-outlined">login</span>
                  <span className={styles.linkText}>Logowanie</span>
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                >
                  <span className="material-symbols-outlined">how_to_reg</span>
                  <span className={styles.linkText}>Rejestracja</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
