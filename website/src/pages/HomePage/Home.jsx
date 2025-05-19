import React from 'react';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.container}>
      <h1>Witaj na Portalu Wydarzeń Kulturalnych!</h1>
      <p>
        Przeglądaj nadchodzące wydarzenia, rezerwuj miejsca i ciesz się kulturą.
      </p>
    </div>
  );
};

export default Home;
