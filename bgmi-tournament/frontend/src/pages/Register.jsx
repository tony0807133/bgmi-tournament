import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', bgmiId: '', bgmiName: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Already logged in — redirect
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', form);
      login(data.token, data.user);
      toast.success('Account created! Welcome to BGMI Arena 🎮');
      navigate('/tournaments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl shadow-orange-500/30 mb-4 text-2xl">
            🎮
          </div>
          <h1 className="text-3xl font-black">Join the Arena</h1>
          <p className="text-gray-500 mt-1 text-sm">Create your BGMI Arena account</p>
        </div>

        <div className="card glow-orange">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                <input className="input" placeholder="John Doe" {...f('name')} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Phone</label>
                <input className="input" placeholder="9876543210" {...f('phone')} required />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Email</label>
              <input className="input" type="email" placeholder="your@email.com" {...f('email')} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <input className="input pr-10" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" {...f('password')} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">BGMI ID</label>
                <input className="input" placeholder="5123456789" {...f('bgmiId')} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">BGMI Name</label>
                <input className="input" placeholder="ProPlayer123" {...f('bgmiName')} required />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-base mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm mb-4">or sign up with</p>
            <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`}
              className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
            <p className="text-gray-500 text-sm mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
