import React from 'react';
import styles from './Input.module.css';

const Input = ({ label, type = 'text', value, onChange, placeholder, name, error }) => {
  const inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={styles.inputGroup}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        className={`${styles.input} ${error ? styles.errorInput : ''}`}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default Input;