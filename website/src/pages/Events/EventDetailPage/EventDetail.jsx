import React from 'react';
import { useParams } from 'react-router-dom';
import styles from './EventDetail.module.css';

const EventDetail = () => {
  const { eventId } = useParams();

  return (
    <div className={styles.container}>
      <h2>Szczegóły Wydarzenia</h2>
      <p>Informacje o wydarzeniu ID: {eventId}</p>
    </div>
  );
};

export default EventDetail;
