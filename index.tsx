import React from 'react';
import { createRoot } from 'react-dom/client';
import './src/index.css';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { NotificationProvider } from './contexts/NotificationContext';

import { BrowserRouter } from 'react-router-dom';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <DatabaseProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </DatabaseProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element.");
}