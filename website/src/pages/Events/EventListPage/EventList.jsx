import React from 'react';
import styles from './EventList.module.css';

const EventList = () => {
  return (
    <div className={styles.container}>
      <h2>Lista Wydarzeń</h2>
      <p>Przeglądaj dostępne wydarzenia kulturalne.</p>
    </div>
  );
};

export default EventList;
