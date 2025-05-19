import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p>© {currentYear} Portal Wydarzeń Kulturalnych. Wszelkie prawa zastrzeżone.</p>
      </div>
    </footer>
  );
};

export default Footer;