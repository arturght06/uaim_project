import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  // Assume logged in
  const isAuthenticated = false;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          Portal Wydarzeń
        </Link>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              Strona Główna
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/events"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              Wydarzenia
            </NavLink>
          </li>
          {isAuthenticated ? (
            <>
              <li className={styles.navItem}>
                <NavLink
                  to="/my-reservations"
                  className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                >
                  Moje Rezerwacje
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <button onClick={() => console.log('Logout clicked')} className={`${styles.navLink} ${styles.navButton}`}>
                  Wyloguj
                </button>
              </li>
            </>
          ) : (
            <>
              <li className={styles.navItem}>
                <NavLink
                  to="/login"
                  className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                >
                  Logowanie
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink
                  to="/register"
                  className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
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