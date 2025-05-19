import React from 'react';
import styles from './Login.module.css';

const Login = () => {
  return (
    <div className={styles.container}>
      <h2>Logowanie</h2>
      <p>Zaloguj się, aby uzyskać dostęp do pełnej funkcjonalności portalu.</p>
    </div>
  );
};

export default Login;