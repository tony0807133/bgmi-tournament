import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', bgmiId: '', bgmiName: '', referralCode: '' });
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
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Referral Code <span className="text-gray-600 normal-case font-normal">(optional — get ₹20 bonus)</span>
              </label>
              <input className="input" placeholder="e.g. AB12CD34" {...f('referralCode')} />
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
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
