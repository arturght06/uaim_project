import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import { AuthContext } from "../../../contexts/AuthContext";
import Button from "../../UI/Button/Button";

const Navbar = () => {
  const auth = useContext(AuthContext);

  // Loading authentication - display placeholder
  if (auth.isLoadingAuth) {
    return (
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link to="/" className={styles.brand}>
            Portal Wydarzeń
          </Link>
          <div className={styles.loadingAuth}>Ładowanie...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link to="/" className={styles.brand}>
              Portal Wydarzeń
            </Link>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              Strona Główna
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
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
                    isActive
                      ? `${styles.navLink} ${styles.active}`
                      : styles.navLink
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
                    isActive
                      ? `${styles.navLink} ${styles.active}`
                      : styles.navLink
                  }
                >
                  Logowanie
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navLink} ${styles.active}`
                      : styles.navLink
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
