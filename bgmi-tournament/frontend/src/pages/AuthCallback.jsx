import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const error = params.get('error');
    if (error) {
      toast.error('Google login failed. Try again.');
      navigate('/login');
      return;
    }

    // Read token from hash fragment e.g. /auth/callback#token=xxx
    const hash = window.location.hash; // "#token=xxx"
    const token = hash.startsWith('#token=') ? hash.slice(7) : null;

    // Clear the hash from URL immediately
    window.history.replaceState(null, '', window.location.pathname);

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/users/me').then(res => {
        login(token, res.data);
        toast.success(`Welcome, ${res.data.name}! 🎮`);
        navigate(res.data.role === 'admin' ? '/admin' : '/tournaments');
      }).catch(() => {
        toast.error('Authentication failed');
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-[90vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-400">Signing you in with Google...</p>
      </div>
    </div>
  );
}
