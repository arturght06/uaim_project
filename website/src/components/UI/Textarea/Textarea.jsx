import React from "react";
import styles from "./Textarea.module.css";

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  rows = 4,
  className = "",
  disabled = false,
  required = false,
  ...props
}) => {
  const inputId = name || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const textareaClasses = `
    ${styles.textarea}
    ${error ? styles.errorTextarea : ""}
    ${className}
  `.trim();

  return (
    <div className={styles.textareaGroup}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.requiredIndicator}>*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={textareaClasses}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;
