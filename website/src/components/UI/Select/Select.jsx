import React from "react";
import styles from "./Select.module.css";

const Select = ({
  label,
  name,
  value,
  onChange,
  error,
  options = [],
  defaultOptionText = "Wybierz...",
  className = "",
  disabled = false,
  required = false,
  ...props
}) => {
  const selectId = name || `select-${Math.random().toString(36).substr(2, 9)}`;
  const selectClasses = `
    ${styles.select}
    ${error ? styles.errorSelect : ""}
    ${className}
  `.trim();

  return (
    <div className={styles.selectGroup}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.requiredIndicator}>*</span>}
        </label>
      )}
      <div className={styles.selectWrapper}>
        {" "}
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          className={selectClasses}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {defaultOptionText && <option value="">{defaultOptionText}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.selectArrow}></span>{" "}
      </div>
      {error && (
        <p
          id={`${selectId}-error`}
          className={styles.errorMessage}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
