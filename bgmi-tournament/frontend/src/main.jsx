import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

// In production, point to the deployed backend URL
if (import.meta.env.VITE_API_URL) {
  // Take only the first URL in case of comma-separated values
  axios.defaults.baseURL = import.meta.env.VITE_API_URL.split(',')[0].trim();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#fff', border: '1px solid #f97316' } }} />
    </AuthProvider>
  </BrowserRouter>
);
