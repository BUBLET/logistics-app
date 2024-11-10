import React from 'react';
import { createRoot } from 'react-dom/client'; // Импорт createRoot из react-dom/client
import App from './App';
import { CssBaseline } from '@mui/material';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);
