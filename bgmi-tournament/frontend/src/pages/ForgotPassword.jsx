import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl shadow-orange-500/30 mb-4 text-2xl">
            🔐
          </div>
          <h1 className="text-3xl font-black">Forgot Password</h1>
          <p className="text-gray-500 mt-1 text-sm">We'll send a reset link to your email</p>
        </div>

        <div className="card glow-orange">
          {sent ? (
            <div className="text-center py-4 space-y-3">
              <div className="text-5xl">📧</div>
              <p className="font-bold text-white">Check your inbox</p>
              <p className="text-gray-400 text-sm">If an account exists for <span className="text-orange-400">{email}</span>, a reset link has been sent. It expires in 1 hour.</p>
              <Link to="/login" className="btn-primary w-full py-3 block mt-4 text-center">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Registered Email</label>
                <input
                  className="input" type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3 text-base mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Sending...
                  </span>
                ) : 'Send Reset Link →'}
              </button>
              <div className="text-center pt-2">
                <Link to="/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Back to Login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
