import React from 'react';
import styles from './Reservations.module.css';

const Reservations = () => {
  return (
    <div className={styles.container}>
      <h2>Moje Rezerwacje</h2>
      <p>Tutaj znajdziesz listę swoich zarezerwowanych wydarzeń.</p>
    </div>
  );
};

export default Reservations;
