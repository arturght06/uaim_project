import React from "react";
import { Link as RouterLink, NavLink as RouterNavLink } from "react-router-dom";
import styles from "./AppLink.module.css";

const AppLink = ({
  to,
  children,
  className = "",
  variant = "default",
  external = false,
  nav = false, // Use NavLink for active class styling
  ...linkProps // Collect rest of the props for the underlying link component
}) => {
  const combinedClassName = `${styles.appLink} ${
    styles[variant] || styles.default
  } ${className}`.trim();

  if (
    external ||
    to.startsWith("http://") ||
    to.startsWith("https://") ||
    to.startsWith("mailto:") ||
    to.startsWith("tel:")
  ) {
    return (
      <a
        href={to}
        className={combinedClassName}
        target="_blank" // Open external links in a new tab
        rel="noopener noreferrer" // Security measure for external links
        {...linkProps}
      >
        {children}
      </a>
    );
  }

  if (nav) {
    return (
      <RouterNavLink
        to={to}
        className={({ isActive }) =>
          `${combinedClassName} ${isActive ? styles.active : ""}`.trim()
        }
        {...linkProps}
      >
        {children}
      </RouterNavLink>
    );
  }

  return (
    <RouterLink to={to} className={combinedClassName} {...linkProps}>
      {children}
    </RouterLink>
  );
};

export default AppLink;
