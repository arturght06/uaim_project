import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import { AuthContext } from "../../../contexts/AuthContext";
import Button from "../../UI/Button/Button";

const Navbar = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  const [showSolidBackground, setShowSolidBackground] = useState(!isHomePage);

  useEffect(() => {
    const handleStateChange = () => {
      if (isHomePage) {
        setShowSolidBackground(window.scrollY > 200);
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
              <img
                src="/logo-long.png"
                alt="Logo"
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
                  <span className={styles.linkText}>Mój profil</span>
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <Link to="/">
                  <Button onClick={auth.logout} variant="danger">
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
