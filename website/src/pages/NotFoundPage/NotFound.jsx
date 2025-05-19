import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.container}>
      <h1>404</h1>
      <h2>Strona nie została znaleziona</h2>
      <p>Przepraszamy, strona której szukasz nie istnieje.</p>
      <Link to="/" className={styles.homeLink}>
        Wróć na stronę główną
      </Link>
    </div>
  );
};

export default NotFound;
