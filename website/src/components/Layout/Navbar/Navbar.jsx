import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import { AuthContext } from "../../../contexts/AuthContext";
import Button from "../../UI/Button/Button";

const Navbar = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  // Controls if the solid background pseudo-element should be visible
  const [showSolidBackground, setShowSolidBackground] = useState(!isHomePage);

  useEffect(() => {
    const handleStateChange = () => {
      if (isHomePage) {
        setShowSolidBackground(window.scrollY > 50); // Scroll threshold for solid background
      } else {
        setShowSolidBackground(true); // Always solid on other pages
      }
    };

    handleStateChange();

    if (isHomePage) {
      window.addEventListener("scroll", handleStateChange);
      return () => window.removeEventListener("scroll", handleStateChange);
    }
  }, [location.pathname, isHomePage]);

  // Determine navbar classes
  const navbarComputedClasses = `
    ${styles.navbar}
    ${
      isHomePage && !showSolidBackground
        ? styles.navbarTransparentState
        : styles.navbarSolidState
    }
  `;
  // Class for the ::before pseudo-element to control its slide
  const backgroundSliderClass = showSolidBackground
    ? styles.backgroundVisible
    : styles.backgroundHidden;

  if (auth.isLoadingAuth) {
    return (
      <nav className={`${styles.navbar} ${styles.navbarSolidState}`}>
        <div className={styles.container}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link to="/" className={styles.brand}>
                EVE.NT
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
              EVE.NT
            </Link>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              Strona Główna
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              Wydarzenia
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
                  to="/reservations"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                >
                  Moje Rezerwacje
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <Link to="/">
                  <Button
                    onClick={auth.logout}
                    variant="secondary"
                    className={styles.navButton}
                  >
                    Wyloguj
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
                  Logowanie
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                >
                  Rejestracja
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
