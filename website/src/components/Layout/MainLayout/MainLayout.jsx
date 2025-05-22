import React from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import styles from "./MainLayout.module.css";
import { useLocation } from "react-router-dom";

const MainLayout = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isHomePageCurrent = currentPath === "/";

  const mainContentBaseClasses = [
    styles.mainContent,
    isHomePageCurrent
      ? styles.mainContentHomePage
      : styles.mainContentOtherPages,
  ];
  const mainContentClasses = mainContentBaseClasses.join(" ");

  const innerContainerBaseClasses = [
    styles.container,
    isHomePageCurrent ? styles.containerHomePage : styles.containerOtherPages,
  ];
  const innerContainerClasses = innerContainerBaseClasses.join(" ");

  return (
    <div className={styles.layout}>
      <Navbar />

      <main className={mainContentClasses}>
        <div className={innerContainerClasses}>{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
