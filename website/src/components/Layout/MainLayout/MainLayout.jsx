import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.mainContent}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;