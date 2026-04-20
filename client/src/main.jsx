import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ToolProvider } from './context/ToolContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ToolProvider>
        <App />
        <Toaster position="top-right" />
      </ToolProvider>
    </AuthProvider>
  </React.StrictMode>,
);