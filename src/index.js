import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './authContext'; // Importa il provider AuthContext

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
