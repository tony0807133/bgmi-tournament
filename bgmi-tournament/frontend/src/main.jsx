import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Always point axios to the backend — env var in dev, hardcoded fallback in prod
axios.defaults.baseURL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.split(',')[0].trim()
  : 'https://bgmi-backend-2cnu.onrender.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#fff', border: '1px solid #f97316' } }} />
    </AuthProvider>
  </BrowserRouter>
);
